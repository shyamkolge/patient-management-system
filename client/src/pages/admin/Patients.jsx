import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatName } from '../../utils/format.js';
import { FaUserPlus, FaTimes } from 'react-icons/fa';
import CreatePatientForm from '../../components/admin/CreatePatientForm.jsx';
import EditPatientForm from '../../components/admin/EditPatientForm.jsx';

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

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [updating, setUpdating] = useState(false);
  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
    setError('');
  };

  const handleUpdate = async (formData) => {
    if (!selectedPatient) return;
    setUpdating(true);
    setError('');
    try {
      const res = await api.put(`/patients/${selectedPatient._id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup || undefined,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
        },
      });
    
      setShowEditModal(false);
      setSelectedPatient(null);
      toast.success('Patient updated successfully!');
      await fetchPatients(search);
    } catch (err) {
      setError(err.message || 'Unable to update patient');
      toast.error(err.message || 'Unable to update patient');
    } finally {
      setUpdating(false);
    }
  };

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/patients?search=${encodeURIComponent(query)}`);
      setPatients(response.data.patients || []);
    } catch (err) {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (formData, resetForm) => {
    setCreating(true);
    setError('');
    try {
      await api.post('/patients', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup || undefined,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
        },
      });
      if (resetForm) resetForm();
      setShowModal(false);
      toast.success('Patient created successfully!');
      await fetchPatients(search);
    } catch (err) {
      setError(err.message || 'Unable to create patient');
      toast.error(err.message || 'Unable to create patient');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="Patient Directory" subtitle="Manage patient profiles and contact details">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="space-y-6">
        
        <PageHeader
          title="Patients"
          subtitle="Search, create, and review patient profiles."
        />


        {/* Modal for Create Patient */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-full max-w-2xl mx-auto">
              <button
                className="absolute top-2 right-2 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <FaTimes className="w-5 h-5" />
              </button>
              <CreatePatientForm onCreate={handleCreate} creating={creating} error={error} />
            </div>
          </div>
        )}

        {/* Modal for Edit Patient */}
        {showEditModal && selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-full max-w-2xl mx-auto">
              <button
                className="absolute top-2 right-2 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={() => { setShowEditModal(false); setSelectedPatient(null); }}
                aria-label="Close"
              >
                <FaTimes className="w-5 h-5" />
              </button>
              <EditPatientForm patient={selectedPatient} onUpdate={handleUpdate} updating={updating} error={error} />
            </div>
          </div>
        )}

        {view === 'list' && (
          <>
            <div className="flex gap-2 mb-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patients"
                className="w-full max-w-md rounded-xl border border-slate-400 px-4 py-3 text-sm"
              />
              <button
                onClick={() => fetchPatients(search)}
                className="rounded-xl border border-slate-200 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
            {loading ? (
              <Spinner />
            ) : patients.length === 0 ? (
              <EmptyState title="No patients found" description="Adjust your search or add a new patient." />
            ) : (
              <Table
                columns={['Patient', 'Email', 'Phone', 'DOB', 'Actions']}
                rows={patients}
                renderRow={(patient) => (
                  <tr key={patient._id} className="text-sm text-slate-700">
                    <td className="px-5 py-4">{formatName(patient.user)}</td>
                    <td className="px-5 py-4">{patient.user?.email}</td>
                    <td className="px-5 py-4">{patient.user?.phone || '—'}</td>
                    <td className="px-5 py-4">{formatDate(patient.dateOfBirth)}</td>
                    <td className="px-5 py-4">
                      <button
                        className="rounded-lg bg-yellow-500 px-3 py-1 text-xs font-semibold text-white hover:bg-yellow-600 transition"
                        onClick={() => handleEdit(patient)}
                      >
                        View / Edit
                      </button>
                    </td>
                  </tr>
                )}
              />
            )}
            {/* Fixed Create Patient Button */}
            <button
              onClick={() => setShowModal(true)}
              className="fixed bottom-8 right-8 z-40 flex items-center gap-2 rounded-full bg-green-600 px-6 py-4 text-lg font-bold text-white shadow-lg hover:bg-green-700 transition"
            >
              <FaUserPlus className="w-6 h-6" /> Create Patient
            </button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPatients;
