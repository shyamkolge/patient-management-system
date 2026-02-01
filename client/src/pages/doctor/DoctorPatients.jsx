import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { doctorApi } from '../../api/doctorApi.js';
import { formatDate, formatName } from '../../utils/format.js';
import {
  FaUserInjured,
  FaSearch,
  FaEye,
  FaFileMedical,
  FaPrescriptionBottleAlt,
  FaCalendarCheck,
} from 'react-icons/fa';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter((patient) => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const email = patient.email?.toLowerCase() || '';
        const phone = patient.phone || '';
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search) || phone.includes(search);
      });
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await doctorApi.getPatients();
      setPatients(data.patients || data || []);
      setFilteredPatients(data.patients || data || []);
    } catch (error) {
      console.error('Load patients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewPatientDetails = async (patient) => {
    try {
      setSelectedPatient(patient);
      const history = await doctorApi.getPatientHistory(patient._id);
      setPatientHistory(history);
    } catch (error) {
      console.error('Load patient history error:', error);
    }
  };

  const closePatientDetails = () => {
    setSelectedPatient(null);
    setPatientHistory(null);
  };

  return (
    <DashboardLayout
      title="Patients"
      subtitle="View and manage your patient records"
    >
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-3 pl-12 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3">
                  <FaUserInjured className="text-xl text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
                  <p className="text-sm text-slate-600">Total Patients</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-3">
                  <FaCalendarCheck className="text-xl text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {patients.reduce((sum, p) => sum + (p.appointmentCount || 0), 0)}
                  </p>
                  <p className="text-sm text-slate-600">Total Appointments</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-3">
                  <FaFileMedical className="text-xl text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {patients.reduce((sum, p) => sum + (p.recordCount || 0), 0)}
                  </p>
                  <p className="text-sm text-slate-600">Medical Records</p>
                </div>
              </div>
            </div>
          </div>

          {/* Patient List */}
          {filteredPatients.length === 0 ? (
            <EmptyState
              icon={<FaUserInjured />}
              message={searchTerm ? 'No patients found matching your search' : 'No patients yet'}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-blue-50">
                      {patient.profileImage ? (
                        <img
                          src={patient.profileImage}
                          alt="Patient"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-500">
                          {patient.firstName?.charAt(0)}
                          {patient.lastName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{formatName(patient)}</h3>
                      <p className="text-sm text-slate-600">{patient.email}</p>
                      {patient.phone && (
                        <p className="text-sm text-slate-500">{patient.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {patient.dateOfBirth && (
                      <div>
                        <span className="text-slate-500">Age: </span>
                        <span className="font-medium text-slate-900">
                          {new Date().getFullYear() -
                            new Date(patient.dateOfBirth).getFullYear()}
                        </span>
                      </div>
                    )}
                    {patient.gender && (
                      <div>
                        <span className="text-slate-500">Gender: </span>
                        <span className="font-medium text-slate-900 capitalize">
                          {patient.gender}
                        </span>
                      </div>
                    )}
                    {patient.bloodGroup && (
                      <div>
                        <span className="text-slate-500">Blood: </span>
                        <span className="font-medium text-slate-900">{patient.bloodGroup}</span>
                      </div>
                    )}
                  </div>

                  {patient.allergies && (
                    <div className="mt-3">
                      <Badge tone="danger">Allergies: {patient.allergies}</Badge>
                    </div>
                  )}

                  <button
                    onClick={() => viewPatientDetails(patient)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    <FaEye />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
              <h2 className="text-2xl font-bold text-slate-900">Patient Details</h2>
              <button
                onClick={closePatientDetails}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-start gap-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-white ring-4 ring-blue-100">
                    {selectedPatient.profileImage ? (
                      <img
                        src={selectedPatient.profileImage}
                        alt="Patient"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-500">
                        {selectedPatient.firstName?.charAt(0)}
                        {selectedPatient.lastName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {formatName(selectedPatient)}
                    </h3>
                    <p className="text-slate-600">{selectedPatient.email}</p>
                    {selectedPatient.phone && (
                      <p className="text-slate-600">{selectedPatient.phone}</p>
                    )}
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      {selectedPatient.dateOfBirth && (
                        <div>
                          <span className="text-slate-500">DOB: </span>
                          <span className="font-medium text-slate-900">
                            {formatDate(new Date(selectedPatient.dateOfBirth))}
                          </span>
                        </div>
                      )}
                      {selectedPatient.gender && (
                        <div>
                          <span className="text-slate-500">Gender: </span>
                          <span className="font-medium text-slate-900 capitalize">
                            {selectedPatient.gender}
                          </span>
                        </div>
                      )}
                      {selectedPatient.bloodGroup && (
                        <div>
                          <span className="text-slate-500">Blood: </span>
                          <span className="font-medium text-slate-900">
                            {selectedPatient.bloodGroup}
                          </span>
                        </div>
                      )}
                      {selectedPatient.address && (
                        <div className="col-span-2">
                          <span className="text-slate-500">Address: </span>
                          <span className="font-medium text-slate-900">
                            {selectedPatient.address}
                          </span>
                        </div>
                      )}
                    </div>
                    {selectedPatient.allergies && (
                      <div className="mt-3">
                        <Badge tone="danger">Allergies: {selectedPatient.allergies}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Visit History */}
              {patientHistory ? (
                <>
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <FaCalendarCheck className="text-blue-600" />
                      Visit History
                    </h3>
                    {patientHistory.appointments?.length > 0 ? (
                      <div className="space-y-2">
                        {patientHistory.appointments.map((apt) => (
                          <div
                            key={apt._id}
                            className="rounded-lg border border-slate-200 bg-white p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-slate-900">
                                  {formatDate(new Date(apt.appointmentDate))}
                                </span>
                                <p className="text-sm text-slate-600">{apt.reason}</p>
                              </div>
                              <Badge tone={apt.status === 'completed' ? 'success' : 'info'}>
                                {apt.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">No appointment history</p>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <FaFileMedical className="text-purple-600" />
                      Medical Records
                    </h3>
                    {patientHistory.records?.length > 0 ? (
                      <div className="space-y-2">
                        {patientHistory.records.map((record) => (
                          <div
                            key={record._id}
                            className="rounded-lg border border-slate-200 bg-white p-4"
                          >
                            <div className="font-medium text-slate-900">{record.diagnosis}</div>
                            <p className="text-sm text-slate-600 mt-1">{record.notes}</p>
                            <span className="text-xs text-slate-500">
                              {formatDate(new Date(record.createdAt))}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">No medical records</p>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <FaPrescriptionBottleAlt className="text-green-600" />
                      Prescriptions
                    </h3>
                    {patientHistory.prescriptions?.length > 0 ? (
                      <div className="space-y-2">
                        {patientHistory.prescriptions.map((prescription) => (
                          <div
                            key={prescription._id}
                            className="rounded-lg border border-slate-200 bg-white p-4"
                          >
                            <div className="font-medium text-slate-900">
                              {prescription.medications?.map((med) => med.name).join(', ')}
                            </div>
                            <span className="text-xs text-slate-500">
                              {formatDate(new Date(prescription.createdAt))}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">No prescriptions</p>
                    )}
                  </div>
                </>
              ) : (
                <Spinner />
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorPatients;
