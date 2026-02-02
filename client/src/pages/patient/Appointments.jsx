import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { api } from '../../services/api.js';
import { formatName } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';
import { AppointmentHistory } from '../../components/appointments/AppointmentHistory.jsx';
import { AppointmentRequestForm } from '../../components/appointments/AppointmentRequestForm.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';

const PatientAppointments = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const patientId = profile?._id;

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const loadData = async () => {
    try {
      const [appts, docs] = await Promise.all([
        api.get('/appointments?limit=50'), // Fetch more for history
        api.get('/doctors?limit=50'),
      ]);
      setAppointments(appts.data.appointments || []);
      setDoctors(docs.data.doctors || []);
    } catch (err) {
      console.error("Failed to load data", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleView = (appointmentId) => {
    navigate(`/patient/appointments/${appointmentId}`);
  };

  const handleCancel = async (appointmentId) => {
    // Logic for cancellation 
    // Ideally show a modal for reason, but for now simple cancel or use existing modal logic if we want to port it
    // Let's implement a simple prompt for now or just the API call
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: 'cancelled', cancelReason: 'Patient cancelled via dashboard' });
      toast.success("Appointment cancelled");
      loadData();
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };

  const handleCreateSubmit = async (formData) => {
    if (!patientId) {
      toast.error('Patient profile not found.');
      return;
    }
    setSubmitting(true);

    const submitToApi = async (data) => {
      await api.post('/appointments', {
        patient: patientId,
        ...data
      });
    };

    try {
      if (formData.paymentMode === 'online') {
        const orderData = await api.post('/payment/order', { doctorId: formData.doctor });

        if (!orderData.success) throw new Error('Could not create payment order');

        const options = {
          key: orderData.key_id,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "Patient Management System",
          description: "Appointment Booking Fee",
          order_id: orderData.order.id,
          handler: async function (response) {
            try {
              // First verify payment and send receipt email
              await api.post('/payment/verify', {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                doctorId: formData.doctor
              });

              // Then create appointment
              await submitToApi({
                ...formData,
                paymentResult: response
              });
              toast.success("✅ Payment successful! Receipt sent to your email.");
              loadData();
              setSubmitting(false);
              setShowBookingModal(false);
              // Reset form after successful booking
              window.dispatchEvent(new CustomEvent('resetAppointmentForm'));
            } catch (e) {
              toast.error("Booking failed after payment");
              setSubmitting(false);
            }
          },
          prefill: {
            name: formatName(profile),
            email: profile.email,
            contact: profile.phone
          },
          theme: { color: "#0f172a" },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(response.error.description);
          setSubmitting(false);
        });
        rzp.open();

      } else {
        await submitToApi(formData);
        toast.success("Appointment booked successfully!");
        loadData();
        setSubmitting(false);
        setShowBookingModal(false);
        // Reset form after successful booking
        window.dispatchEvent(new CustomEvent('resetAppointmentForm'));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Unable to booking appointment');
      setSubmitting(false);
    }
  };

  const hasActiveFilters = typeFilter !== 'all' || paymentFilter !== 'all';

  return (
    <DashboardLayout 
      title="Appointments" 
      subtitle="Manage your upcoming and past appointments"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-3 mt-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-3 border rounded-lg font-medium transition-all text-sm md:text-base whitespace-nowrap ${
              showFilters || hasActiveFilters
                ? 'border-cyan-500 bg-cyan-50 text-cyan-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FaFilter className="text-sm" />
            <span>Filter</span>
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="video">Video</option>
                  <option value="phone">Phone</option>
                  <option value="in-person">In-person</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="all">All Payments</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setTypeFilter('all');
                  setPaymentFilter('all');
                }}
                className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <AppointmentHistory
            appointments={appointments}
            onCancel={handleCancel}
            onView={handleView}
            searchQuery={searchQuery}
            typeFilter={typeFilter}
            paymentFilter={paymentFilter}
          />
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900">Book New Appointment</h2>
                <p className="text-xs md:text-sm text-slate-500">Schedule your visit with our specialists</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl md:text-3xl font-light leading-none"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-70px)] md:max-h-[calc(90vh-80px)]">
              <AppointmentRequestForm
                doctors={doctors}
                onSubmit={handleCreateSubmit}
                loading={submitting}
              />
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" theme="colored" />

      {/* Floating Book Appointment Button */}
      <button
        onClick={() => setShowBookingModal(true)}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 flex items-center justify-center gap-2 px-4 sm:px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium shadow-lg shadow-slate-900/30 transition-all"
      >
        <FaPlus className="text-sm" />
        Book Appointment
      </button>
    </DashboardLayout>
  );
};

export default PatientAppointments;
