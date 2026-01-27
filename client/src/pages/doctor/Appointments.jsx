import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatName } from '../../utils/format.js';

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

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments?limit=30');
      setAppointments(response.data.appointments || []);
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    setError('');
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      await fetchAppointments();
    } catch (err) {
      setError(err.message || 'Unable to update status');
    }
  };

  return (
    <DashboardLayout title="Appointments" subtitle="Track your schedule and visit status">
      <div className="space-y-6">
        <PageHeader title="Appointments" subtitle="Review and update visit status." />
        {error && <p className="text-sm text-rose-600">{error}</p>}

        {loading ? (
          <Spinner />
        ) : appointments.length === 0 ? (
          <EmptyState title="No appointments" description="No appointments assigned yet." />
        ) : (
          <Table
            columns={['Patient', 'Date', 'Reason', 'Status', 'Update']}
            rows={appointments}
            renderRow={(appointment) => (
              <tr key={appointment._id} className="text-sm text-slate-700">
                <td className="px-5 py-4">{formatName(appointment.patient?.user)}</td>
                <td className="px-5 py-4">{formatDate(appointment.appointmentDate)}</td>
                <td className="px-5 py-4">{appointment.reason}</td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone(appointment.status)}>{appointment.status}</Badge>
                </td>
                <td className="px-5 py-4">
                  <select
                    defaultValue={appointment.status}
                    onChange={(event) => updateStatus(appointment._id, event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="scheduled">scheduled</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                    <option value="no-show">no-show</option>
                  </select>
                </td>
              </tr>
            )}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
