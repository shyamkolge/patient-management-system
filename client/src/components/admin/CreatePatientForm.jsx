import { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaBirthdayCake, FaVenusMars, FaTint, FaUserShield, FaPhoneAlt, FaUserPlus } from 'react-icons/fa';

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

export default function CreatePatientForm({ onCreate, creating, error }) {
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
        <FaUserPlus className="text-green-600 w-7 h-7" />
        <h3 className="text-xl font-bold text-slate-900">Add New Patient</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold mb-1">
              <FaUser className="w-5 h-5" />
              <span>Personal Information</span>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <FaUser className="absolute left-3 top-3 text-slate-400" />
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
                <FaUser className="absolute left-3 top-3 text-slate-400" />
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
              <FaBirthdayCake className="w-5 h-5" />
              <span>Medical & Emergency</span>
            </div>
            <div className="relative">
              <FaBirthdayCake className="absolute left-3 top-3 text-slate-400" />
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
                required
              />
            </div>
            <div className="relative">
              <FaVenusMars className="absolute left-3 top-3 text-slate-400" />
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
                required
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="relative">
              <FaTint className="absolute left-3 top-3 text-slate-400" />
              <input
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                placeholder="Blood group"
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
              />
            </div>
            <div className="relative">
              <FaUserShield className="absolute left-3 top-3 text-slate-400" />
              <input
                name="emergencyName"
                value={form.emergencyName}
                onChange={handleChange}
                placeholder="Emergency contact name"
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
                required
              />
            </div>
            <div className="relative">
              <FaPhoneAlt className="absolute left-3 top-3 text-slate-400" />
              <input
                name="emergencyPhone"
                value={form.emergencyPhone}
                onChange={handleChange}
                placeholder="Emergency contact phone"
                className="pl-10 pr-3 py-3 rounded-xl border border-slate-200 w-full text-sm"
                required
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-base font-bold text-white shadow transition hover:bg-green-700 disabled:opacity-60"
          >
            <FaUserPlus className="w-5 h-5" />
            {creating ? 'Creating…' : 'Create Patient'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </form>
    </div>
  );
}
