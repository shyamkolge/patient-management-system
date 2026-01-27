import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { formatName } from '../../utils/format.js';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  licenseNumber: '',
  experience: '',
  department: '',
  consultationFee: '',
};

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchDoctors = async (query = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/doctors?search=${encodeURIComponent(query)}`);
      setDoctors(response.data.doctors || []);
    } catch (err) {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
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
      await api.post('/doctors', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        specialization: form.specialization,
        licenseNumber: form.licenseNumber,
        experience: Number(form.experience || 0),
        department: form.department,
        consultationFee: Number(form.consultationFee || 0),
      });
      setForm(initialForm);
      await fetchDoctors(search);
    } catch (err) {
      setError(err.message || 'Unable to create doctor');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="Doctor Directory" subtitle="Maintain provider roster and credentials">
      <div className="space-y-6">
        <PageHeader title="Doctors" subtitle="Search, onboard, and manage providers." />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Add new doctor</h3>
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
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              placeholder="Specialization"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
              placeholder="License number"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="experience"
              type="number"
              value={form.experience}
              onChange={handleChange}
              placeholder="Experience (years)"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              name="consultationFee"
              type="number"
              value={form.consultationFee}
              onChange={handleChange}
              placeholder="Consultation fee"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create doctor'}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search doctors"
            className="w-full max-w-sm rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <button
            onClick={() => fetchDoctors(search)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
          >
            Search
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : doctors.length === 0 ? (
          <EmptyState title="No doctors found" description="Try a different filter or add a provider." />
        ) : (
          <Table
            columns={['Doctor', 'Email', 'Phone', 'Specialization']}
            rows={doctors}
            renderRow={(doctor) => (
              <tr key={doctor._id} className="text-sm text-slate-700">
                <td className="px-5 py-4">{formatName(doctor.user)}</td>
                <td className="px-5 py-4">{doctor.user?.email}</td>
                <td className="px-5 py-4">{doctor.user?.phone || '—'}</td>
                <td className="px-5 py-4">{doctor.specialization}</td>
              </tr>
            )}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDoctors;
