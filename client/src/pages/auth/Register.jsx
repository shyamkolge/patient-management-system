import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    gender: 'female',
    bloodGroup: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: 'patient',
        phone: form.phone,
        patientData: {
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          bloodGroup: form.bloodGroup || undefined,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            zipCode: form.zipCode,
            country: form.country,
          },
          emergencyContact: {
            name: form.emergencyName,
            phone: form.emergencyPhone,
            relationship: form.emergencyRelationship,
          },
        },
      });

      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-slate-500">Patient Records</p>
          <h1 className="text-2xl font-semibold text-slate-900">Create your patient profile</h1>
          <p className="text-sm text-slate-500">Provide essential details to activate your account.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">First name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Last name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Date of birth</label>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                required
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Blood group</label>
              <input
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="A+"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">Emergency contact</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              <input
                name="emergencyName"
                placeholder="Full name"
                value={form.emergencyName}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
              <input
                name="emergencyPhone"
                placeholder="Phone number"
                value={form.emergencyPhone}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
              <input
                name="emergencyRelationship"
                placeholder="Relationship"
                value={form.emergencyRelationship}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">Address</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <input
                name="street"
                placeholder="Street"
                value={form.street}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
              <input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
              <input
                name="zipCode"
                placeholder="Zip code"
                value={form.zipCode}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
              <input
                name="country"
                placeholder="Country"
                value={form.country}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
