import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
      <p className="text-xs uppercase tracking-wide text-slate-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">Let’s get you back to your workspace.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Go to dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
