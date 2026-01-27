import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatName } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';

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

const PatientAppointments = () => {
  const { profile } = useAuth();
  const patientId = profile?._id;
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [appts, docs] = await Promise.all([
        api.get('/appointments?limit=20'),
        api.get('/doctors?limit=50'),
      ]);
      setAppointments(appts.data.appointments || []);
      setDoctors(docs.data.doctors || []);
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!patientId) {
      setError('Patient profile not found.');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await api.post('/appointments', {
        patient: patientId,
        doctor: form.doctor,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        reason: form.reason,
        notes: form.notes,
      });
      setForm({ doctor: '', appointmentDate: '', appointmentTime: '', reason: '', notes: '' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to request appointment');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="Appointments" subtitle="Request and track your visits">
      <div className="space-y-6">
        <PageHeader title="Appointments" subtitle="Request new appointments with your care team." />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Request appointment</h3>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <select
              name="doctor"
              value={form.doctor}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            >
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {formatName(doctor.user)} - {doctor.specialization}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="appointmentDate"
              value={form.appointmentDate}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              type="time"
              name="appointmentTime"
              value={form.appointmentTime}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Reason for visit"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notes"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-60"
            >
              {creating ? 'Submitting…' : 'Request appointment'}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </div>

        {loading ? (
          <Spinner />
        ) : appointments.length === 0 ? (
          <EmptyState title="No appointments" description="No appointments scheduled yet." />
        ) : (
          <Table
            columns={['Doctor', 'Date', 'Reason', 'Status']}
            rows={appointments}
            renderRow={(appointment) => (
              <tr key={appointment._id} className="text-sm text-slate-700">
                <td className="px-5 py-4">{formatName(appointment.doctor?.user)}</td>
                <td className="px-5 py-4">{formatDate(appointment.appointmentDate)}</td>
                <td className="px-5 py-4">{appointment.reason}</td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone(appointment.status)}>{appointment.status}</Badge>
                </td>
              </tr>
            )}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientAppointments;
