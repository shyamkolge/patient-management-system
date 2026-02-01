import { useState } from 'react';
import { FaUserMd, FaEnvelope, FaPhone, FaLock, FaIdBadge, FaBriefcaseMedical, FaBuilding, FaMoneyBillWave, FaUserPlus } from 'react-icons/fa';

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

export default function CreateDoctorForm({ onCreate, creating, error }) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreate(form, () => setForm(initialForm));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FaUserPlus className="text-blue-600 w-7 h-7" />
        <h3 className="text-xl font-bold text-slate-900">Add New Doctor</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold mb-1">
              <FaUserMd className="w-5 h-5" />
              <span>Doctor Information</span>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <FaUserMd className="absolute left-3 top-3 text-slate-400" />
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
                  required
                />
              </div>
              <div className="relative flex-1">
                <FaUserMd className="absolute left-3 top-3 text-slate-400" />
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
                  required
                />
              </div>
            </div>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-slate-400" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
                required
              />
            </div>
            <div className="relative">
              <FaPhone className="absolute left-3 top-3 text-slate-400" />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-slate-400" />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Temporary password"
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
                required
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold mb-1">
              <FaBriefcaseMedical className="w-5 h-5" />
              <span>Professional Details</span>
            </div>
            <div className="relative">
              <FaBriefcaseMedical className="absolute left-3 top-3 text-slate-400" />
              <input
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Specialization"
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
                required
              />
            </div>
            <div className="relative">
              <FaIdBadge className="absolute left-3 top-3 text-slate-400" />
              <input
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleChange}
                placeholder="License number"
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
                required
              />
            </div>
            <div className="relative">
              <FaBuilding className="absolute left-3 top-3 text-slate-400" />
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
              />
            </div>
            <div className="relative">
              <FaBriefcaseMedical className="absolute left-3 top-3 text-slate-400" />
              <input
                name="experience"
                type="number"
                value={form.experience}
                onChange={handleChange}
                placeholder="Experience (years)"
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
                required
              />
            </div>
            <div className="relative">
              <FaMoneyBillWave className="absolute left-3 top-3 text-slate-400" />
              <input
                name="consultationFee"
                type="number"
                value={form.consultationFee}
                onChange={handleChange}
                placeholder="Consultation fee"
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-60 w-full"
        >
          {creating ? 'Creating…' : 'Create Doctor'}
        </button>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </form>
    </div>
  );
}
