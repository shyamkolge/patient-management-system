import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Table } from "../../components/common/Table.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { api } from "../../services/api.js";
import { formatName } from "../../utils/format.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateDoctorForm from "../../components/admin/CreateDoctorForm.jsx";
import EditDoctorForm from "../../components/admin/EditDoctorForm.jsx";
import { FaTimes, FaUserMd } from "react-icons/fa";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  specialization: "",
  licenseNumber: "",
  experience: "",
  department: "",
  consultationFee: "",
};

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchDoctors = async (query = "") => {
    setLoading(true);
    try {
      const response = await api.get(
        `/doctors?search=${encodeURIComponent(query)}`,
      );
      setDoctors(response.data.doctors || []);
    } catch (err) {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleCreate = async (formData, resetForm) => {
    setCreating(true);
    setError("");
    try {
      await api.post("/doctors", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        experience: Number(formData.experience || 0),
        department: formData.department,
        consultationFee: Number(formData.consultationFee || 0),
      });
      if (resetForm) resetForm();
      setShowModal(false);
      toast.success("Doctor created successfully!");
      await fetchDoctors(search);
    } catch (err) {
      setError(err.message || "Unable to create doctor");
      toast.error(err.message || "Unable to create doctor");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setShowEditModal(true);
    setError("");
  };

  const handleUpdate = async (formData) => {
    if (!selectedDoctor) return;
    setUpdating(true);
    setError("");
    try {
      await api.put(`/doctors/${selectedDoctor._id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        experience: Number(formData.experience || 0),
        department: formData.department,
        consultationFee: Number(formData.consultationFee || 0),
      });
      setShowEditModal(false);
      setSelectedDoctor(null);
      toast.success("Doctor updated successfully!");
      await fetchDoctors(search);
    } catch (err) {
      setError(err.message || "Unable to update doctor");
      toast.error(err.message || "Unable to update doctor");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (doctor) => {
    const newStatus = doctor.user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/users/${doctor.user._id}/status`, { status: newStatus });

      // Update local state
      setDoctors(prev => prev.map(doc =>
        doc.user._id === doctor.user._id
          ? { ...doc, user: { ...doc.user, status: newStatus } }
          : doc
      ));
      toast.success(`Doctor ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <DashboardLayout
      title="Doctor Directory"
      subtitle="Maintain provider roster and credentials"
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="space-y-6">
        <PageHeader
          title="Doctors"
          subtitle="Search, onboard, and manage providers."
        />

        {/* Modal for Create Doctor */}
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
              <CreateDoctorForm
                onCreate={handleCreate}
                creating={creating}
                error={error}
              />
            </div>
          </div>
        )}

        {/* Modal for Edit Doctor */}
        {showEditModal && selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-full max-w-2xl mx-auto">
              <button
                className="absolute top-2 right-2 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={() => { setShowEditModal(false); setSelectedDoctor(null); }}
                aria-label="Close"
              >
                <FaTimes className="w-5 h-5" />
              </button>
              <EditDoctorForm doctor={selectedDoctor} onUpdate={handleUpdate} updating={updating} error={error} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search doctors"
            className="w-full max-w-sm rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <button
            onClick={() => fetchDoctors(search)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
          >
            Search
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No doctors found"
            description="Try a different filter or add a provider."
          />
        ) : (
          <Table
            columns={["Doctor", "Email", "Phone", "Specialization", "Status", "Actions"]}
            rows={doctors}
            renderRow={(doctor) => (
              <tr key={doctor._id} className="text-sm text-slate-700">
                <td className="px-5 py-4">{formatName(doctor.user)}</td>
                <td className="px-5 py-4">{doctor.user?.email}</td>
                <td className="px-5 py-4">{doctor.user?.phone || "—"}</td>
                <td className="px-5 py-4">{doctor.specialization}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${doctor.user?.status === 'active'
                      ? 'bg-green-50 text-green-700 ring-green-600/20'
                      : 'bg-red-50 text-red-700 ring-red-600/20'
                    }`}>
                    {doctor.user?.status || 'Active'}
                  </span>
                </td>
                <td className="px-5 py-4 flex gap-2">
                  <button
                    className="rounded-lg bg-yellow-500 px-3 py-1 text-xs font-semibold text-white hover:bg-yellow-600 transition"
                    onClick={() => handleEdit(doctor)}
                  >
                    View / Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(doctor)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold text-white transition ${doctor.user?.status === 'active'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                      }`}
                  >
                    {doctor.user?.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            )}
          />
        )}

        {/* Fixed Create Doctor Button */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 transition"
        >
          <FaUserMd className="w-6 h-6" /> Create Doctor
        </button>
        {/* <FloatingCreateDoctorButton onClick={() => setShowModal(true)} /> */}
      </div>
    </DashboardLayout>
  );
};

export default AdminDoctors;
