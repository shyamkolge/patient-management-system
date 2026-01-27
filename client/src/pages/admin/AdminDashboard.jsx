import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatName } from '../../utils/format.js';
import { Badge } from '../../components/common/Badge.jsx';

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

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [patients, doctors, users, appts] = await Promise.all([
          api.get('/patients?limit=1'),
          api.get('/doctors?limit=1'),
          api.get('/users?limit=1'),
          api.get('/appointments?limit=5'),
        ]);

        setStats({
          patients: patients.data.total,
          doctors: doctors.data.total,
          users: users.data.total,
          appointments: appts.data.total,
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

  return (
    <DashboardLayout title="Admin Overview" subtitle="Operational summary across the facility">
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total patients" value={stats?.patients ?? 0} helper="Active patient profiles" />
            <StatCard label="Doctors" value={stats?.doctors ?? 0} helper="Credentialed providers" />
            <StatCard label="Staff accounts" value={stats?.users ?? 0} helper="Users in system" />
            <StatCard label="Appointments" value={stats?.appointments ?? 0} helper="Scheduled visits" />
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Recent appointments</h2>
            <Table
              columns={['Patient', 'Doctor', 'Date', 'Status']}
              rows={appointments}
              renderRow={(appointment) => (
                <tr key={appointment._id} className="text-sm text-slate-700">
                  <td className="px-5 py-4">{formatName(appointment.patient?.user)}</td>
                  <td className="px-5 py-4">{formatName(appointment.doctor?.user)}</td>
                  <td className="px-5 py-4">{formatDate(appointment.appointmentDate)}</td>
                  <td className="px-5 py-4">
                    <Badge tone={statusTone(appointment.status)}>{appointment.status}</Badge>
                  </td>
                </tr>
              )}
            />
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
