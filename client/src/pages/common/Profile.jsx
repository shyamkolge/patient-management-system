import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate } from '../../utils/format.js';

const Profile = () => {
  const { user, profile } = useAuth();

  return (
    <DashboardLayout title="Profile" subtitle="Account and clinical information">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Account</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p><span className="font-medium text-slate-900">Name:</span> {user?.firstName} {user?.lastName}</p>
            <p><span className="font-medium text-slate-900">Email:</span> {user?.email}</p>
            <p><span className="font-medium text-slate-900">Role:</span> {user?.role}</p>
            <p><span className="font-medium text-slate-900">Phone:</span> {user?.phone || '—'}</p>
            <p><span className="font-medium text-slate-900">Status:</span> {user?.status}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Clinical profile</h2>
          {profile ? (
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p><span className="font-medium text-slate-900">Profile ID:</span> {profile._id}</p>
              {profile.dateOfBirth && (
                <p><span className="font-medium text-slate-900">DOB:</span> {formatDate(profile.dateOfBirth)}</p>
              )}
              {profile.gender && (
                <p><span className="font-medium text-slate-900">Gender:</span> {profile.gender}</p>
              )}
              {profile.specialization && (
                <p><span className="font-medium text-slate-900">Specialization:</span> {profile.specialization}</p>
              )}
              {profile.department && (
                <p><span className="font-medium text-slate-900">Department:</span> {profile.department}</p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No profile data available.</p>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
