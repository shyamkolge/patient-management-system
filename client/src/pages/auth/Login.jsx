import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-slate-500">Patient Records</p>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to access your portal.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@hospital.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          New patient?{' '}
          <Link to="/register" className="font-semibold text-slate-900">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
