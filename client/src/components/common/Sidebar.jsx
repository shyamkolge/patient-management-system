import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const baseLink =
  'flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition';
const activeLink = 'bg-slate-900 text-white shadow';
const inactiveLink = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';

const navConfig = {
  admin: [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Patients', to: '/admin/patients' },
    { label: 'Doctors', to: '/admin/doctors' },
    { label: 'Appointments', to: '/admin/appointments' },
    { label: 'Users', to: '/admin/users' },
  ],
  doctor: [
    { label: 'Dashboard', to: '/doctor' },
    { label: 'Appointments', to: '/doctor/appointments' },
    { label: 'Medical Records', to: '/doctor/records' },
    { label: 'Prescriptions', to: '/doctor/prescriptions' },
  ],
  patient: [
    { label: 'Dashboard', to: '/patient' },
    { label: 'Appointments', to: '/patient/appointments' },
    { label: 'Medical Records', to: '/patient/records' },
    { label: 'Prescriptions', to: '/patient/prescriptions' },
  ],
};

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'patient';
  const links = navConfig[role] || [];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col gap-6 px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">PM</div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Patient Manager</p>
            <p className="text-xs text-slate-500 capitalize">{role} portal</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : inactiveLink}`
              }
              end
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          Secure health records.
        </div>
      </div>
    </aside>
  );
};
