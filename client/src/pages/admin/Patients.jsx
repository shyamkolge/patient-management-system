import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatName } from '../../utils/format.js';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  dateOfBirth: '',
  gender: 'female',
  bloodGroup: '',
  emergencyName: '',
  emergencyPhone: '',
};

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/patients?search=${encodeURIComponent(query)}`);
      setPatients(response.data.patients || []);
    } catch (err) {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
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
      await api.post('/patients', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodGroup: form.bloodGroup || undefined,
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
        },
      });
      setForm(initialForm);
      await fetchPatients(search);
    } catch (err) {
      setError(err.message || 'Unable to create patient');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="Patient Directory" subtitle="Manage patient profiles and contact details">
      <div className="space-y-6">
        <PageHeader
          title="Patients"
          subtitle="Search, create, and review patient profiles."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Add new patient</h3>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Temporary password"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
            <input
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              placeholder="Blood group"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              name="emergencyName"
              value={form.emergencyName}
              onChange={handleChange}
              placeholder="Emergency contact name"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="emergencyPhone"
              value={form.emergencyPhone}
              onChange={handleChange}
              placeholder="Emergency contact phone"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create patient'}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patients"
            className="w-full max-w-sm rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <button
            onClick={() => fetchPatients(search)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
          >
            Search
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : patients.length === 0 ? (
          <EmptyState title="No patients found" description="Adjust your search or add a new patient." />
        ) : (
          <Table
            columns={['Patient', 'Email', 'Phone', 'DOB']}
            rows={patients}
            renderRow={(patient) => (
              <tr key={patient._id} className="text-sm text-slate-700">
                <td className="px-5 py-4">{formatName(patient.user)}</td>
                <td className="px-5 py-4">{patient.user?.email}</td>
                <td className="px-5 py-4">{patient.user?.phone || '—'}</td>
                <td className="px-5 py-4">{formatDate(patient.dateOfBirth)}</td>
              </tr>
            )}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPatients;
