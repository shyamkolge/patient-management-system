import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatName } from '../../utils/format.js';

const DoctorRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patient: '',
    visitDate: '',
    chiefComplaint: '',
    diagnosis: '',
    treatment: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [recordsRes, patientsRes] = await Promise.all([
        api.get('/medical-records?limit=20'),
        api.get('/patients?limit=50'),
      ]);
      setRecords(recordsRes.data.records || []);
      setPatients(patientsRes.data.patients || []);
    } catch (err) {
      setRecords([]);
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
    setCreating(true);
    setError('');
    try {
      await api.post('/medical-records', {
        patient: form.patient,
        visitDate: form.visitDate,
        chiefComplaint: form.chiefComplaint,
        diagnosis: form.diagnosis,
        treatment: form.treatment,
        notes: form.notes,
      });
      setForm({
        patient: '',
        visitDate: '',
        chiefComplaint: '',
        diagnosis: '',
        treatment: '',
        notes: '',
      });
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to create record');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="Medical Records" subtitle="Document patient visits and outcomes">
      <div className="space-y-6">
        <PageHeader title="Medical records" subtitle="Capture clinical details for visits." />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">New medical record</h3>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <select
              name="patient"
              value={form.patient}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            >
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {formatName(patient.user)}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="visitDate"
              value={form.visitDate}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="chiefComplaint"
              value={form.chiefComplaint}
              onChange={handleChange}
              placeholder="Chief complaint"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              placeholder="Diagnosis"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="treatment"
              value={form.treatment}
              onChange={handleChange}
              placeholder="Treatment plan"
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
              {creating ? 'Saving…' : 'Create record'}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </div>

        {loading ? (
          <Spinner />
        ) : records.length === 0 ? (
          <EmptyState title="No records yet" description="Create a new record to begin documenting care." />
        ) : (
          <Table
            columns={['Patient', 'Visit date', 'Diagnosis', 'Doctor']}
            rows={records}
            renderRow={(record) => (
              <tr key={record._id} className="text-sm text-slate-700">
                <td className="px-5 py-4">{formatName(record.patient?.user)}</td>
                <td className="px-5 py-4">{formatDate(record.visitDate)}</td>
                <td className="px-5 py-4">{record.diagnosis}</td>
                <td className="px-5 py-4">{formatName(record.doctor?.user)}</td>
              </tr>
            )}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorRecords;
