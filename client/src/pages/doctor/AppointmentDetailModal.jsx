import { useState } from 'react';
import { FaTimes, FaCheck, FaBan, FaCalendarAlt, FaClock, FaPhone, FaVideo, FaStethoscope, FaUser, FaEnvelope, FaMapMarkerAlt, FaHeartbeat, FaExclamationCircle } from 'react-icons/fa';
import { Badge } from '../../components/common/Badge.jsx';
import { formatDate, formatTime, formatName } from '../../utils/format.js';
import { ToastContainer, toast } from 'react-toastify';

const statusColors = {
  pending: 'warning',
  scheduled: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'danger',
  'no-show': 'danger',
  'in-progress': 'info',
};

const AppointmentDetailModal = ({ 
  appointment, 
  isOpen, 
  onClose, 
  onConfirm, 
  onReject, 
  onStartConsultation,
  loading 
}) => {
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedReason, setSelectedReason] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: ''
  });

  const cancelReasonOptions = [
    { id: 'doctor-unavailable', label: 'Doctor Unavailable', icon: '🏥' },
    { id: 'patient-request', label: 'Patient Requested', icon: '👤' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'scheduling-conflict', label: 'Scheduling Conflict', icon: '⏰' },
    { id: 'other', label: 'Other', icon: '📝' },
  ];

  if (!isOpen || !appointment) return null;

  const appointmentDate = new Date(appointment.appointmentDate);
  const handleConfirm = () => {
    onConfirm(appointment._id);
    setTimeout(() => onClose(), 500);
  };

  const handleCancelSubmit = () => {
    if (!selectedReason && !cancelReason.trim()) {
      toast.warning('Please select a reason or provide details');
      return;
    }
    
    const finalReason = selectedReason 
      ? `${cancelReasonOptions.find(r => r.id === selectedReason)?.label}${cancelReason ? ': ' + cancelReason : ''}`
      : cancelReason;
    
    // Call reject with the constructed reason
    onReject(appointment._id, finalReason);
    toast.success('Appointment cancelled successfully');
    setShowCancelForm(false);
    setCancelReason('');
    setSelectedReason(null);
    setTimeout(() => onClose(), 500);
  };

  const handleReject = () => {
    setShowCancelForm(true);
  };

  const handleStartConsultation = () => {
    onStartConsultation(appointment._id);
  };

  const handleReschedule = () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.warning('Please select both date and time');
      return;
    }
    // TODO: Implement reschedule API call
    toast.info('Reschedule feature coming soon');
    setShowRescheduleForm(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
            <h2 className="text-xl font-bold">Appointment Details</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-white/20 transition"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Status</h3>
              <Badge tone={statusColors[appointment.status] || 'default'}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>

            {/* Patient Information */}
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Patient Information</h4>
              
              {/* Patient Name */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaUser className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Patient Name</p>
                  <p className="font-semibold text-slate-900">
                    {formatName(appointment.patient?.user)}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                  <FaEnvelope className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                  <p className="font-medium text-slate-700">{appointment.patient?.user?.email || 'N/A'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaPhone className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Phone</p>
                  <p className="font-medium text-slate-700">{appointment.patient?.user?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Blood Group */}
              {appointment.patient?.bloodGroup && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                    <FaHeartbeat className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Blood Group</p>
                    <p className="font-medium text-slate-700">{appointment.patient.bloodGroup}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Appointment Information */}
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Appointment Information</h4>

              {/* Date */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaCalendarAlt className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Date</p>
                  <p className="font-medium text-slate-700">{formatDate(appointmentDate)}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-teal-100 flex items-center justify-center">
                  <FaClock className="text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Time</p>
                  <p className="font-medium text-slate-700">{formatTime(appointmentDate)}</p>
                </div>
              </div>

              {/* Type */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
                  {appointment.type === 'video' ? (
                    <FaVideo className="text-purple-600" />
                  ) : appointment.type === 'phone' ? (
                    <FaPhone className="text-purple-600" />
                  ) : (
                    <FaStethoscope className="text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Type</p>
                  <p className="font-medium text-slate-700 capitalize">{appointment.type || 'In-person'}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Reason for Visit</p>
                <p className="font-medium text-slate-700">{appointment.reason}</p>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Additional Notes</p>
                  <p className="font-medium text-slate-700">{appointment.notes}</p>
                </div>
              )}
            </div>

            {/* Cancel Form */}
            {showCancelForm && (
              <div className="space-y-4 rounded-xl bg-red-50 p-4 border-2 border-red-200">
                <div className="flex items-center gap-2">
                  <FaExclamationCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-slate-900">Cancel Appointment</h4>
                </div>
                
                <p className="text-sm text-slate-600">Please select or provide a reason for cancellation:</p>

                {/* Quick Reason Selection */}
                <div className="grid gap-2 md:grid-cols-2">
                  {cancelReasonOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedReason(selectedReason === option.id ? null : option.id)}
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                        selectedReason === option.id
                          ? 'border-red-500 bg-red-100 text-red-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-red-300'
                      }`}
                    >
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Additional Details */}
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Add additional details (optional)..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                  rows="3"
                />

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelSubmit}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                    disabled={!selectedReason && !cancelReason.trim()}
                  >
                    <FaTimes className="h-4 w-4" />
                    Confirm Cancellation
                  </button>
                  <button
                    onClick={() => {
                      setShowCancelForm(false);
                      setCancelReason('');
                      setSelectedReason(null);
                    }}
                    className="flex-1 rounded-lg border-2 border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}

            {/* Reschedule Form */}
            {showRescheduleForm && (
              <div className="space-y-3 rounded-xl bg-blue-50 p-4 border border-blue-200">
                <h4 className="font-semibold text-slate-900">Reschedule Appointment</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="time"
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer - Action Buttons */}
          <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <div className="space-y-3">
              {/* Primary Actions */}
              {(appointment.status === 'scheduled' || appointment.status === 'pending') && (
                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    <FaCheck className="h-5 w-5" />
                    Confirm Appointment
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-600 px-4 py-3 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <FaTimes className="h-5 w-5" />
                    Cancel
                  </button>
                </div>
              )}

              {appointment.status === 'confirmed' && (
                <button
                  onClick={handleStartConsultation}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <FaStethoscope className="h-5 w-5" />
                  Start Consultation
                </button>
              )}

              {/* Secondary Actions */}
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  onClick={() => setShowRescheduleForm(!showRescheduleForm)}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <FaCalendarAlt className="h-5 w-5" />
                  {showRescheduleForm ? 'Cancel' : 'Reschedule'}
                </button>
                <button
                  onClick={() => toast.info('Marking as not available coming soon')}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <FaBan className="h-5 w-5" />
                  Not Available
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" theme="colored" />
    </>
  );
};

export default AppointmentDetailModal;
