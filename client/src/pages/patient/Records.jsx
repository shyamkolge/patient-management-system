import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatName } from '../../utils/format.js';

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [expandedRecord, setExpandedRecord] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/medical-records?limit=20');
      setRecords(response.data.records || []);
    } catch (err) {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((record) => {
    const matchesStatus = statusFilter === 'all'
      ? true
      : (record.consultationStatus || 'ONGOING').toLowerCase() === statusFilter;
    const doctorName = formatName(record.doctor?.user || {}).toLowerCase();
    const diagnosis = (record.diagnosis || '').toLowerCase();
    const complaint = (record.chiefComplaint || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search
      ? true
      : doctorName.includes(search) || diagnosis.includes(search) || complaint.includes(search);
    return matchesStatus && matchesSearch;
  });

  const isNewRecord = (date) => {
    if (!date) return false;
    const recordDate = new Date(date).getTime();
    const days = (Date.now() - recordDate) / (1000 * 60 * 60 * 24);
    return days <= 30;
  };

  const handleExpandRecord = async (recordId) => {
    if (expandedRecordId === recordId) {
      setExpandedRecordId(null);
      setExpandedRecord(null);
      return;
    }

    try {
      setDetailsLoading(true);
      const response = await api.get(`/medical-records/${recordId}`);
      setExpandedRecord(response.data || null);
      setExpandedRecordId(recordId);
    } catch (error) {
      setExpandedRecord(null);
      setExpandedRecordId(recordId);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openFullRecord = async (recordId) => {
    try {
      setDetailsLoading(true);
      const response = await api.get(`/medical-records/${recordId}`);
      setSelectedRecord(response.data || null);
    } catch (error) {
      setSelectedRecord(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Medical Records" subtitle="Your visit history and diagnoses">
      <div className="space-y-6">
        <PageHeader title="Medical Records" subtitle="View and manage your complete medical history" />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="locked">Locked</option>
            </select>
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              More Filters
            </button>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : filteredRecords.length === 0 ? (
          <EmptyState title="No records yet" description="Your medical records will appear here." />
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record._id}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
              >
                <button
                  onClick={() => handleExpandRecord(record._id)}
                  className="w-full"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        📄
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {record.chiefComplaint || 'Medical Visit'}
                          </h3>
                          {isNewRecord(record.visitDate) && (
                            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">New</span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span>👨‍⚕️ {formatName(record.doctor?.user) || 'Doctor'}</span>
                          <span>📅 {formatDate(record.visitDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={record.consultationStatus === 'COMPLETED' ? 'success' : 'info'}>
                        {record.consultationStatus || 'ONGOING'}
                      </Badge>
                      <span className="text-slate-400">▾</span>
                    </div>
                  </div>
                </button>

                {expandedRecordId === record._id && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    {detailsLoading && !expandedRecord ? (
                      <div className="py-4">
                        <Spinner />
                      </div>
                    ) : (
                      <>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">Summary</h4>
                          <p className="mt-2 text-sm text-slate-600">
                            {expandedRecord?.consultationSummary ||
                              expandedRecord?.notes ||
                              expandedRecord?.observations ||
                              'No summary available.'}
                          </p>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-slate-900">Attached Documents</h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(expandedRecord?.attachments || []).length > 0 ? (
                              expandedRecord.attachments.map((file, idx) => (
                                <span
                                  key={`${file.fileName}-${idx}`}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                                >
                                  {file.fileName || 'Document'}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500">No attachments</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            onClick={() => openFullRecord(record._id)}
                            className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600"
                          >
                            View Full Record
                          </button>
                          <button
                            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Download
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
              <h2 className="text-2xl font-bold text-slate-900">Medical Record Details</h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {detailsLoading ? (
              <div className="p-6">
                <Spinner />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-600">Visit Date</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatDate(selectedRecord.visitDate)}
                      </p>
                    </div>
                    <Badge tone={selectedRecord.consultationStatus === 'COMPLETED' ? 'success' : 'info'}>
                      {selectedRecord.consultationStatus || 'ONGOING'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Doctor: {formatName(selectedRecord.doctor?.user) || '—'}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-700">Chief Complaint</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedRecord.chiefComplaint || '—'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-700">Diagnosis</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedRecord.diagnosis || '—'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-700">Treatment</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedRecord.treatment || '—'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-700">Symptoms</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedRecord.symptoms?.length ? selectedRecord.symptoms.join(', ') : '—'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-700">Clinical Observations</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedRecord.observations || '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-700">Vital Signs</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3 text-sm text-slate-600">
                    <div>BP: {selectedRecord.vitalSigns?.bloodPressure || '—'}</div>
                    <div>Heart Rate: {selectedRecord.vitalSigns?.heartRate || '—'}</div>
                    <div>Temperature: {selectedRecord.vitalSigns?.temperature || '—'}</div>
                    <div>Weight: {selectedRecord.vitalSigns?.weight || '—'}</div>
                    <div>Height: {selectedRecord.vitalSigns?.height || '—'}</div>
                    <div>SpO2: {selectedRecord.vitalSigns?.oxygenSaturation || '—'}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-700">Notes</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedRecord.notes || '—'}
                  </p>
                </div>

                {selectedRecord.labResults?.length > 0 && (
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-700">Lab Results</h3>
                    <div className="mt-3 space-y-2">
                      {selectedRecord.labResults.map((lab, idx) => (
                        <div key={`${lab.testName}-${idx}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                          <p className="font-semibold text-slate-800">{lab.testName || 'Test'}</p>
                          <p className="text-slate-600">Result: {lab.result || '—'}</p>
                          {lab.date && (
                            <p className="text-xs text-slate-500">{formatDate(lab.date)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecord.attachments?.length > 0 && (
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-700">Attachments</h3>
                    <div className="mt-3 space-y-2">
                      {selectedRecord.attachments.map((file, idx) => (
                        <div key={`${file.fileName}-${idx}`} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
                          <span className="text-slate-700">{file.fileName || 'File'}</span>
                          {file.fileUrl && (
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              View
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientRecords;
