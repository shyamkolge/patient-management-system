import { useState } from 'react';
import { AppointmentCard } from './AppointmentCard.jsx';
import { EmptyState } from '../common/EmptyState.jsx';
import { FaCalendarCheck } from 'react-icons/fa';

export const AppointmentHistory = ({
    appointments,
    onCancel,
    onView,
    searchQuery = '',
    typeFilter = 'all',
    paymentFilter = 'all',
}) => {
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'

    // Filter by search query
    const searchFiltered = appointments.filter(appt => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const doctorName = `${appt.doctor?.user?.firstName} ${appt.doctor?.user?.lastName}`.toLowerCase();
        const specialization = appt.doctor?.specialization?.toLowerCase() || '';
        const reason = appt.reason?.toLowerCase() || '';
        return doctorName.includes(query) || specialization.includes(query) || reason.includes(query);
    });

    const typeFiltered = searchFiltered.filter(appt => {
        if (typeFilter === 'all') return true;
        return appt.type === typeFilter;
    });

    const paymentFiltered = typeFiltered.filter(appt => {
        if (paymentFilter === 'all') return true;
        return appt.paymentMode === paymentFilter;
    });

    const filteredAppointments = paymentFiltered.filter(appt => {
        if (filter === 'upcoming') return ['scheduled', 'confirmed', 'pending'].includes(appt.status);
        if (filter === 'past') return appt.status === 'completed';
        if (filter === 'cancelled') return ['cancelled', 'no-show'].includes(appt.status);
        return true;
    });

    // Sort: Upcoming should show nearest first. Past should show most recent first.
    const sortedAppointments = [...filteredAppointments].sort((a, b) => {
        const dateA = new Date(a.appointmentDate);
        const dateB = new Date(b.appointmentDate);
        return filter === 'upcoming' ? dateA - dateB : dateB - dateA;
    });

    const tabs = [
        { id: 'upcoming', label: 'Upcoming', count: paymentFiltered.filter(a => ['scheduled', 'confirmed', 'pending'].includes(a.status)).length },
        { id: 'past', label: 'Past', count: paymentFiltered.filter(a => a.status === 'completed').length },
        { id: 'cancelled', label: 'Cancelled', count: paymentFiltered.filter(a => ['cancelled', 'no-show'].includes(a.status)).length },
    ];

    return (
        <div className="space-y-6">
            <div className="flex gap-3 border-b border-slate-200 overflow-x-auto pb-px">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium transition-all relative whitespace-nowrap ${
                            filter === tab.id
                                ? 'text-slate-900 border-b-2 border-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {sortedAppointments.length === 0 ? (
                    <div className="py-12">
                        <EmptyState
                            title={`No ${filter} appointments`}
                            description="You don't have any appointments in this category."
                            icon={<FaCalendarCheck className="w-12 h-12 text-slate-300" />}
                        />
                    </div>
                ) : (
                    sortedAppointments.map(appt => (
                        <AppointmentCard
                            key={appt._id}
                            appointment={appt}
                            onCancel={onCancel}
                            onView={onView}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
