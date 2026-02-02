import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../../api/doctorApi.js';
import { formatDate, formatTime, formatName } from '../../utils/format.js';
import { Spinner } from '../../components/common/Spinner.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaPhone,
  FaVideo,
  FaStethoscope,
  FaExclamationCircle,
  FaEnvelope,
  FaMobileAlt,
  FaTint,
  FaBirthdayCake,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaFileAlt,
  FaHeartbeat,
} from 'react-icons/fa';

const statusColors = {
  pending: 'warning',
  scheduled: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'danger',
  'no-show': 'danger',
};

const cancelReasonOptions = [
  { emoji: '🏥', label: 'Doctor Unavailable', value: 'doctor_unavailable' },
  { emoji: '👤', label: 'Patient Requested', value: 'patient_requested' },
  { emoji: '🚨', label: 'Emergency', value: 'emergency' },
  { emoji: '⏰', label: 'Scheduling Conflict', value: 'scheduling_conflict' },
  { emoji: '📝', label: 'Other', value: 'other' },
];

const AppointmentDetailsPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [reasonDetails, setReasonDetails] = useState('');

  const loadAppointment = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch single appointment
      const appointmentData = await doctorApi.getAppointmentById(appointmentId);
      setAppointment(appointmentData?.data || appointmentData?.appointment || appointmentData);
    } catch (error) {
      console.error('Failed to load appointment:', error);
      toast.error('Failed to load appointment details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [appointmentId, navigate]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  const handleConfirm = async () => {
    try {
      setActionLoading('confirm');
      await doctorApi.updateAppointmentStatus(appointmentId, 'confirmed');
      toast.success('Appointment confirmed!');
      await loadAppointment();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedReason && !reasonDetails.trim()) {
      toast.error('Please select or provide a cancellation reason');
      return;
    }

    try {
      setActionLoading('reject');
      const reason = selectedReason
        ? reasonDetails.trim()
          ? `${cancelReasonOptions.find(r => r.value === selectedReason)?.label}: ${reasonDetails}`
          : cancelReasonOptions.find(r => r.value === selectedReason)?.label
        : reasonDetails;

      await doctorApi.updateAppointmentStatus(appointmentId, 'cancelled', {
        cancelReason: reason,
      });
      toast.success('✓ Appointment cancelled successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => navigate(-1), 500);
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartConsultation = async () => {
    try {
      setActionLoading('consultation');
      console.log('Appointment data:', appointment);
      
      const patientId = appointment?.patient?._id || appointment?.patientId || appointment?.patient?.id;
      
      console.log('Extracted patientId:', patientId);
      
      if (!patientId) {
        console.error('Patient ID not found in appointment:', appointment);
        toast.error('Patient information not found');
        setActionLoading(null);
        return;
      }

      console.log('Navigating to consultation with patientId:', patientId, 'appointmentId:', appointmentId);

      // Navigate to consultation workflow with patient pre-selected
      navigate('/doctor/consultation', {
        state: {
          patientId,
          appointmentId,
          tab: 'diagnosis',
        },
      });
      toast.success('Starting consultation...');
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast.error('Failed to start consultation');
      setActionLoading(null);
    }
  };

  const patient = appointment?.patient?.user || appointment?.patient || {};
  
  
  const getInitials = (user) => {
    if (!user) return 'P';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'P';
  };

  useEffect(() => {
    if (appointment) {
      console.log('Appointment loaded:', appointment);
      console.log('Appointment status:', appointment?.status);
    }
  }, [appointment]);

  return (
    <DashboardLayout title="Appointment Details" subtitle="Review appointment information">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : !appointment ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            Appointment not found
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => navigate('/doctor/appointments')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <FaArrowLeft />
              <span className="font-medium">Back to Appointments</span>
            </button>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Patient Information */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Patient Information</h2>
                  
                  <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                    {/* Avatar */}
                    <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-md overflow-hidden">
                      {patient?.profileImage && patient.profileImage.trim() ? (
                        <img
                          src={patient.profileImage}
                          alt={formatName(patient)}
                          className="h-full w-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!patient?.profileImage || !patient.profileImage.trim() ? (
                        <span>{getInitials(patient)}</span>
                      ) : null}
                    </div>

                    {/* Name and Basic Info */}
                    <div className="flex-1 w-full">
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Name</p>
                        <p className="text-2xl font-bold text-slate-900">{formatName(patient)}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <FaEnvelope className="text-blue-500 text-sm flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium">EMAIL</p>
                            <p className="text-sm text-slate-700 truncate">{patient?.email || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaMobileAlt className="text-blue-500 text-sm flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium">PHONE</p>
                            <p className="text-sm text-slate-700">{patient?.phone || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaTint className="text-red-500 text-sm flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium">BLOOD GROUP</p>
                            <p className="text-sm text-slate-700">{appointment.patient?.bloodGroup || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaBirthdayCake className="text-yellow-500 text-sm flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium">AGE</p>
                            <p className="text-sm text-slate-700">{appointment.patient?.age || '—'} years</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Appointment Information</h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FaCalendarAlt className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">DATE</p>
                        <p className="font-semibold text-slate-900 text-sm">{formatDate(appointment.appointmentDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FaClock className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">TIME</p>
                        <p className="font-semibold text-slate-900 text-sm">{appointment.appointmentTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        {appointment.type === 'video' ? (
                          <FaVideo className="text-purple-600" />
                        ) : appointment.type === 'phone' ? (
                          <FaPhone className="text-purple-600" />
                        ) : (
                          <FaStethoscope className="text-purple-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">TYPE</p>
                        <p className="font-semibold text-slate-900 text-sm capitalize">{appointment.type || 'In-person'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <FaCheckCircle className="text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">STATUS</p>
                        <Badge tone={statusColors[appointment?.status]} className="capitalize text-xs px-2 py-1 inline-block mt-1">
                          {appointment?.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-semibold text-slate-700">REASON FOR VISIT</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <p className="text-slate-700">{appointment.reason || '—'}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">ADDITIONAL NOTES</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-slate-700">{appointment.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Reason */}
                  {appointment?.status === 'cancelled' && appointment?.cancelReason && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="font-semibold text-red-700 mb-1">Cancellation Reason</p>
                      <p className="text-red-600">{appointment.cancelReason}</p>
                    </div>
                  )}
                </div>

                {/* Cancel Form Modal */}
                {showCancelForm && ['scheduled', 'pending', 'confirmed'].includes(appointment?.status) && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-in fade-in zoom-in duration-300">
                      <div className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-2xl">
                        <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                          <FaExclamationCircle /> Cancel Appointment
                        </h3>
                      </div>

                      <div className="p-6 space-y-4">
                        <p className="text-slate-600 text-sm">
                          Please select or provide a reason for cancellation:
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          {cancelReasonOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setSelectedReason(option.value)}
                              className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                                selectedReason === option.value
                                  ? 'border-red-600 bg-red-100 text-red-800'
                                  : 'border-red-200 bg-white text-red-700 hover:border-red-400'
                              }`}
                            >
                              <span className="text-lg">{option.emoji}</span> {option.label}
                            </button>
                          ))}
                        </div>

                        {selectedReason === 'other' && (
                          <textarea
                            placeholder="Please provide details about the cancellation..."
                            value={reasonDetails}
                            onChange={(e) => setReasonDetails(e.target.value)}
                            className="w-full p-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-600"
                            rows="3"
                          />
                        )}

                        {selectedReason && selectedReason !== 'other' && (
                          <textarea
                            placeholder="Optional: Add additional details..."
                            value={reasonDetails}
                            onChange={(e) => setReasonDetails(e.target.value)}
                            className="w-full p-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-600"
                            rows="2"
                          />
                        )}
                      </div>

                      <div className="flex gap-3 p-6 border-t border-slate-200">
                        <button
                          onClick={handleReject}
                          disabled={actionLoading === 'reject'}
                          className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold transition flex items-center justify-center gap-2"
                        >
                          {actionLoading === 'reject' ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <FaTimes /> Confirm Cancellation
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowCancelForm(false);
                            setSelectedReason(null);
                            setReasonDetails('');
                          }}
                          className="flex-1 bg-slate-200 text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-300 font-semibold transition"
                        >
                          Go Back
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Actions */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 sticky top-6">
                  <h3 className="font-bold text-slate-900 text-lg">Actions</h3>

                  {/* Confirm Button */}
                  {['pending', 'scheduled'].includes(appointment?.status) && (
                    <button
                      onClick={handleConfirm}
                      disabled={actionLoading === 'confirm'}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md hover:shadow-lg disabled:bg-gray-400"
                    >
                      {actionLoading === 'confirm' ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          Confirm Appointment
                        </>
                      )}
                    </button>
                  )}

                  {/* Start Consultation Button */}
                  {appointment?.status === 'confirmed' && (
                    <button
                      onClick={handleStartConsultation}
                      disabled={actionLoading === 'consultation'}
                      className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md hover:shadow-lg disabled:bg-gray-400"
                    >
                      {actionLoading === 'consultation' ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <FaVideo />
                          Start Consultation
                        </>
                      )}
                    </button>
                  )}

                  {/* Cancel Button */}
                  {['pending', 'scheduled', 'confirmed'].includes(appointment?.status) && (
                    <button
                      onClick={() => setShowCancelForm(!showCancelForm)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 border-2 border-red-400 text-red-600 font-semibold py-3 px-4 rounded-lg hover:bg-red-50 transition disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400"
                    >
                      <FaTimes /> Cancel Appointment
                    </button>
                  )}

                  {/* Go Back Button */}
                  <button
                    onClick={() => navigate('/doctor/appointments')}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg transition"
                  >
                    <FaArrowLeft />
                    Go Back
                  </button>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Quick Actions</p>
                    <div className="space-y-2">
                      <button className="w-full flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium text-sm p-2 rounded hover:bg-slate-50 transition">
                        <FaFileAlt className="text-slate-400" />
                        View Medical Records
                      </button>
                      <button className="w-full flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium text-sm p-2 rounded hover:bg-slate-50 transition">
                        <FaHeartbeat className="text-slate-400" />
                        Add Prescription
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) }
      </div>
    </DashboardLayout>
  );
};

export default AppointmentDetailsPage;
