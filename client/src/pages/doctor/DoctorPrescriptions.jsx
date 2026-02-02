import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { doctorApi } from '../../api/doctorApi.js';
import { formatDate, formatName } from '../../utils/format.js';
import {
  FaPrescriptionBottleAlt,
  FaPlus,
  FaEye,
  FaEdit,
  FaDownload,
  FaPrint,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';

const DoctorPrescriptions = () => {
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await doctorApi.getPrescriptions();
      setPrescriptions(data.prescriptions || data || []);
    } catch (error) {
      console.error('Load prescriptions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    if (filterStatus === 'all') return true;
    return prescription.status === filterStatus;
  });

  const PrescriptionCard = ({ prescription }) => {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-slate-900">
                {prescription.patient?.user
                  ? formatName(prescription.patient.user)
                  : formatName(prescription.patient)}
              </h3>
              <Badge tone={prescription.status === 'active' ? 'success' : 'info'}>
                {prescription.status || 'active'}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              {prescription.patient?.user?.email || prescription.patient?.email || '—'}
            </p>
            {(prescription.patient?.user?.phone || prescription.patient?.phone) && (
              <p className="text-sm text-slate-500">
                {prescription.patient?.user?.phone || prescription.patient?.phone}
              </p>
            )}
            <p className="text-sm text-slate-600">
              Date: {formatDate(new Date(prescription.createdAt))}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPrescription(prescription)}
              className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 transition"
              title="View"
            >
              <FaEye />
            </button>
            <button
              className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 transition"
              title="Download"
            >
              <FaDownload />
            </button>
            <button
              className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 transition"
              title="Print"
            >
              <FaPrint />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">Medications:</h4>
          {prescription.medications?.map((med, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-slate-50 p-3 text-sm border border-slate-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{med.name}</p>
                  <p className="text-slate-600">
                    {med.dosage} • {med.frequency}
                  </p>
                  {med.duration && (
                    <p className="text-slate-500">Duration: {med.duration}</p>
                  )}
                </div>
              </div>
              {med.instructions && (
                <p className="mt-2 text-xs text-slate-600">{med.instructions}</p>
              )}
            </div>
          ))}
        </div>

        {prescription.notes && (
          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">Notes:</p>
            <p className="text-blue-700">{prescription.notes}</p>
          </div>
        )}
      </div>
    );
  };

  const CreatePrescriptionModal = () => {
    const [formData, setFormData] = useState({
      patientId: '',
      medications: [
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
      ],
      notes: '',
    });
    const [patients, setPatients] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      // Load patients for selection
      doctorApi.getPatients({ limit: 100 }).then((data) => {
        setPatients(data.patients || data || []);
      });
    }, []);

    const addMedication = () => {
      setFormData({
        ...formData,
        medications: [
          ...formData.medications,
          { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
        ],
      });
    };

    const removeMedication = (index) => {
      setFormData({
        ...formData,
        medications: formData.medications.filter((_, i) => i !== index),
      });
    };

    const updateMedication = (index, field, value) => {
      const updated = [...formData.medications];
      updated[index][field] = value;
      setFormData({ ...formData, medications: updated });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        await doctorApi.createPrescription(formData);
        setShowCreateModal(false);
        loadPrescriptions();
      } catch (error) {
        console.error('Create prescription error:', error);
        alert('Failed to create prescription');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-bold text-slate-900">Create Prescription</h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Select Patient *
              </label>
              <select
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Choose a patient...</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {formatName(patient)} - {patient.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-900">
                  Medications *
                </label>
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 transition"
                >
                  <FaPlus /> Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {formData.medications.map((med, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900">Medication {idx + 1}</h4>
                      {formData.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Medicine Name *
                        </label>
                        <input
                          required
                          type="text"
                          value={med.name}
                          onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., Amoxicillin"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Dosage *
                        </label>
                        <input
                          required
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., 500mg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Frequency *
                        </label>
                        <input
                          required
                          type="text"
                          value={med.frequency}
                          onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., 3 times daily"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., 7 days"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Instructions
                        </label>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) =>
                            updateMedication(idx, 'instructions', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., Take after meals"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Any additional instructions or notes..."
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Prescription'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ViewPrescriptionModal = ({ prescription }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-bold text-slate-900">Prescription Details</h2>
            <button
              onClick={() => setSelectedPrescription(null)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <FaTimes />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {prescription.patient?.user
                      ? formatName(prescription.patient.user)
                      : formatName(prescription.patient)}
                  </h3>
                  <p className="text-slate-600">
                    {prescription.patient?.user?.email || prescription.patient?.email || '—'}
                  </p>
                  {(prescription.patient?.user?.phone || prescription.patient?.phone) && (
                    <p className="text-slate-600">
                      {prescription.patient?.user?.phone || prescription.patient?.phone}
                    </p>
                  )}
                </div>
                <Badge tone={prescription.status === 'active' ? 'success' : 'info'}>
                  {prescription.status || 'active'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Date: </span>
                  <span className="font-medium text-slate-900">
                    {formatDate(new Date(prescription.createdAt))}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Prescription ID: </span>
                  <span className="font-medium text-slate-900 font-mono text-xs">
                    {prescription._id}
                  </span>
                </div>
              </div>
            </div>

            {/* Medications */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Medications</h4>
              <div className="space-y-3">
                {prescription.medications?.map((med, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="font-semibold text-slate-900 mb-2">{med.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">Dosage: </span>
                        <span className="text-slate-900">{med.dosage}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Frequency: </span>
                        <span className="text-slate-900">{med.frequency}</span>
                      </div>
                      {med.duration && (
                        <div>
                          <span className="text-slate-500">Duration: </span>
                          <span className="text-slate-900">{med.duration}</span>
                        </div>
                      )}
                    </div>
                    {med.instructions && (
                      <div className="mt-2 rounded bg-blue-50 p-2 text-sm text-blue-800">
                        <strong>Instructions:</strong> {med.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {prescription.notes && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">Additional Notes</h4>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  {prescription.notes}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <FaDownload /> Download PDF
              </button>
              <button className="flex-1 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2">
                <FaPrint /> Print
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Prescriptions"
      subtitle="Create and manage patient prescriptions"
    >
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                All ({prescriptions.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filterStatus === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Active ({prescriptions.filter((p) => p.status === 'active').length})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filterStatus === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Completed ({prescriptions.filter((p) => p.status === 'completed').length})
              </button>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 transition"
            >
              <FaPlus /> Create Prescription
            </button>
          </div>

          {/* Prescriptions List */}
          {filteredPrescriptions.length === 0 ? (
            <EmptyState
              icon={<FaPrescriptionBottleAlt />}
              message="No prescriptions found"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPrescriptions.map((prescription) => (
                <PrescriptionCard key={prescription._id} prescription={prescription} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <CreatePrescriptionModal />}
      {selectedPrescription && <ViewPrescriptionModal prescription={selectedPrescription} />}
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
