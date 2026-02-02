import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { doctorApi } from '../../api/doctorApi.js';
import { formatDate, formatName } from '../../utils/format.js';
import {
  FaFileMedical,
  FaPlus,
  FaEye,
  FaEdit,
  FaUpload,
  FaTimes,
  FaFileAlt,
  FaTrash,
  FaDownload,
} from 'react-icons/fa';

const DoctorMedicalRecords = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await doctorApi.getMedicalRecords();
      setRecords(data.records || data || []);
    } catch (error) {
      console.error('Load medical records error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const patientName = formatName(record.patient?.user || record.patient).toLowerCase();
    const diagnosis = record.diagnosis?.toLowerCase() || '';
    return patientName.includes(search) || diagnosis.includes(search);
  });

  const MedicalRecordCard = ({ record }) => {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-slate-900">
                {formatName(record.patient?.user || record.patient)}
              </h3>
              <Badge tone="info">{formatDate(new Date(record.createdAt))}</Badge>
            </div>
            <p className="text-sm text-slate-600">
              {record.patient?.user?.email || record.patient?.email || '—'}
            </p>
          </div>
          <button
            onClick={() => setSelectedRecord(record)}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 transition"
            title="View Details"
          >
            <FaEye />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Diagnosis</p>
            <p className="text-sm font-semibold text-slate-900">{record.diagnosis}</p>
          </div>

          {record.symptoms && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Symptoms</p>
              <p className="text-sm text-slate-700">{record.symptoms}</p>
            </div>
          )}

          {record.treatment && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Treatment</p>
              <p className="text-sm text-slate-700">{record.treatment}</p>
            </div>
          )}

          {record.labReports && record.labReports.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                Lab Reports ({record.labReports.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {record.labReports.slice(0, 3).map((report, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
                  >
                    <FaFileAlt /> {report.name || `Report ${idx + 1}`}
                  </span>
                ))}
                {record.labReports.length > 3 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    +{record.labReports.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {record.notes && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-slate-700">Additional Notes:</p>
            <p className="text-slate-600 line-clamp-2">{record.notes}</p>
          </div>
        )}
      </div>
    );
  };

  const CreateRecordModal = () => {
    const [formData, setFormData] = useState({
      patientId: '',
      diagnosis: '',
      symptoms: '',
      treatment: '',
      notes: '',
      followUpDate: '',
    });
    const [patients, setPatients] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    useEffect(() => {
      doctorApi.getPatients({ limit: 100 }).then((data) => {
        setPatients(data.patients || data || []);
      });
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        const newRecord = await doctorApi.createMedicalRecord(formData);
        
        // Upload lab reports if any
        if (uploadedFiles.length > 0) {
          for (const file of uploadedFiles) {
            await doctorApi.uploadLabReport(newRecord._id, file);
          }
        }

        setShowCreateModal(false);
        loadRecords();
      } catch (error) {
        console.error('Create record error:', error);
        alert('Failed to create medical record');
      } finally {
        setSubmitting(false);
      }
    };

    const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...files]);
    };

    const removeFile = (index) => {
      setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-bold text-slate-900">Create Medical Record</h2>
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
                    {formatName(patient?.user || patient)} - {patient?.user?.email || patient?.email || '—'}
                  </option>
                ))}
              </select>
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Diagnosis *
              </label>
              <input
                required
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., Acute Bronchitis"
              />
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Symptoms
              </label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Describe patient symptoms..."
              />
            </div>

            {/* Treatment */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Treatment Plan
              </label>
              <textarea
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Treatment plan and recommendations..."
              />
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Follow-up Date
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Lab Reports Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Upload Lab Reports
              </label>
              <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FaUpload className="text-3xl text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-900">
                    Click to upload files
                  </span>
                  <span className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB</span>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <FaFileAlt className="text-blue-600" />
                        <span className="text-sm text-slate-900">{file.name}</span>
                        <span className="text-xs text-slate-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                placeholder="Any additional observations or notes..."
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Record'}
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

  const ViewRecordModal = ({ record }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-bold text-slate-900">Medical Record Details</h2>
            <button
              onClick={() => setSelectedRecord(null)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <FaTimes />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Patient Info */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-white ring-4 ring-blue-100">
                  {record.patient?.user?.profileImage || record.patient?.profileImage ? (
                    <img
                      src={record.patient?.user?.profileImage || record.patient?.profileImage}
                      alt="Patient"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-500">
                      {record.patient?.user?.firstName?.charAt(0) || record.patient?.firstName?.charAt(0)}
                      {record.patient?.user?.lastName?.charAt(0) || record.patient?.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {formatName(record.patient?.user || record.patient)}
                  </h3>
                  <p className="text-slate-600">
                    {record.patient?.user?.email || record.patient?.email || '—'}
                  </p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Age: </span>
                      <span className="text-slate-900">
                        {record.patient?.dateOfBirth || record.patient?.user?.dateOfBirth
                          ? new Date().getFullYear() -
                            new Date(record.patient?.dateOfBirth || record.patient?.user?.dateOfBirth).getFullYear()
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Blood Group: </span>
                      <span className="text-slate-900">
                        {record.patient?.bloodGroup || record.patient?.user?.bloodGroup || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge tone="info">{formatDate(new Date(record.createdAt))}</Badge>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Diagnosis</h4>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-slate-900">{record.diagnosis}</p>
              </div>
            </div>

            {/* Symptoms */}
            {record.symptoms && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Symptoms</h4>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-slate-700">{record.symptoms}</p>
                </div>
              </div>
            )}

            {/* Treatment */}
            {record.treatment && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Treatment Plan</h4>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-slate-700">{record.treatment}</p>
                </div>
              </div>
            )}

            {/* Lab Reports */}
            {record.labReports && record.labReports.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  Lab Reports ({record.labReports.length})
                </h4>
                <div className="space-y-2">
                  {record.labReports.map((report, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="text-2xl text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-900">
                            {report.name || `Lab Report ${idx + 1}`}
                          </p>
                          {report.uploadDate && (
                            <p className="text-xs text-slate-500">
                              Uploaded: {formatDate(new Date(report.uploadDate))}
                            </p>
                          )}
                        </div>
                      </div>
                      <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
                        <FaDownload /> Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up */}
            {record.followUpDate && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Follow-up</h4>
                <div className="rounded-lg border border-slate-200 bg-blue-50 p-4">
                  <p className="text-blue-900">
                    Scheduled: {formatDate(new Date(record.followUpDate))}
                  </p>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {record.notes && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Additional Notes</h4>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-slate-700">{record.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Medical Records"
      subtitle="Manage patient diagnosis and medical records"
    >
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by patient name or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 transition whitespace-nowrap"
            >
              <FaPlus /> Create Record
            </button>
          </div>

          {/* Records Grid */}
          {filteredRecords.length === 0 ? (
            <EmptyState
              icon={<FaFileMedical />}
              message={searchTerm ? 'No records found' : 'No medical records yet'}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredRecords.map((record) => (
                <MedicalRecordCard key={record._id} record={record} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <CreateRecordModal />}
      {selectedRecord && <ViewRecordModal record={selectedRecord} />}
    </DashboardLayout>
  );
};

export default DoctorMedicalRecords;
