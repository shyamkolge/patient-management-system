import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { FaTachometerAlt, FaUserInjured, FaUserMd, FaCalendarCheck, FaUsersCog, FaFileMedical, FaPrescriptionBottleAlt, FaStethoscope } from 'react-icons/fa';

const baseLink =
  'flex items-center gap-4 rounded-xl px-4 py-2.5 text-sm font-medium transition';
const activeLink = 'bg-slate-900 text-white shadow';
const inactiveLink = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';

const navConfig = {
  admin: [
    { label: 'Dashboard', to: '/admin', icon: <FaTachometerAlt className="text-primary" /> },
    { label: 'Patients', to: '/admin/patients', icon: <FaUserInjured className="text-blue-500" /> },
    { label: 'Doctors', to: '/admin/doctors', icon: <FaUserMd className="text-green-500" /> },
    { label: 'Appointments', to: '/admin/appointments', icon: <FaCalendarCheck className="text-pink-500" /> },
    { label: 'Users', to: '/admin/users', icon: <FaUsersCog className="text-purple-500" /> },
  ],
  doctor: [
    { label: 'Dashboard', to: '/doctor', icon: <FaTachometerAlt className="text-primary" /> },
    { label: 'Appointments', to: '/doctor/appointments', icon: <FaCalendarCheck className="text-pink-500" /> },
    { label: 'Schedule', to: '/doctor/schedule', icon: <FaCalendarCheck className="text-teal-500" /> },
    { label: 'Consultation', to: '/doctor/consultation', icon: <FaStethoscope className="text-blue-500" /> },
    { label: 'Patients', to: '/doctor/patients', icon: <FaUserInjured className="text-blue-500" /> },
    { label: 'Prescriptions', to: '/doctor/prescriptions', icon: <FaPrescriptionBottleAlt className="text-green-500" /> },
    { label: 'Medical Records', to: '/doctor/records', icon: <FaFileMedical className="text-purple-500" /> },
  ],
  patient: [
    { label: 'Dashboard', to: '/patient', icon: <FaTachometerAlt className="text-primary" /> },
    { label: 'Appointments', to: '/patient/appointments', icon: <FaCalendarCheck className="text-pink-500" /> },
    { label: 'Medical Records', to: '/patient/records', icon: <FaFileMedical className="text-blue-500" /> },
    { label: 'Lab Reports', to: '/patient/reports', icon: <FaFileMedical className="text-indigo-500" /> },
    { label: 'Prescriptions', to: '/patient/prescriptions', icon: <FaPrescriptionBottleAlt className="text-green-500" /> },
  ],
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'patient';
  const links = navConfig[role] || [];

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 transform border-r border-slate-800 bg-linear-to-b from-slate-900 via-slate-800 to-slate-700 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col gap-6 px-4 py-6 overflow-y-auto">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-white font-bold text-base shadow">PM</div>
              <div>
                <p className="text-sm font-bold text-white tracking-wide">Patient Manager</p>
                <p className="text-[10px] text-slate-300 capitalize">{role} portal</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            {/* <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden">
              <FaTimes />
            </button> */}
          </div>
          <nav className="flex flex-1 flex-col gap-2 mt-2">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && window.innerWidth < 1024 && onClose()}
                className={({ isActive }) =>
                  `${baseLink} ${isActive ? 'bg-primary/90 text-white shadow' : 'text-slate-200 hover:bg-primary/20 hover:text-white'}`
                }
                end
              >
                <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs text-slate-300 mt-4">
            Secure health records.
          </div>
        </div>
      </aside>
    </>
  );
};
