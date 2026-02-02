import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatName } from '../../utils/format.js';
import { Badge } from '../../components/common/Badge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useSocketContext } from '../../context/SocketContext.jsx';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConsultation, setActiveConsultation] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [appts, records, prescriptions] = await Promise.all([
          api.get('/appointments?limit=5'),
          api.get('/medical-records?limit=1'),
          api.get('/prescriptions?limit=1'),
        ]);

        setStats({
          appointments: appts.data.total,
          records: records.data.total,
          prescriptions: prescriptions.data.total,
        });
        setAppointments(appts.data.appointments || []);
      } catch (error) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    // Consultation Started
    socket.on('consultationStarted', (data) => {
      setActiveConsultation(data);
      toast.info('🔄 Your doctor has started the consultation', {
        position: 'top-right',
        autoClose: 5000,
      });
    });

    // Consultation Ended
    socket.on('consultationEnded', (data) => {
      toast.success('✓ Consultation completed! View your results.', {
        position: 'top-right',
        autoClose: 5000,
        onClick: () => navigate(`/patient/consultation/${data.consultationId}`),
      });
      setActiveConsultation(null);
    });

    // Prescription Created
    socket.on('prescriptionCreated', (data) => {
      toast.info('📄 New prescription available', {
        position: 'top-right',
        autoClose: 3000,
      });
      setStats(prev => prev ? ({ ...prev, prescriptions: prev.prescriptions + 1 }) : prev);
    });

    // Appointment Status Updates
    socket.on('appointment_updated', (updatedAppointment) => {
      setAppointments(prev => prev.map(ppt => ppt._id === updatedAppointment._id ? updatedAppointment : ppt));
    });

    // New Medical Record
    socket.on('medical_record_updated', () => {
      setStats(prev => prev ? ({ ...prev, records: prev.records + 1 }) : prev);
    });

    return () => {
      socket.off('consultationStarted');
      socket.off('consultationEnded');
      socket.off('prescriptionCreated');
      socket.off('appointment_updated');
      socket.off('medical_record_updated');
    };
  }, [socket, navigate]);

  return (
    <DashboardLayout title="Patient Dashboard" subtitle="Your visits and care plan overview">
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          {/* Active Consultation Banner */}
          {activeConsultation && (
            <div className="animate-pulse rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white">
                  🩺
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900">Consultation in Progress</h3>
                  <p className="text-sm text-green-700">
                    Your doctor is reviewing your case. You'll be notified when it's completed.
                  </p>
                </div>
                <div className="text-2xl">🔄</div>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="flex items-center gap-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-slate-100 ring-4 ring-blue-50">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-full w-full text-slate-300 p-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Welcome back, {formatName(user)}!</h2>
              <p className="text-slate-500">Manage your health records and appointments.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Appointments" value={stats?.appointments ?? 0} helper="Upcoming and past visits" />
            <StatCard label="Medical records" value={stats?.records ?? 0} helper="Clinical records" />
            <StatCard label="Prescriptions" value={stats?.prescriptions ?? 0} helper="Active prescriptions" />
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming appointments</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Table
                columns={["Date", "Reason", "Status", "Cancellation Reason"]}
                rows={appointments}
                renderRow={(appointment) => (
                  <tr key={appointment._id} className="text-sm text-slate-700">
                    <td className="px-5 py-4">{formatDate(appointment.appointmentDate)}</td>
                    <td className="px-5 py-4">{appointment.reason}</td>
                    <td className="px-5 py-4">
                      <Badge tone={statusTone(appointment.status)}>{appointment.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      {appointment.status === 'cancelled' ? appointment.cancelReason : ''}
                    </td>
                  </tr>
                )}
              />
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientDashboard;
