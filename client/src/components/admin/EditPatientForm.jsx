import { useState } from 'react';

export default function EditPatientForm({ patient, onUpdate, updating, error }) {
  const [form, setForm] = useState({
    firstName: patient?.user?.firstName || '',
    lastName: patient?.user?.lastName || '',
    email: patient?.user?.email || '',
    phone: patient?.user?.phone || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender || 'female',
    bloodGroup: patient?.bloodGroup || '',
    emergencyName: patient?.emergencyContact?.name || '',
    emergencyPhone: patient?.emergencyContact?.phone || '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdate(form);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-yellow-600 w-7 h-7 text-2xl">✏️</span>
        <h3 className="text-xl font-bold text-slate-900">Edit Patient Details</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
              required
            />
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
              required
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
              required
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
            />
          </div>
          <div className="space-y-4">
            <input
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth?.slice(0, 10) || ''}
              onChange={handleChange}
              placeholder="Date of Birth"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
            />
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
            <input
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              placeholder="Blood Group"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
            />
            <input
              name="emergencyName"
              value={form.emergencyName}
              onChange={handleChange}
              placeholder="Emergency Contact Name"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
            />
            <input
              name="emergencyPhone"
              value={form.emergencyPhone}
              onChange={handleChange}
              placeholder="Emergency Contact Phone"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={updating}
          className="rounded-xl bg-yellow-600 px-6 py-3 text-base font-semibold text-white shadow transition hover:bg-yellow-700 disabled:opacity-60 w-full"
        >
          {updating ? 'Updating…' : 'Update Patient'}
        </button>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </form>
    </div>
  );
}
