import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { doctorApi } from '../../api/doctorApi.js';
import { formatName } from '../../utils/format.js';
import {
  FaChevronLeft,
  FaChevronRight,
  FaClock,
} from 'react-icons/fa';

const DoctorSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); // For calendar navigation
  const [appointments, setAppointments] = useState([]);

  // Load schedule when the view month changes
  useEffect(() => {
    loadMonthSchedule();
  }, [viewDate]);

  const [availability, setAvailability] = useState([]);

  const loadMonthSchedule = async () => {
    try {
      setLoading(true);
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();

      // Get full month range
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const data = await doctorApi.getSchedule(startDate.toISOString(), endDate.toISOString());

      // Handle both formats if data structure varies
      const appts = data.appointments || (Array.isArray(data) ? data : []) || [];
      const avail = data.availability || [];

      setAppointments(appts);
      setAvailability(avail);
    } catch (error) {
      console.error('Load schedule error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    const days = [];
    // Padding for empty start days
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setViewDate(newDate);
  };

  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const hasAppointment = (date) => {
    return appointments.some(apt => isSameDay(new Date(apt.appointmentDate), date));
  };

  // Check if a specific time is within working hours for that day
  const isTimeAvailable = (date, hour, minute) => {
    if (availability.length === 0) return true; // Default to available if no settings

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedule = availability.find(a => a.day === dayName);

    if (!daySchedule) return false; // Not working on this day

    // Parse start/end times (e.g. "09:00", "17:00")
    if (!daySchedule.startTime || !daySchedule.endTime) return true;

    const [startH, startM] = daySchedule.startTime.split(':').map(Number);
    const [endH, endM] = daySchedule.endTime.split(':').map(Number);

    const timeInMinutes = hour * 60 + minute;
    const startInMinutes = startH * 60 + startM;
    const endInMinutes = endH * 60 + endM;

    return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
  };

  // Generate 30-min slots from 08:00 to 20:00 (adjustable range)
  const getDaySlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 20;

    for (let h = startHour; h < endHour; h++) {
      slots.push({ hour: h, minute: 0 });
      slots.push({ hour: h, minute: 30 });
    }

    return slots.map(slot => {
      const slotTime = new Date(selectedDate);
      slotTime.setHours(slot.hour, slot.minute, 0, 0);

      // Find appointment starting at this time (approximate match within loop)
      const appointment = appointments.find(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return isSameDay(aptDate, selectedDate) &&
          aptDate.getHours() === slot.hour &&
          aptDate.getMinutes() === slot.minute;
      });

      // Check real availability
      const isUnavailable = !isTimeAvailable(selectedDate, slot.hour, slot.minute);

      return {
        time: slotTime,
        label: slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        appointment,
        isUnavailable,
      };
    });
  };

  const slots = getDaySlots();
  const availableCount = slots.filter(s => !s.appointment && !s.isUnavailable).length;

  return (
    <DashboardLayout
      title="" // Empty title to match clean look or "Schedule"
      subtitle=""
    >
      <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[600px]">
        {/* Left Panel: Calendar */}
        <div className="w-full lg:w-[350px] shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-800">
                {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                >
                  <FaChevronLeft size={14} />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs text-slate-400 font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-4">
              {getDaysInMonth(viewDate).map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} />;

                const isSelected = isSameDay(date, selectedDate);
                const hasApt = hasAppointment(date);
                const isToday = isSameDay(date, new Date());

                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => setSelectedDate(date)}
                      className={`
                        w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all
                        ${isSelected
                          ? 'bg-[#00BFA5] text-white shadow-md shadow-teal-200'
                          : 'text-slate-700 hover:bg-slate-50'
                        }
                      `}
                    >
                      {date.getDate()}
                    </button>
                    {hasApt && !isSelected && (
                      <div className="w-1 h-1 rounded-full bg-[#00BFA5]" />
                    )}
                    {isSelected && (
                      <div className="w-1 h-1 rounded-full bg-white/50" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Schedule List */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-medium">
                {availableCount} slots available
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {slots.map((slot, idx) => {
                  if (slot.appointment) {
                    // Booked Slot
                    return (
                      <div key={idx} className="group relative overflow-hidden bg-cyan-50/50 rounded-2xl border border-cyan-100 p-4 transition-all hover:shadow-sm">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#00BFA5]" />
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pl-3">
                          <div className="flex items-start gap-6">
                            <div className="flex items-center gap-2 text-slate-500 font-medium min-w-[80px]">
                              <FaClock className="text-[#00BFA5]" />
                              {slot.label}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 text-lg">
                                {formatName(slot.appointment.patient)}
                              </h3>
                              <p className="text-slate-500 text-sm">
                                {slot.appointment.type || 'Consultation'} • {slot.appointment.duration || 30}min
                              </p>
                            </div>
                          </div>
                          <span className="bg-[#00BFA5]/10 text-[#00BFA5] px-4 py-1.5 rounded-lg text-sm font-semibold">
                            Booked
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (slot.isUnavailable) {
                    // Unavailable Slot
                    return (
                      <div key={idx} className="bg-white rounded-2xl p-4 opacity-50">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-slate-400 font-medium min-w-[80px]">
                            <FaClock />
                            {slot.label}
                          </div>
                          <span className="text-slate-400 font-medium">
                            Unavailable
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Available Slot
                  return (
                    <div key={idx} className="group bg-white rounded-2xl border border-slate-100 p-4 hover:border-slate-300 transition-all">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-6 w-full sm:w-auto">
                          <div className="flex items-center gap-2 text-slate-500 font-medium min-w-[80px]">
                            <FaClock className="text-slate-400 group-hover:text-[#00BFA5] transition-colors" />
                            {slot.label}
                          </div>
                          <span className="text-slate-500 group-hover:text-slate-700">
                            Available for booking
                          </span>
                        </div>
                        <button className="w-full sm:w-auto px-6 py-2 rounded-xl border border-[#00BFA5] text-[#00BFA5] font-medium hover:bg-[#00BFA5] hover:text-white transition-all duration-200">
                          Book Slot
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorSchedule;
