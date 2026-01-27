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
    case 'active':
      return 'success';
    case 'completed':
      return 'info';
    case 'cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
};

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patient: '',
    diagnosis: '',
    instructions: '',
  });
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prescriptionsRes, patientsRes] = await Promise.all([
        api.get('/prescriptions?limit=20'),
        api.get('/patients?limit=50'),
      ]);
      setPrescriptions(prescriptionsRes.data.prescriptions || []);
      setPatients(patientsRes.data.patients || []);
    } catch (err) {
      setPrescriptions([]);
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

  const handleMedicationChange = (index, field, value) => {
    setMedications((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addMedication = () => {
    setMedications((prev) => [...prev, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.post('/prescriptions', {
        patient: form.patient,
        diagnosis: form.diagnosis,
        instructions: form.instructions,
        medications,
      });
      setForm({ patient: '', diagnosis: '', instructions: '' });
      setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to create prescription');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="Prescriptions" subtitle="Issue and manage medication plans">
      <div className="space-y-6">
        <PageHeader title="Prescriptions" subtitle="Create prescriptions and monitor status." />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">New prescription</h3>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="Diagnosis"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
              <input
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                placeholder="General instructions"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Medications</p>
              {medications.map((med, index) => (
                <div key={`med-${index}`} className="grid gap-3 md:grid-cols-5">
                  <input
                    value={med.name}
                    onChange={(event) => handleMedicationChange(index, 'name', event.target.value)}
                    placeholder="Medication"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    required
                  />
                  <input
                    value={med.dosage}
                    onChange={(event) => handleMedicationChange(index, 'dosage', event.target.value)}
                    placeholder="Dosage"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    required
                  />
                  <input
                    value={med.frequency}
                    onChange={(event) => handleMedicationChange(index, 'frequency', event.target.value)}
                    placeholder="Frequency"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    required
                  />
                  <input
                    value={med.duration}
                    onChange={(event) => handleMedicationChange(index, 'duration', event.target.value)}
                    placeholder="Duration"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    required
                  />
                  <input
                    value={med.instructions}
                    onChange={(event) => handleMedicationChange(index, 'instructions', event.target.value)}
                    placeholder="Instructions"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addMedication}
                className="text-sm font-medium text-slate-600"
              >
                + Add medication
              </button>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-60"
            >
              {creating ? 'Saving…' : 'Create prescription'}
            </button>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </form>
        </div>

        {loading ? (
          <Spinner />
        ) : prescriptions.length === 0 ? (
          <EmptyState title="No prescriptions" description="Create a prescription to get started." />
        ) : (
          <Table
            columns={['Patient', 'Issue date', 'Diagnosis', 'Status']}
            rows={prescriptions}
            renderRow={(item) => (
              <tr key={item._id} className="text-sm text-slate-700">
                <td className="px-5 py-4">{formatName(item.patient?.user)}</td>
                <td className="px-5 py-4">{formatDate(item.issueDate)}</td>
                <td className="px-5 py-4">{item.diagnosis || '—'}</td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </td>
              </tr>
            )}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
