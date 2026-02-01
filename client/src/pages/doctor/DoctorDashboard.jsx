import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { LineChart, BarChart, DonutChart } from '../../components/common/Charts.jsx';
import { doctorApi } from '../../api/doctorApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useSocketContext } from '../../context/SocketContext.jsx';
import { formatTime, formatName } from '../../utils/format.js';
import {
  FaCalendarCheck,
  FaClock,
  FaUserInjured,
  FaClipboardList,
  FaStethoscope,
  FaPrescriptionBottleAlt,
  FaFileMedical,
  FaEye,
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocketContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, weekly, monthly, distribution, schedule] = await Promise.all([
          doctorApi.getDashboardStats(),
          doctorApi.getWeeklyConsultations(),
          doctorApi.getMonthlyTrends(),
          doctorApi.getAppointmentStatusDistribution(),
          doctorApi.getTodaySchedule(),
        ]);

        setStats(statsData);
        setWeeklyData(weekly);
        setMonthlyTrends(monthly);
        setStatusDistribution(distribution);
        setTodaySchedule(schedule);
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('appointment_created', () => {
      setStats((prev) => prev ? { ...prev, pendingRequests: prev.pendingRequests + 1 } : prev);
    });

    socket.on('appointment_updated', () => {
      // Refresh stats
      doctorApi.getDashboardStats().then(setStats);
    });

    return () => {
      socket.off('appointment_created');
      socket.off('appointment_updated');
    };
  }, [socket]);

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentTimePercent = ((currentHour - 9) * 60 + currentMinutes) / (9 * 60); // 9 AM to 6 PM

  return (
    <DashboardLayout
      title="Doctor Dashboard"
      subtitle="Analytics overview and today's schedule"
    >
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center gap-6 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 p-6 shadow-lg text-white">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-white/20 ring-4 ring-white/30">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-3xl font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, Dr. {user?.lastName || 'Doctor'}!
              </h2>
              <p className="text-blue-100">
                {user?.specialization || 'General Practice'} • Ready to help your patients today
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Today's Appointments"
              value={stats?.todayAppointments || 0}
              helper="Scheduled for today"
              icon={<FaCalendarCheck className="text-blue-600" />}
              trend={stats?.todayTrend}
            />
            <StatCard
              label="Upcoming"
              value={stats?.upcomingAppointments || 0}
              helper="Next 7 days"
              icon={<FaClock className="text-teal-600" />}
            />
            <StatCard
              label="Pending Requests"
              value={stats?.pendingRequests || 0}
              helper="Awaiting response"
              icon={<FaClipboardList className="text-orange-600" />}
            />
            <StatCard
              label="Patients This Month"
              value={stats?.patientsThisMonth || 0}
              helper="Total consultations"
              icon={<FaUserInjured className="text-green-600" />}
            />
          </div>

          {/* Analytics Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly Consultations */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Weekly Consultations</h3>
                <div className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  Last 7 days
                </div>
              </div>
              <BarChart
                data={weeklyData}
                height={280}
                color="rgb(59, 130, 246)"
              />
            </div>

            {/* Appointment Status Distribution */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Appointment Status</h3>
                <p className="text-sm text-slate-500">Distribution breakdown</p>
              </div>
              <div className="flex items-center justify-center py-4">
                <DonutChart
                  data={statusDistribution}
                  size={220}
                  strokeWidth={35}
                />
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Monthly Appointment Trends</h3>
                <p className="text-sm text-slate-500">Completed vs Cancelled appointments</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <span className="text-slate-600">Cancelled</span>
                </div>
              </div>
            </div>
            <LineChart
              data={monthlyTrends}
              height={280}
              smooth={true}
            />
          </div>

          {/* Today's Schedule & Quick Actions */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Today's Schedule */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Today's Schedule</h3>
                <span className="text-sm text-slate-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>

              {todaySchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <FaCalendarCheck className="mb-3 text-4xl" />
                  <p>No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Time indicator line */}
                  {currentHour >= 9 && currentHour < 18 && (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                      style={{ top: `${currentTimePercent * 100}%` }}
                    >
                      <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-red-500"></div>
                      <span className="absolute -top-3 right-0 text-xs font-medium text-red-500">
                        Now
                      </span>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-4">
                    {todaySchedule.map((appointment, idx) => {
                      const time = new Date(appointment.appointmentDate);
                      return (
                        <div
                          key={idx}
                          className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:shadow-sm"
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-semibold text-slate-900">
                              {formatTime(time)}
                            </span>
                            <span className="text-xs text-slate-500">
                              {appointment.duration || 30}m
                            </span>
                          </div>
                          <div className="h-full w-px bg-slate-300"></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-slate-900">
                                  {formatName(appointment.patient)}
                                </h4>
                                <p className="text-sm text-slate-600">{appointment.reason}</p>
                                <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  {appointment.type || 'Consultation'}
                                </span>
                              </div>
                              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h3>
              <div className="space-y-3">
                <button className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-left text-white shadow-md transition hover:from-blue-700 hover:to-blue-800">
                  <FaEye className="text-xl" />
                  <div>
                    <div className="font-semibold">View Requests</div>
                    <div className="text-xs text-blue-100">{stats?.pendingRequests || 0} pending</div>
                  </div>
                </button>

                <button className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 p-4 text-left text-white shadow-md transition hover:from-teal-700 hover:to-teal-800">
                  <FaStethoscope className="text-xl" />
                  <div>
                    <div className="font-semibold">Start Consultation</div>
                    <div className="text-xs text-teal-100">Begin patient visit</div>
                  </div>
                </button>

                <button className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 p-4 text-left text-white shadow-md transition hover:from-green-700 hover:to-green-800">
                  <FaPrescriptionBottleAlt className="text-xl" />
                  <div>
                    <div className="font-semibold">Create Prescription</div>
                    <div className="text-xs text-green-100">Write new prescription</div>
                  </div>
                </button>

                <button className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-left text-white shadow-md transition hover:from-purple-700 hover:to-purple-800">
                  <FaFileMedical className="text-xl" />
                  <div>
                    <div className="font-semibold">Patient Records</div>
                    <div className="text-xs text-purple-100">View medical history</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorDashboard;
