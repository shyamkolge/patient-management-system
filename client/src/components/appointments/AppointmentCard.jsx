import { Badge } from '../common/Badge.jsx';
import { formatDate, formatName } from '../../utils/format.js';
import { FaUserMd, FaCalendarAlt, FaClock, FaVideo } from 'react-icons/fa';

const statusTone = (status) => {
    switch (status) {
        case 'confirmed': return 'success';
        case 'completed': return 'info';
        case 'pending': return 'warning';
        case 'cancelled':
        case 'no-show': return 'danger';
        default: return 'warning';
    }
};

export const AppointmentCard = ({ appointment, onCancel, onView, onReschedule }) => {
    const isUpcoming = ['scheduled', 'confirmed', 'pending'].includes(appointment.status);
    const doctor = appointment.doctor;

    // Format date to show relative date like "Tomorrow"
    const formatAppointmentDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return formatDate(dateStr);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left: Doctor Info */}
                <div className="flex items-center gap-3 md:gap-4 flex-1 w-full sm:w-auto">
                    {/* Doctor Avatar */}
                    <div className="relative flex-shrink-0">
                        {doctor?.user?.profileImage ? (
                            <img 
                                src={doctor.user.profileImage} 
                                alt={formatName(doctor.user)}
                                className="h-12 w-12 md:h-14 md:w-14 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-slate-100 flex items-center justify-center">
                                <FaUserMd className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />
                            </div>
                        )}
                        {appointment.type === 'video' && (
                            <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white p-1 md:p-1.5 rounded-full">
                                <FaVideo className="h-2 w-2 md:h-2.5 md:w-2.5" />
                            </div>
                        )}
                    </div>

                    {/* Doctor Details */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-base md:text-lg truncate">{formatName(doctor?.user)}</h3>
                        <p className="text-xs md:text-sm text-slate-500 truncate">{doctor?.specialization}</p>
                        
                        {/* Date and Time */}
                        <div className="flex items-center gap-3 md:gap-4 mt-1.5 md:mt-2 text-xs md:text-sm text-slate-600">
                            <div className="flex items-center gap-1 md:gap-1.5">
                                <FaCalendarAlt className="text-slate-400 text-xs" />
                                <span>{formatAppointmentDate(appointment.appointmentDate)}</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-1.5">
                                <FaClock className="text-slate-400 text-xs" />
                                <span>{appointment.appointmentTime}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Status and Actions */}
                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                    <Badge tone={statusTone(appointment.status)} className="capitalize text-xs">
                        {appointment.status}
                    </Badge>

                    {onView && appointment.status !== 'cancelled' && appointment.status !== 'no-show' && (
                        <button
                            onClick={() => onView(appointment._id)}
                            className="flex-1 sm:flex-none px-3 md:px-4 py-1.5 md:py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs md:text-sm font-medium rounded-lg transition-colors"
                        >
                            View
                        </button>
                    )}

                    {isUpcoming && appointment.status === 'pending' && (
                        <button
                            className="flex-1 sm:flex-none px-3 md:px-4 py-1.5 md:py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                        >
                            Join Call
                        </button>
                    )}

                    {isUpcoming && (
                        <button
                            onClick={() => onCancel(appointment._id)}
                            className="flex-1 sm:flex-none px-3 md:px-4 py-1.5 md:py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs md:text-sm font-medium rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {appointment.status === 'cancelled' && appointment.cancelReason && (
                <div className="mt-3 md:mt-4 bg-red-50 text-red-700 p-2.5 md:p-3 rounded-lg text-xs md:text-sm">
                    <strong>Cancelled:</strong> {appointment.cancelReason}
                </div>
            )}
        </div>
    );
};
