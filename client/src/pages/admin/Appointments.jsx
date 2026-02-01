import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Table } from "../../components/common/Table.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { Badge } from "../../components/common/Badge.jsx";
import { api } from "../../services/api.js";
import { formatDate, formatName } from "../../utils/format.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateAppointmentForm from "../../components/admin/CreateAppointmentForm.jsx";
import { FaTimes } from "react-icons/fa";

const statusTone = (status) => {
  switch (status) {
    case "confirmed":
      return "success";
    case "completed":
      return "info";
    case "cancelled":
    case "no-show":
      return "danger";
    default:
      return "warning";
  }
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appts, pats, docs] = await Promise.all([
        api.get("/appointments?limit=20"),
        api.get("/patients?limit=50"),
        api.get("/doctors?limit=50"),
      ]);
      setAppointments(appts.data.appointments || []);
      setPatients(pats.data.patients || []);
      setDoctors(docs.data.doctors || []);
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (formData, resetForm) => {
    setCreating(true);
    setError("");
    try {
      await api.post("/appointments", {
        patient: formData.patient,
        doctor: formData.doctor,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        notes: formData.notes,
      });
      if (resetForm) resetForm();
      setShowModal(false);
      toast.success("Appointment created successfully!");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to create appointment");
      toast.error(err.message || "Unable to create appointment");
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout
      title="Appointments"
      subtitle="Coordinate and monitor visits"
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
          title="Appointments"
          subtitle="Schedule new visits and review status."
        />

        {/* Modal for Create Appointment */}
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
              <CreateAppointmentForm
                onCreate={handleCreate}
                creating={creating}
                error={error}
                patients={patients}
                doctors={doctors}
              />
            </div>
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No appointments found"
            description="Create a new appointment to get started."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 whitespace-nowrap">Patient</th>
                  <th className="px-5 py-3 whitespace-nowrap">Doctor</th>
                  <th className="px-5 py-3 whitespace-nowrap">Date</th>
                  <th className="px-5 py-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="text-sm text-slate-700">
                    <td className="px-5 py-4 whitespace-nowrap max-w-[160px] md:max-w-xs truncate">
                      {formatName(appointment.patient?.user)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap max-w-[160px] md:max-w-xs truncate">
                      {formatName(appointment.doctor?.user)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap max-w-[120px] md:max-w-xs truncate">
                      {formatDate(appointment.appointmentDate)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge tone={statusTone(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Fixed Create Appointment Button */}

        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 transition"
        >
          <span className="text-2xl">📅</span> Create Appointment
        </button>

      </div>
    </DashboardLayout>
  );
};

export default AdminAppointments;
