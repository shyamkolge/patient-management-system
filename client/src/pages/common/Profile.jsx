import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate } from '../../utils/format.js';
import { api } from '../../services/api.js';
import { Badge } from '../../components/common/Badge.jsx';

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    profileImage: null,
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    specialization: '',
    department: '',
    experience: '',
    licenseNumber: '',
    consultationFee: '',
    bio: '',
  });

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '',
      gender: profile?.gender || '',
      bloodGroup: profile?.bloodGroup || '',
      allergies: Array.isArray(profile?.allergies)
        ? profile.allergies.join(', ')
        : profile?.allergies || '',
      address: {
        street: profile?.address?.street || '',
        city: profile?.address?.city || '',
        state: profile?.address?.state || '',
        zipCode: profile?.address?.zipCode || '',
        country: profile?.address?.country || '',
      },
      emergencyContact: {
        name: profile?.emergencyContact?.name || '',
        relationship: profile?.emergencyContact?.relationship || '',
        phone: profile?.emergencyContact?.phone || '',
      },
      specialization: profile?.specialization || '',
      department: profile?.department || '',
      experience: profile?.experience || '',
      licenseNumber: profile?.licenseNumber || '',
      consultationFee: profile?.consultationFee || '',
      bio: profile?.bio || '',
    }));
  }, [user, profile]);

  const initials = useMemo(() => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        allergies: formData.allergies,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        specialization: formData.specialization,
        department: formData.department,
        experience: formData.experience,
        licenseNumber: formData.licenseNumber,
        consultationFee: formData.consultationFee,
        bio: formData.bio,
      };

      let body = payload;
      if (formData.profileImage) {
        const form = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value === undefined) return;
          if (typeof value === 'object') {
            form.append(key, JSON.stringify(value));
          } else {
            form.append(key, value);
          }
        });
        form.append('profileImage', formData.profileImage);
        body = form;
      }

      await api.patch('/auth/profile', body);
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '',
      gender: profile?.gender || '',
      bloodGroup: profile?.bloodGroup || '',
      allergies: Array.isArray(profile?.allergies)
        ? profile.allergies.join(', ')
        : profile?.allergies || '',
      address: {
        street: profile?.address?.street || '',
        city: profile?.address?.city || '',
        state: profile?.address?.state || '',
        zipCode: profile?.address?.zipCode || '',
        country: profile?.address?.country || '',
      },
      emergencyContact: {
        name: profile?.emergencyContact?.name || '',
        relationship: profile?.emergencyContact?.relationship || '',
        phone: profile?.emergencyContact?.phone || '',
      },
      specialization: profile?.specialization || '',
      department: profile?.department || '',
      experience: profile?.experience || '',
      licenseNumber: profile?.licenseNumber || '',
      consultationFee: profile?.consultationFee || '',
      bio: profile?.bio || '',
    }));
  };

  return (
    <DashboardLayout title="Profile" subtitle="Manage your personal and clinical information">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl font-bold">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-slate-600">{user?.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="info">{user?.role || 'user'}</Badge>
                  <span className="text-xs text-slate-500">ID: {profile?._id || user?.id}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                View Activity
              </button>
              <button
                onClick={() => setIsEditing((prev) => !prev)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {isEditing ? 'Close Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <button
            onClick={() => setActiveTab('personal')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'personal'
                ? 'bg-teal-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'details'
                ? 'bg-teal-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {user?.role === 'doctor' ? 'Doctor Details' : 'Patient Details'}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'settings'
                ? 'bg-teal-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Account Settings
          </button>
        </div>

        {/* Content */}
        {activeTab === 'personal' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-600">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.files?.[0] || null })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Account Summary</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p><span className="font-medium text-slate-900">Role:</span> {user?.role}</p>
                <p><span className="font-medium text-slate-900">Status:</span> {user?.status}</p>
                {profile?.dateOfBirth && (
                  <p><span className="font-medium text-slate-900">DOB:</span> {formatDate(profile.dateOfBirth)}</p>
                )}
                {profile?.gender && (
                  <p><span className="font-medium text-slate-900">Gender:</span> {profile.gender}</p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'details' && user?.role !== 'doctor' && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Health Information</h3>
              <p className="text-sm text-slate-500">Your medical profile details</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Blood Type</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  ) : (
                    <p className="mt-2 text-2xl font-bold text-teal-600">{profile?.bloodGroup || '—'}</p>
                  )}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Known Allergies</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      placeholder="e.g., Penicillin, Peanuts"
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(profile?.allergies?.length ? profile.allergies : ['None']).map((item) => (
                        <span key={item} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Emergency Contact</h3>
              <p className="text-sm text-slate-500">Contact person in case of emergency</p>
              {isEditing ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                    })}
                    placeholder="Name"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, relationship: e.target.value },
                    })}
                    placeholder="Relationship"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                    })}
                    placeholder="Phone"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="font-semibold text-slate-900">
                    {profile?.emergencyContact?.name || '—'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {profile?.emergencyContact?.phone || '—'}
                  </p>
                  {profile?.emergencyContact?.relationship && (
                    <p className="text-xs text-slate-500">
                      {profile.emergencyContact.relationship}
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'details' && user?.role === 'doctor' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Professional Information</h3>
            <p className="text-sm text-slate-500">Your medical credentials and expertise</p>

            {isEditing ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Specialization"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Department"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Experience (years)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="License Number"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                  placeholder="Consultation Fee"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Bio"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Specialization</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {profile?.specialization || '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Department</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {profile?.department || '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Experience</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {profile?.experience ? `${profile.experience} Years` : '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">License Number</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {profile?.licenseNumber || '—'}
                  </p>
                  <span className="mt-2 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Verified
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Consultation Fee</p>
                  <p className="mt-2 text-lg font-bold text-emerald-600">
                    {profile?.consultationFee ? `$${profile.consultationFee}` : '—'}
                  </p>
                  <p className="text-xs text-slate-500">per session</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Account Settings</h3>
            <p className="text-sm text-slate-500">Manage account preferences</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700">Login Email</p>
                <p className="text-sm text-slate-600">{user?.email || '—'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700">Account Status</p>
                <p className="text-sm text-slate-600">{user?.status || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex flex-wrap justify-end gap-3">
            <button
              onClick={handleCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
