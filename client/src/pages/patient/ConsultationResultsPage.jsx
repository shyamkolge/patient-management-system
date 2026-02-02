import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { toast } from 'react-toastify';
import { useSocketContext } from '../../context/SocketContext.jsx';
import { FaDownload, FaPrescriptionBottleAlt, FaFileMedical, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { api } from '../../services/api.js';
import { generatePrescriptionPDF, generateConsultationSummaryPDF } from '../../utils/pdfGenerator.js';

const PatientConsultationResultsPage = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocketContext();
  
  const [consultation, setConsultation] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveUpdate, setLiveUpdate] = useState(false);

  useEffect(() => {
    fetchConsultationDetails();
  }, [consultationId]);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    socket.on('consultationStarted', (data) => {
      if (data.consultationId === consultationId) {
        setLiveUpdate(true);
        toast.info('🔄 Doctor has started consultation', {
          position: 'top-right',
          autoClose: 3000,
        });
        fetchConsultationDetails();
      }
    });

    socket.on('consultationEnded', (data) => {
      if (data.consultationId === consultationId) {
        setLiveUpdate(true);
        toast.success('✓ Consultation completed!', {
          position: 'top-right',
          autoClose: 5000,
        });
        fetchConsultationDetails();
      }
    });

    socket.on('prescriptionCreated', (data) => {
      if (data.consultationId === consultationId) {
        toast.info('📄 New prescription available', {
          position: 'top-right',
          autoClose: 3000,
        });
        fetchConsultationDetails();
      }
    });

    return () => {
      socket.off('consultationStarted');
      socket.off('consultationEnded');
      socket.off('prescriptionCreated');
    };
  }, [socket, consultationId]);

  const fetchConsultationDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/medical-records/${consultationId}`);
      setConsultation(response.data?.data || response.data);
      
      // Fetch prescription if exists
      if (response.data?.prescriptionId) {
        const prescRes = await api.get(`/prescriptions/${response.data.prescriptionId}`);
        setPrescription(prescRes.data?.data || prescRes.data);
      }
    } catch (error) {
      toast.error('Failed to load consultation details');
    } finally {
      setLoading(false);
      setLiveUpdate(false);
    }
  };

  const handleDownloadPrescription = () => {
    if (!prescription || !consultation) return;
    
    const prescriptionData = {
      patient: {
        name: consultation.patient?.user?.name || 'Unknown',
        age: consultation.patient?.age,
        gender: consultation.patient?.gender,
      },
      doctor: {
        name: consultation.doctor?.user?.name || 'Unknown',
        licenseNumber: consultation.doctor?.licenseNumber,
        specialization: consultation.doctor?.specialization,
      },
      medications: prescription.medications,
      date: consultation.visitDate,
      notes: prescription.notes,
    };
    
    generatePrescriptionPDF(prescriptionData);
    toast.success('Prescription downloaded');
  };

  const handleDownloadSummary = () => {
    if (!consultation) return;
    
    const summaryData = {
      patient: {
        name: consultation.patient?.user?.name || 'Unknown',
        age: consultation.patient?.age,
        gender: consultation.patient?.gender,
      },
      doctor: {
        name: consultation.doctor?.user?.name || 'Unknown',
        specialization: consultation.doctor?.specialization,
      },
      date: consultation.visitDate,
      chiefComplaint: consultation.chiefComplaint,
      diagnosis: consultation.diagnosis,
      symptoms: consultation.symptoms,
      observations: consultation.observations,
      treatment: consultation.treatment,
      vitalSigns: consultation.vitalSigns,
      followUpDate: consultation.followUpDate,
      duration: consultation.consultationDuration,
    };
    
    generateConsultationSummaryPDF(summaryData);
    toast.success('Consultation summary downloaded');
  };

  if (loading) {
    return (
      <DashboardLayout title="Consultation Results">
        <div className="flex h-96 items-center justify-center">
          <Spinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!consultation) {
    return (
      <DashboardLayout title="Consultation Results">
        <div className="text-center py-12">
          <p className="text-slate-600">No consultation found</p>
        </div>
      </DashboardLayout>
    );
  }

  const isCompleted = consultation.consultationStatus === 'COMPLETED';
  const isOngoing = consultation.consultationStatus === 'ONGOING';

  return (
    <DashboardLayout
      title="Consultation Results"
      subtitle="View your consultation details and documents"
    >
      <div className="space-y-6">
        {/* Status Banner */}
        <div className={`rounded-xl border p-4 ${
          isCompleted 
            ? 'border-green-200 bg-green-50' 
            : 'border-blue-200 bg-blue-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCheckCircle className={`text-2xl ${isCompleted ? 'text-green-600' : 'text-blue-600'}`} />
              <div>
                <h3 className="font-semibold text-slate-900">
                  {isCompleted ? 'Consultation Completed' : 'Consultation Ongoing'}
                </h3>
                <p className="text-sm text-slate-600">
                  {isCompleted 
                    ? `Completed on ${new Date(consultation.consultationEndTime).toLocaleString()}`
                    : 'Your doctor is currently reviewing your case'
                  }
                </p>
              </div>
            </div>
            {liveUpdate && (
              <div className="animate-pulse text-sm font-semibold text-blue-600">
                🔄 Live Update
              </div>
            )}
          </div>
        </div>

        {/* Consultation Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Consultation Details</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-500">Date & Time</p>
              <p className="text-slate-900">{new Date(consultation.visitDate).toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-slate-500">Doctor</p>
              <p className="text-slate-900">Dr. {consultation.doctor?.user?.name || 'Unknown'}</p>
              {consultation.doctor?.specialization && (
                <p className="text-sm text-slate-600">{consultation.doctor.specialization}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">Chief Complaint</p>
              <p className="text-slate-900">{consultation.chiefComplaint}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">Diagnosis</p>
              <p className="text-slate-900">{consultation.diagnosis}</p>
            </div>

            {consultation.symptoms?.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-slate-500">Symptoms</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {consultation.symptoms.map((symptom, idx) => (
                    <span key={idx} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {consultation.observations && (
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-slate-500">Clinical Observations</p>
                <p className="text-slate-900">{consultation.observations}</p>
              </div>
            )}

            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-slate-500">Treatment Plan</p>
              <p className="text-slate-900">{consultation.treatment}</p>
            </div>
          </div>

          {/* Vital Signs */}
          {consultation.vitalSigns && Object.values(consultation.vitalSigns).some(v => v) && (
            <div className="mt-6">
              <h3 className="mb-3 font-semibold text-slate-900">Vital Signs</h3>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {consultation.vitalSigns.bloodPressure && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500">BP</p>
                    <p className="text-lg font-semibold text-slate-900">{consultation.vitalSigns.bloodPressure}</p>
                  </div>
                )}
                {consultation.vitalSigns.heartRate && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500">Heart Rate</p>
                    <p className="text-lg font-semibold text-slate-900">{consultation.vitalSigns.heartRate} bpm</p>
                  </div>
                )}
                {consultation.vitalSigns.temperature && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500">Temp</p>
                    <p className="text-lg font-semibold text-slate-900">{consultation.vitalSigns.temperature} °F</p>
                  </div>
                )}
                {consultation.vitalSigns.oxygenSaturation && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500">SpO2</p>
                    <p className="text-lg font-semibold text-slate-900">{consultation.vitalSigns.oxygenSaturation}%</p>
                  </div>
                )}
                {consultation.vitalSigns.weight && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500">Weight</p>
                    <p className="text-lg font-semibold text-slate-900">{consultation.vitalSigns.weight} kg</p>
                  </div>
                )}
                {consultation.vitalSigns.height && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500">Height</p>
                    <p className="text-lg font-semibold text-slate-900">{consultation.vitalSigns.height} cm</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Prescription */}
        {prescription && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <FaPrescriptionBottleAlt className="text-green-600" />
                Prescription
              </h2>
              <button
                onClick={handleDownloadPrescription}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <FaDownload /> Download PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-green-200 text-left">
                    <th className="py-2 text-sm font-semibold text-slate-700">#</th>
                    <th className="py-2 text-sm font-semibold text-slate-700">Medicine</th>
                    <th className="py-2 text-sm font-semibold text-slate-700">Dosage</th>
                    <th className="py-2 text-sm font-semibold text-slate-700">Frequency</th>
                    <th className="py-2 text-sm font-semibold text-slate-700">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medications.map((med, idx) => (
                    <tr key={idx} className="border-b border-green-100">
                      <td className="py-2 text-sm text-slate-900">{idx + 1}</td>
                      <td className="py-2 text-sm font-semibold text-slate-900">{med.name}</td>
                      <td className="py-2 text-sm text-slate-700">{med.dosage}</td>
                      <td className="py-2 text-sm text-slate-700">{med.frequency}</td>
                      <td className="py-2 text-sm text-slate-700">{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {prescription.notes && (
              <div className="mt-4 rounded-lg border border-green-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-700">Instructions:</p>
                <p className="text-sm text-slate-600">{prescription.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Lab Tests */}
        {consultation.labResults?.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
              <FaFileMedical className="text-amber-600" />
              Lab Tests Ordered
            </h2>
            <div className="space-y-2">
              {consultation.labResults.map((test, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-4 py-3">
                  <span className="font-medium text-slate-900">{test.testName}</span>
                  <span className="text-sm text-slate-600">
                    {test.result === 'ordered' ? '🔄 Pending' : test.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up */}
        {consultation.followUpDate && (
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-slate-900">
              <FaCalendarAlt className="text-purple-600" />
              Follow-up Appointment
            </h2>
            <p className="text-lg font-semibold text-purple-700">
              {new Date(consultation.followUpDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Please schedule your follow-up appointment on or before this date.
            </p>
          </div>
        )}

        {/* Download Actions */}
        {isCompleted && (
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDownloadSummary}
              className="flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-6 py-3 font-semibold text-blue-600 hover:bg-blue-100"
            >
              <FaDownload /> Download Consultation Summary
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientConsultationResultsPage;
