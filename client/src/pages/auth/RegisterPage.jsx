import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { FaUserPlus, FaArrowRight, FaHeartbeat } from 'react-icons/fa';

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

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('role', 'patient');
      formData.append('phone', form.phone);

      const patientData = {
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
      };

      formData.append('patientData', JSON.stringify(patientData));

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await register(formData);

      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
                <FaHeartbeat className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your patient profile</h2>
            <p className="mt-2 text-sm text-slate-600">
              Join thousands of patients managing their health with MediCare.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            {loading && (
              <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-blue-800 font-semibold animate-pulse">Creating your account...</p>
                </div>
              </div>
            )}

            <div className="p-8 sm:p-12">
              <form onSubmit={handleSubmit} className="space-y-10">

                {/* Profile Photo Section */}
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-upload').click()}>
                    <div className="h-28 w-28 rounded-full overflow-hidden ring-4 ring-blue-50 ring-offset-2 transition-all duration-300 group-hover:ring-blue-100 group-hover:scale-105">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <FaUserPlus className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-blue-700 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-1.414-1.414l-.707-.707A1 1 0 0011.586 2H8.414a1 1 0 00-.707.293l-.707.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input id="profile-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-500">Upload Profile Photo</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                  {/* Left Column - Personal Info */}
                  <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
                    <div className="border-b border-slate-200 pb-4 mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md">1</span>
                        Personal Details
                      </h3>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                          <input name="firstName" value={form.firstName} onChange={handleChange} required
                            className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                          <input name="lastName" value={form.lastName} onChange={handleChange} required
                            className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required
                          className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange} required
                          className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Date of Birth</label>
                          <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required
                            className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                          <select name="gender" value={form.gender} onChange={handleChange}
                            className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all bg-white">
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                          <input name="phone" value={form.phone} onChange={handleChange}
                            className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Blood Group</label>
                          <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="e.g. O+"
                            className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Address & Emergency */}
                  <div className="space-y-8">
                    {/* Address Group */}
                    <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
                      <div className="border-b border-slate-200 pb-4 mb-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md">2</span>
                          Address
                        </h3>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Street Address</label>
                          <input name="street" value={form.street} onChange={handleChange}
                            className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                            <input name="city" value={form.city} onChange={handleChange}
                              className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
                            <input name="state" value={form.state} onChange={handleChange}
                              className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Zip Code</label>
                            <input name="zipCode" value={form.zipCode} onChange={handleChange}
                              className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                            <input name="country" value={form.country} onChange={handleChange}
                              className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 py-3 px-4 text-sm font-medium transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Group */}
                    <div className="rounded-2xl bg-red-50 p-6 border border-red-100">
                      <div className="border-b border-red-200 pb-4 mb-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-md">3</span>
                          Emergency Contact
                        </h3>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Contact Name</label>
                          <input name="emergencyName" value={form.emergencyName} onChange={handleChange} required
                            className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-red-500 focus:ring-4 focus:ring-red-100 py-3 px-4 text-sm font-medium transition-all bg-white" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                            <input name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} required
                              className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-red-500 focus:ring-4 focus:ring-red-100 py-3 px-4 text-sm font-medium transition-all bg-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Relationship</label>
                            <input name="emergencyRelationship" value={form.emergencyRelationship} onChange={handleChange} placeholder="e.g. Spouse"
                              className="w-full rounded-xl border-2 border-slate-300 shadow-sm focus:border-red-500 focus:ring-4 focus:ring-red-100 py-3 px-4 text-sm font-medium transition-all bg-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                    {!loading && <FaArrowRight className="ml-2 h-5 w-5" />}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
