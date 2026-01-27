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

const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout title="Doctor Dashboard" subtitle="Your schedule and care activities">
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Upcoming appointments" value={stats?.appointments ?? 0} helper="Scheduled visits" />
            <StatCard label="Medical records" value={stats?.records ?? 0} helper="Records authored" />
            <StatCard label="Prescriptions" value={stats?.prescriptions ?? 0} helper="Active prescriptions" />
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Next appointments</h2>
            <Table
              columns={['Patient', 'Date', 'Reason', 'Status']}
              rows={appointments}
              renderRow={(appointment) => (
                <tr key={appointment._id} className="text-sm text-slate-700">
                  <td className="px-5 py-4">{formatName(appointment.patient?.user)}</td>
                  <td className="px-5 py-4">{formatDate(appointment.appointmentDate)}</td>
                  <td className="px-5 py-4">{appointment.reason}</td>
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

export default DoctorDashboard;
