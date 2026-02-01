import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatName } from '../../utils/format.js';
import { FaArrowLeft, FaUserMd, FaCalendarAlt, FaClock, FaVideo, FaPhone, FaStethoscope, FaCheckCircle, FaTimesCircle, FaFileAlt, FaHeartbeat, FaEnvelope, FaMobileAlt, FaTint, FaBirthdayCake } from 'react-icons/fa';

const statusTone = (status) => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'completed':
      return 'info';
    case 'cancelled':
    case 'no-show':
      return 'danger';
    default:
      return 'warning';
  }
};

const PatientAppointmentDetailsPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        const data = res?.data?.appointment || res?.data?.data || res?.data;
        if (!data) {
          throw new Error('Appointment not found');
        }
        setAppointment(data);
      } catch (err) {
        setError(err.message || 'Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [appointmentId]);

  const getInitials = (user) => {
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <DashboardLayout title="Appointment Details" subtitle="Review your appointment information">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        ) : appointment ? (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => navigate('/patient/appointments')}
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
                      {appointment.patient?.user?.profileImage && appointment.patient.user.profileImage.trim() ? (
                        <img
                          src={appointment.patient.user.profileImage}
                          alt={formatName(appointment.patient.user)}
                          className="h-full w-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!appointment.patient?.user?.profileImage || !appointment.patient.user.profileImage.trim() ? (
                        <span>{getInitials(appointment.patient?.user)}</span>
                      ) : null}
                    </div>

                    {/* Name and Basic Info */}
                    <div className="flex-1 w-full">
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Name</p>
                        <p className="text-2xl font-bold text-slate-900">{formatName(appointment.patient?.user)}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <FaEnvelope className="text-blue-500 text-sm flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium">EMAIL</p>
                            <p className="text-sm text-slate-700 truncate">{appointment.patient?.user?.email || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaMobileAlt className="text-blue-500 text-sm flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium">PHONE</p>
                            <p className="text-sm text-slate-700">{appointment.patient?.user?.phone || '—'}</p>
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

                  {/* Doctor Info */}
                  {appointment.doctor && (
                    <div className="pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 mb-4">Doctor Information</h3>
                      <div className="flex items-center gap-4">
                        {appointment.doctor.user?.profileImage ? (
                          <img
                            src={appointment.doctor.user.profileImage}
                            alt={formatName(appointment.doctor.user)}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FaUserMd className="text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{formatName(appointment.doctor.user)}</p>
                          <p className="text-sm text-slate-500">{appointment.doctor.specialization}</p>
                        </div>
                      </div>
                    </div>
                  )}
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
                        <Badge tone={statusTone(appointment.status)} className="capitalize text-xs px-2 py-1 inline-block mt-1">
                          {appointment.status}
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
                  {appointment.status === 'cancelled' && appointment.cancelReason && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="font-semibold text-red-700 mb-1">Cancellation Reason</p>
                      <p className="text-red-600">{appointment.cancelReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 sticky top-6">
                  <h3 className="font-bold text-slate-900 text-lg">Actions</h3>

                  {/* Cancel Button */}
                  {['pending', 'scheduled', 'confirmed'].includes(appointment.status) && (
                    <button className="w-full flex items-center justify-center gap-2 border-2 border-red-400 text-red-600 font-semibold py-3 px-4 rounded-lg hover:bg-red-50 transition">
                      <FaTimesCircle />
                      Cancel Appointment
                    </button>
                  )}

                  {/* Go Back Button */}
                  <button
                    onClick={() => navigate('/patient/appointments')}
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
                        Start Consultation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default PatientAppointmentDetailsPage;
