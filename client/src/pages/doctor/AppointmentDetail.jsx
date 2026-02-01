import React from 'react';
import { Badge } from '../../components/common/Badge.jsx';
import { formatDate, formatName } from '../../utils/format.js';

const AppointmentDetail = ({ appointment, onClose }) => {
  if (!appointment) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-slate-500 hover:text-slate-900 text-xl sm:text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-900">Appointment Details</h2>
        <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
          <div>
            <span className="font-semibold text-slate-700">Patient:</span> {formatName(appointment.patient?.user)}
          </div>
          <div>
            <span className="font-semibold text-slate-700">Date:</span> {formatDate(appointment.appointmentDate)}
          </div>
          <div>
            <span className="font-semibold text-slate-700">Time:</span> {appointment.appointmentTime}
          </div>
          <div>
            <span className="font-semibold text-slate-700">Reason:</span> {appointment.reason || 'N/A'}
          </div>
          <div>
            <span className="font-semibold text-slate-700">Status:</span> <Badge tone={appointment.status}>{appointment.status}</Badge>
          </div>
          {appointment.notes && (
            <div>
              <span className="font-semibold text-slate-700">Notes:</span> {appointment.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
