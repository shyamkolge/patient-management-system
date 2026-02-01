import { useState } from 'react';

export default function EditDoctorForm({ doctor, onUpdate, updating, error }) {
  const [form, setForm] = useState({
    firstName: doctor?.user?.firstName || '',
    lastName: doctor?.user?.lastName || '',
    email: doctor?.user?.email || '',
    phone: doctor?.user?.phone || '',
    specialization: doctor?.specialization || '',
    licenseNumber: doctor?.licenseNumber || '',
    experience: doctor?.experience || '',
    department: doctor?.department || '',
    consultationFee: doctor?.consultationFee || '',
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
        <h3 className="text-xl font-bold text-slate-900">Edit Doctor Details</h3>
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
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              placeholder="Specialization"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
              required
            />
            <input
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
              placeholder="License number"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
              required
            />
          </div>
          <div className="space-y-4">
            <input
              name="experience"
              type="number"
              value={form.experience}
              onChange={handleChange}
              placeholder="Experience (years)"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
              required
            />
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
            />
            <input
              name="consultationFee"
              type="number"
              value={form.consultationFee}
              onChange={handleChange}
              placeholder="Consultation fee"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={updating}
          className="rounded-xl bg-yellow-600 px-6 py-3 text-base font-semibold text-white shadow transition hover:bg-yellow-700 disabled:opacity-60 w-full"
        >
          {updating ? 'Updating…' : 'Update Doctor'}
        </button>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </form>
    </div>
  );
}
