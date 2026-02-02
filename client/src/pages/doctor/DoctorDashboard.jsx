import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { doctorApi } from '../../api/doctorApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useSocketContext } from '../../context/SocketContext.jsx';
import { formatTime, formatName } from '../../utils/format.js';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FaCalendarCheck,
  FaClock,
  FaUserInjured,
  FaClipboardList,
  FaStethoscope,
  FaPrescriptionBottleAlt,
  FaFileMedical,
  FaEye,
  FaUpload,
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocketContext();
  const navigate = useNavigate();
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

  const openWorkflow = (tab) => navigate('/doctor/consultation', { state: { tab } });

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
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Good morning, Dr. {user?.lastName || 'Doctor'} 👋
            </h1>
            <p className="text-slate-500">
              Here's what's happening with your patients today.
            </p>
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

          {/* Clinical Workflow Options */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Doctor Workflow</h3>
                <p className="text-sm text-slate-500">Structured actions for patient visits</p>
              </div>
              <button
                onClick={() => openWorkflow('diagnosis')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                New Visit
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <button
                onClick={() => openWorkflow('diagnosis')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <FaStethoscope className="text-blue-600 text-xl" />
                <div className="mt-2 font-semibold text-slate-900">Add Diagnosis</div>
                <div className="text-xs text-slate-500">ICD-10 + severity</div>
              </button>
              <button
                onClick={() => openWorkflow('prescription')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-green-300 hover:bg-green-50 transition"
              >
                <FaPrescriptionBottleAlt className="text-green-600 text-xl" />
                <div className="mt-2 font-semibold text-slate-900">Write Prescription</div>
                <div className="text-xs text-slate-500">Dosage + frequency</div>
              </button>
              <button
                onClick={() => openWorkflow('lab')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-amber-300 hover:bg-amber-50 transition"
              >
                <FaFileMedical className="text-amber-600 text-xl" />
                <div className="mt-2 font-semibold text-slate-900">Order Lab Tests</div>
                <div className="text-xs text-slate-500">Checklist + priority</div>
              </button>
              <button
                onClick={() => openWorkflow('notes')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-purple-300 hover:bg-purple-50 transition"
              >
                <FaClipboardList className="text-purple-600 text-xl" />
                <div className="mt-2 font-semibold text-slate-900">Add Doctor Notes</div>
                <div className="text-xs text-slate-500">SOAP format</div>
              </button>
              <button
                onClick={() => openWorkflow('files')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-slate-400 hover:bg-slate-100 transition"
              >
                <FaUpload className="text-slate-700 text-xl" />
                <div className="mt-2 font-semibold text-slate-900">Upload Files</div>
                <div className="text-xs text-slate-500">X-ray, scans</div>
              </button>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly Consultations - Bar Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Weekly Consultations</h3>
                <div className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  Last 7 days
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#1e293b',
                    }}
                    formatter={(value) => [value, 'Consultations']}
                  />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Appointment Status - Pie Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Appointment Status</h3>
                <p className="text-sm text-slate-500">Distribution breakdown</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#1e293b',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-slate-600">
                    Completed <strong>{statusDistribution[0]?.value || 0}%</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-slate-600">
                    Pending <strong>{statusDistribution[1]?.value || 0}%</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-slate-600">
                    Cancelled <strong>{statusDistribution[2]?.value || 0}%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trends - Line Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Monthly Appointment Trends</h3>
                <p className="text-sm text-slate-500">Completed vs Cancelled appointments</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                  <span className="text-slate-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <span className="text-slate-600">Cancelled</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#1e293b',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#06b6d4"
                  dot={{ fill: '#06b6d4', r: 4 }}
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="cancelled"
                  stroke="#f87171"
                  dot={{ fill: '#f87171', r: 4 }}
                  strokeWidth={2}
                  name="Cancelled"
                />
              </LineChart>
            </ResponsiveContainer>
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

                <button
                  onClick={() => openWorkflow('diagnosis')}
                  className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 p-4 text-left text-white shadow-md transition hover:from-teal-700 hover:to-teal-800"
                >
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
