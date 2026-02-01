import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { doctorApi } from '../../api/doctorApi.js';
import { formatDate, formatName } from '../../utils/format.js';
import { useSocketContext } from '../../context/SocketContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaPhone,
  FaVideo,
  FaStethoscope,
  FaEye,
  FaSearch,
  FaFilter,
} from 'react-icons/fa';

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'danger',
  'no-show': 'danger',
};

const DoctorAppointments = () => {
  const { socket } = useSocketContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, requests, upcoming, past
  const [allAppointments, setAllAppointments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // all, video, phone, in-person
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('appointment_created', () => {
      loadAppointments();
    });

    socket.on('appointment_updated', (updated) => {
      setRequests((prev) => prev.filter((a) => a._id !== updated._id));
      setUpcoming((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );
      setPast((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );
    });

    return () => {
      socket.off('appointment_created');
      socket.off('appointment_updated');
    };
  }, [socket]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const [allData, requestsData, upcomingData, pastData] = await Promise.all([
        doctorApi.getAllAppointments({ limit: 100 }),
        doctorApi.getAppointmentRequests(),
        doctorApi.getUpcomingAppointments(),
        doctorApi.getPastAppointments({ limit: 20 }),
      ]);

      setAllAppointments(allData || []);
      setRequests(requestsData.appointments || requestsData || []);
      setUpcoming(upcomingData.appointments || upcomingData || []);
      setPast(pastData.appointments || pastData || []);
    } catch (error) {
      console.error('Load appointments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = (appointments) => {
    return appointments.filter((appointment) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        formatName(appointment.patient?.user).toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.patient?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.reason?.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = selectedType === 'all' || appointment.type === selectedType;

      return matchesSearch && matchesType;
    });
  };

  const openAppointmentDetails = (appointmentId) => {
    navigate(`/doctor/appointments/${appointmentId}`);
  };

  const AppointmentCard = ({ appointment }) => {
    const appointmentDate = new Date(appointment.appointmentDate);

    return (
      <div
        onClick={() => openAppointmentDetails(appointment._id)}
        className="cursor-pointer rounded-lg md:rounded-xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm transition hover:shadow-md"
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 md:gap-4">
          {/* Patient Avatar */}
          <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xs sm:text-sm font-semibold text-blue-700">
            {appointment.patient?.user?.firstName?.charAt(0)}
            {appointment.patient?.user?.lastName?.charAt(0)}
          </div>

          {/* Patient & Appointment Info */}
          <div className="flex-1 min-w-0 grow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-1 mb-1">
              <h4 className="font-semibold text-sm md:text-base text-slate-900 truncate">
                {formatName(appointment.patient?.user)}
              </h4>
              <Badge tone={statusColors[appointment.status] || 'default'}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-slate-500 truncate mb-2">
              {appointment.patient?.user?.email}
            </p>

            <div className="flex flex-wrap gap-2 md:gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <FaCalendarCheck className="text-blue-500 text-xs md:text-sm" />
                <span className="hidden sm:inline">{formatDate(appointmentDate)}</span>
                <span className="sm:hidden">{formatDate(appointmentDate).split('/')[0]}/{formatDate(appointmentDate).split('/')[1]}</span>
              </span>
              <span className="flex items-center gap-1">
                {appointment.type === 'video' ? (
                  <>
                    <FaVideo className="text-purple-500 text-xs md:text-sm" />
                    <span className="hidden sm:inline">Video</span>
                  </>
                ) : appointment.type === 'phone' ? (
                  <>
                    <FaPhone className="text-green-500 text-xs md:text-sm" />
                    <span className="hidden sm:inline">Phone</span>
                  </>
                ) : (
                  <>
                    <FaStethoscope className="text-pink-500 text-xs md:text-sm" />
                    <span className="hidden sm:inline">In-person</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-600 mt-2 line-clamp-1 md:line-clamp-2">
              <span className="font-medium">Reason:</span> {appointment.reason}
            </p>
          </div>

          {/* View Details Button */}
          <button
            onClick={(event) => {
              event.stopPropagation();
              openAppointmentDetails(appointment._id);
            }}
            className="shrink-0 rounded-lg bg-blue-50 p-1.5 md:p-2 text-blue-600 transition hover:bg-blue-100"
            title="View more details"
          >
            <FaEye className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </div>
    );
  };


  return (
    <DashboardLayout
      title="Appointments"
      subtitle="Manage your appointment requests and schedule"
    >
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by patient name, email, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-3.5 text-sm md:text-base border-2 border-slate-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 md:py-2.5 text-sm font-medium rounded-lg border-2 transition ${
                  showFilters || selectedType !== 'all'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FaFilter className="text-sm" />
                <span>Filters</span>
                {selectedType !== 'all' && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">1</span>
                )}
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Type</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedType('all')}
                      className={`px-3 py-1.5 text-xs md:text-sm rounded-lg border-2 transition ${
                        selectedType === 'all'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      All Types
                    </button>
                    <button
                      onClick={() => setSelectedType('video')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm rounded-lg border-2 transition ${
                        selectedType === 'video'
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <FaVideo className="text-xs" />
                      Video
                    </button>
                    <button
                      onClick={() => setSelectedType('phone')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm rounded-lg border-2 transition ${
                        selectedType === 'phone'
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <FaPhone className="text-xs" />
                      Phone
                    </button>
                    <button
                      onClick={() => setSelectedType('in-person')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm rounded-lg border-2 transition ${
                        selectedType === 'in-person'
                          ? 'border-pink-600 bg-pink-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <FaStethoscope className="text-xs" />
                      In-person
                    </button>
                  </div>
                </div>

                {/* Clear Filters */}
                {selectedType !== 'all' && (
                  <button
                    onClick={() => {
                      setSelectedType('all');
                      setSearchQuery('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 md:gap-2 border-b border-slate-200 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium transition border-b-2 whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({allAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium transition border-b-2 whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium transition border-b-2 whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming ({upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium transition border-b-2 whitespace-nowrap ${
                activeTab === 'past'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Past ({past.length})
            </button>
          </div>

          {/* All Tab */}
          {activeTab === 'all' && (
            <div className="space-y-3">
              {filterAppointments(allAppointments).length === 0 ? (
                <EmptyState
                  icon={<FaCalendarCheck />}
                  message={searchQuery || selectedType !== 'all' ? "No appointments match your filters" : "No appointments found"}
                />
              ) : (
                filterAppointments(allAppointments).map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                  />
                ))
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {filterAppointments(requests).length === 0 ? (
                <EmptyState
                  icon={<FaCalendarCheck />}
                  message={searchQuery || selectedType !== 'all' ? "No requests match your filters" : "No pending appointment requests"}
                />
              ) : (
                filterAppointments(requests).map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                  />
                ))
              )}
            </div>
          )}

          {/* Upcoming Tab */}
          {activeTab === 'upcoming' && (
            <div className="space-y-3">
              {filterAppointments(upcoming).length === 0 ? (
                <EmptyState
                  icon={<FaCalendarCheck />}
                  message={searchQuery || selectedType !== 'all' ? "No upcoming appointments match your filters" : "No upcoming appointments"}
                />
              ) : (
                filterAppointments(upcoming).map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                  />
                ))
              )}
            </div>
          )}

          {/* Past Tab */}
          {activeTab === 'past' && (
            <div className="space-y-3">
              {filterAppointments(past).length === 0 ? (
                <EmptyState
                  icon={<FaCalendarCheck />}
                  message={searchQuery || selectedType !== 'all' ? "No past appointments match your filters" : "No past appointments"}
                />
              ) : (
                filterAppointments(past).map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

    </DashboardLayout>
  );
};

export default DoctorAppointments;
