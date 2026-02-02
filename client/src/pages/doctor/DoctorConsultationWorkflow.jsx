import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import { doctorApi } from "../../api/doctorApi.js";
import { formatName } from "../../utils/format.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { toast } from "react-toastify";
import { useSocketContext } from "../../context/SocketContext.jsx";
import {
  FaStethoscope,
  FaPrescriptionBottleAlt,
  FaFileMedical,
  FaClipboardList,
  FaUpload,
  FaArrowLeft,
  FaHistory,
  FaCheck,
  FaLock,
} from "react-icons/fa";

const DoctorConsultationWorkflow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocketContext();
  const initialTab = location.state?.tab || "diagnosis";
  const initialPatientId = location.state?.patientId || "";
  const appointmentId = location.state?.appointmentId || null;

  const [activeWorkflow, setActiveWorkflow] = useState(initialTab);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [workflowSubmitting, setWorkflowSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [patientHistory, setPatientHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [consultationStatus, setConsultationStatus] = useState("ONGOING");
  const [consultationStartTime] = useState(new Date());
  const [consultationId, setConsultationId] = useState(null);
  const [workflowData, setWorkflowData] = useState({
    patientId: initialPatientId,
    chiefComplaint: "",
    chiefComplaintDetail: "",
    observations: "", // New field for clinical observations
    diagnosis: {
      primary: "",
      icd10: "",
      severity: "moderate",
      onsetDate: "",
      chronic: "no",
    },
    symptoms: [],
    treatment: {
      plan: "medication",
      details: "",
    },
    followUpDate: "",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
      oxygenSaturation: "",
    },
    notes: {
      type: "SOAP",
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
    },
    lab: {
      tests: [],
      priority: "routine",
      fasting: "no",
      sampleType: "blood",
      instructions: "",
    },
    prescription: {
      medications: [
        { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ],
      notes: "",
    },
    files: [],
  });

  useEffect(() => {
    setActiveWorkflow(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        const data = await doctorApi.getPatients({ limit: 200 });
        setPatients(data.patients || data || []);

        // Auto-load patient history if patient is pre-selected from appointment
        if (initialPatientId) {
          await fetchPatientHistory(initialPatientId);
        }
      } catch (error) {
        toast.error("Failed to load patients");
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPatientId]);

  const complaintOptions = useMemo(
    () => [
      "General Checkup",
      "Respiratory Issue",
      "Digestive Issue",
      "Pain Management",
      "Skin Condition",
      "Follow-up",
      "Other",
    ],
    [],
  );

  const symptomOptions = useMemo(
    () => [
      "Fever",
      "Cough",
      "Headache",
      "Fatigue",
      "Nausea",
      "Sore Throat",
      "Dizziness",
      "Pain",
    ],
    [],
  );

  const labTestOptions = useMemo(
    () => [
      "CBC",
      "Blood Sugar",
      "Lipid Profile",
      "Liver Function",
      "Kidney Function",
      "Thyroid",
      "X-Ray",
      "MRI",
    ],
    [],
  );

  const workflowTitle = useMemo(
    () =>
      ({
        diagnosis: "Add Diagnosis",
        prescription: "Write Prescription",
        lab: "Order Lab Tests",
        notes: "Add Doctor Notes",
        files: "Upload Files",
      })[activeWorkflow],
    [activeWorkflow],
  );

  const toggleListValue = (list, value) =>
    list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];

  const addMedication = () => {
    setWorkflowData((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        medications: [
          ...prev.prescription.medications,
          {
            name: "",
            dosage: "",
            frequency: "",
            duration: "",
            instructions: "",
          },
        ],
      },
    }));
  };

  const updateMedication = (index, field, value) => {
    setWorkflowData((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        medications: prev.prescription.medications.map((med, i) =>
          i === index ? { ...med, [field]: value } : med,
        ),
      },
    }));
  };

  const removeMedication = (index) => {
    setWorkflowData((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        medications: prev.prescription.medications.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  };

  const fetchPatientHistory = async (patientId) => {
    if (!patientId) return;

    try {
      setLoadingHistory(true);
      const history = await doctorApi.getPatientHistory(patientId);
      setPatientHistory(history);
      setShowHistory(true);
    } catch (error) {
      toast.error("Failed to load patient history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEndConsultation = async () => {
    if (!consultationId) {
      toast.error("No active consultation to end");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to end this consultation? All data will be locked.",
      )
    ) {
      return;
    }

    try {
      const endTime = new Date();
      const duration = Math.round((endTime - consultationStartTime) / 60000); // minutes

      // Generate consultation summary
      const summary = `
Patient: ${patients.find((p) => p._id === workflowData.patientId)?.name || "Unknown"}
Chief Complaint: ${workflowData.chiefComplaint}
Diagnosis: ${workflowData.diagnosis.primary}
Treatment: ${workflowData.treatment.plan}
Duration: ${duration} minutes
Status: COMPLETED
      `.trim();

      await doctorApi.updateMedicalRecord(consultationId, {
        consultationStatus: "COMPLETED",
        consultationEndTime: endTime,
        consultationDuration: duration,
        consultationSummary: summary,
      });

      setConsultationStatus("COMPLETED");

      // Send SMS and Email notification to patient
      try {
        await doctorApi.sendConsultationNotification(
          workflowData.patientId,
          workflowData.prescriptionId || null,
          summary
        );
        toast.info("📧 Notification sent to patient (SMS + Email)");
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
        toast.warning("Consultation completed but notification failed to send");
      }

      // Emit real-time update via socket
      if (socket && workflowData.patientId) {
        socket.emit("consultationEnded", {
          patientId: workflowData.patientId,
          consultationId,
          summary,
        });
      }

      toast.success("✓ Consultation ended successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate("/doctor/records");
      }, 1500);
    } catch (error) {
      toast.error("Failed to end consultation");
    }
  };

  const handleSubmit = async () => {
    if (!workflowData.patientId) {
      toast.error("Please select a patient");
      return;
    }

    if (activeWorkflow === "prescription") {
      const invalidMed = workflowData.prescription.medications.some(
        (med) => !med.name || !med.dosage || !med.frequency || !med.duration,
      );
      if (invalidMed) {
        toast.error(
          "Please complete medication name, dosage, frequency, and duration",
        );
        return;
      }

      try {
        setWorkflowSubmitting(true);
        await doctorApi.createPrescription({
          patient: workflowData.patientId,
          medications: workflowData.prescription.medications,
          instructions: workflowData.prescription.notes,
        });
        toast.success("✅ Prescription created successfully!", {
          autoClose: 2000,
        });
        // Move to lab tests tab after successful save
        setTimeout(() => {
          setActiveWorkflow("lab");
        }, 1500);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to create prescription",
        );
      } finally {
        setWorkflowSubmitting(false);
      }
      return;
    }

    if (
      !workflowData.chiefComplaint ||
      !workflowData.diagnosis.primary ||
      !workflowData.treatment.plan
    ) {
      toast.error("Chief complaint, diagnosis, and treatment are required");
      return;
    }

    // Lab tests are optional - removed validation

    if (activeWorkflow === "files" && workflowData.files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    const chiefComplaintText = `${workflowData.chiefComplaint}${workflowData.chiefComplaintDetail ? ` - ${workflowData.chiefComplaintDetail}` : ""}`;
    const diagnosisText = `${workflowData.diagnosis.primary}${workflowData.diagnosis.icd10 ? ` (ICD-10: ${workflowData.diagnosis.icd10})` : ""} • ${workflowData.diagnosis.severity}`;
    const treatmentText = `${workflowData.treatment.plan}${workflowData.treatment.details ? `: ${workflowData.treatment.details}` : ""}`;
    const notesText = `Type: ${workflowData.notes.type}\nSubjective: ${workflowData.notes.subjective || "—"}\nObjective: ${workflowData.notes.objective || "—"}\nAssessment: ${workflowData.notes.assessment || "—"}\nPlan: ${workflowData.notes.plan || "—"}`;

    const labResults = workflowData.lab.tests.map((testName) => ({
      testName,
      result: "ordered",
      date: new Date(),
    }));

    try {
      setWorkflowSubmitting(true);

      // Show specific toast for diagnosis workflow
      if (activeWorkflow === "diagnosis") {
        toast.info("📋 Saving diagnosis...");
      }

      const record = await doctorApi.createMedicalRecord({
        patient: workflowData.patientId,
        patientId: workflowData.patientId,
        chiefComplaint: chiefComplaintText,
        diagnosis: diagnosisText,
        symptoms: workflowData.symptoms,
        observations: workflowData.observations,
        treatment: treatmentText,
        vitalSigns: workflowData.vitalSigns,
        notes: notesText,
        followUpDate: workflowData.followUpDate || undefined,
        labResults,
        consultationStatus: "ONGOING",
        consultationStartTime: consultationStartTime,
        appointmentId: appointmentId || undefined,
      });

      if (workflowData.files.length > 0 && record?._id) {
        for (const file of workflowData.files) {
          await doctorApi.uploadLabReport(record._id, file);
        }
      }

      // Store consultation ID for later updates
      setConsultationId(record._id);

      // Emit real-time update via socket
      if (socket && workflowData.patientId) {
        socket.emit("consultationStarted", {
          patientId: workflowData.patientId,
          consultationId: record._id,
          diagnosis: diagnosisText,
        });
      }

      // Show specific success message for diagnosis
      if (activeWorkflow === "diagnosis") {
        toast.success(
          "✅ Diagnosis saved successfully! Patient can now view it.",
          {
            autoClose: 2000,
          },
        );
        // Move to prescription tab after successful save
        setActiveWorkflow("prescription");
      } else if (activeWorkflow === "lab") {
        toast.success("✅ Lab tests saved successfully!", {
          autoClose: 2000,
        });
        // Move to notes tab after successful save
        setActiveWorkflow("notes");
      } else if (activeWorkflow === "notes") {
        toast.success("✅ Notes saved successfully!", {
          autoClose: 2000,
        });
        // Move to files tab after successful save
        setActiveWorkflow("files");
      } else {
        toast.success("Medical record created successfully");
      }

      // Don't navigate away, allow doctor to continue or end consultation
      // navigate('/doctor/records');
    } catch (error) {
      if (activeWorkflow === "diagnosis") {
        toast.error(
          "❌ Failed to save diagnosis: " +
            (error.response?.data?.message || "Please try again"),
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create medical record",
        );
      }
    } finally {
      setWorkflowSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Start Consultation"
      subtitle="Structured workflow for patient visits"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{workflowTitle}</h1>
          <p className="text-sm text-slate-500">Structured visit workflow</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveWorkflow("diagnosis")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeWorkflow === "diagnosis"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FaStethoscope className="inline-block mr-1" /> Diagnosis
              </button>
              <button
                onClick={() => setActiveWorkflow("prescription")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeWorkflow === "prescription"
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FaPrescriptionBottleAlt className="inline-block mr-1" />{" "}
                Prescription
              </button>
              <button
                onClick={() => setActiveWorkflow("lab")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeWorkflow === "lab"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FaFileMedical className="inline-block mr-1" /> Lab Tests
              </button>
              <button
                onClick={() => setActiveWorkflow("notes")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeWorkflow === "notes"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FaClipboardList className="inline-block mr-1" /> Notes
              </button>
              <button
                onClick={() => setActiveWorkflow("files")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeWorkflow === "files"
                    ? "bg-slate-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FaUpload className="inline-block mr-1" /> Uploads
              </button>{" "}
            </div>
            {/* Consultation Status & Actions */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  consultationStatus === "ONGOING"
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {consultationStatus === "ONGOING"
                  ? "🟢 ONGOING"
                  : "🔒 COMPLETED"}
              </div>
              {consultationStatus === "ONGOING" && consultationId && (
                <button
                  onClick={handleEndConsultation}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-red-700 hover:to-red-800"
                >
                  <FaCheck /> End Consultation
                </button>
              )}
            </div>{" "}
          </div>

          {loadingPatients ? (
            <div className="py-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-6">
              {activeWorkflow !== "lab" && activeWorkflow !== "notes" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Select Patient *
                    </label>
                    <select
                      value={workflowData.patientId}
                      onChange={(e) => {
                        setWorkflowData({
                          ...workflowData,
                          patientId: e.target.value,
                        });
                        // fetchPatientHistory(e.target.value);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      disabled={consultationStatus === "COMPLETED"}
                    >
                      <option value="">Choose patient</option>
                      {patients.map((patient) => (
                        <option key={patient._id} value={patient._id}>
                          {formatName(patient.user || patient)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-2">
                    {workflowData.patientId && (
                      <button
                        type="button"
                        onClick={() =>
                          fetchPatientHistory(workflowData.patientId)
                        }
                        disabled={loadingHistory}
                        className="flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                      >
                        <FaHistory />{" "}
                        {loadingHistory ? "Loading..." : "View History"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Patient Details Card */}
              {workflowData.patientId && patients.length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4">
                  {(() => {
                    const selectedPatient = patients.find(
                      (p) => p._id === workflowData.patientId
                    );
                    if (!selectedPatient) return null;

                    const user = selectedPatient.user || selectedPatient;
                    return (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-600">
                            PATIENT NAME
                          </p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {formatName(user)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600">
                            AGE / GENDER
                          </p>
                          <p className="mt-1 text-base font-semibold text-slate-900">
                            {selectedPatient.age || user.age || "—"} /{" "}
                            {selectedPatient.gender || user.gender || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600">
                            BLOOD TYPE
                          </p>
                          <p className="mt-1 text-base font-semibold text-slate-900">
                            {selectedPatient.bloodType || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600">
                            CONTACT
                          </p>
                          <p className="mt-1 text-sm text-slate-900">
                            {user.phone || "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Patient History Modal */}
              {showHistory && patientHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                  <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900">
                        Patient Medical History
                      </h3>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4">
                      {patientHistory.medicalRecords?.length > 0 ? (
                        patientHistory.medicalRecords.map((record, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-500">
                                {new Date(
                                  record.visitDate,
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-slate-500">
                                Dr.{" "}
                                {formatName(
                                  record.doctor?.user || record.doctor,
                                )}
                              </span>
                            </div>
                            <div className="grid gap-2 text-sm">
                              <p>
                                <strong>Chief Complaint:</strong>{" "}
                                {record.chiefComplaint}
                              </p>
                              <p>
                                <strong>Diagnosis:</strong> {record.diagnosis}
                              </p>
                              <p>
                                <strong>Treatment:</strong> {record.treatment}
                              </p>
                              {record.symptoms?.length > 0 && (
                                <p>
                                  <strong>Symptoms:</strong>{" "}
                                  {record.symptoms.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-500">
                          No medical history available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeWorkflow !== "prescription" &&
                activeWorkflow !== "lab" &&
                activeWorkflow !== "notes" &&
                activeWorkflow !== "files" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Chief Complaint *
                      </label>
                      <select
                        value={workflowData.chiefComplaint}
                        onChange={(e) =>
                          setWorkflowData({
                            ...workflowData,
                            chiefComplaint: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select complaint</option>
                        {complaintOptions.map((complaint) => (
                          <option key={complaint} value={complaint}>
                            {complaint}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

              {activeWorkflow !== "prescription" &&
                activeWorkflow !== "lab" &&
                activeWorkflow !== "notes" &&
                activeWorkflow !== "files" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Complaint Details
                      </label>
                      <input
                        type="text"
                        value={workflowData.chiefComplaintDetail}
                        onChange={(e) =>
                          setWorkflowData({
                            ...workflowData,
                            chiefComplaintDetail: e.target.value,
                          })
                        }
                        placeholder="e.g., cough for 3 days"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Onset Date
                      </label>
                      <input
                        type="date"
                        value={workflowData.diagnosis.onsetDate}
                        onChange={(e) =>
                          setWorkflowData({
                            ...workflowData,
                            diagnosis: {
                              ...workflowData.diagnosis,
                              onsetDate: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

              {activeWorkflow !== "prescription" &&
                activeWorkflow !== "lab" &&
                activeWorkflow !== "notes" &&
                activeWorkflow !== "files" && (
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-slate-700">
                      Diagnosis Details
                    </h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <input
                        type="text"
                        value={workflowData.diagnosis.primary}
                        onChange={(e) =>
                          setWorkflowData({
                            ...workflowData,
                            diagnosis: {
                              ...workflowData.diagnosis,
                              primary: e.target.value,
                            },
                          })
                        }
                        placeholder="Primary diagnosis"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={workflowData.diagnosis.icd10}
                        onChange={(e) =>
                          setWorkflowData({
                            ...workflowData,
                            diagnosis: {
                              ...workflowData.diagnosis,
                              icd10: e.target.value,
                            },
                          })
                        }
                        placeholder="ICD-10 code"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <select
                        value={workflowData.diagnosis.severity}
                        onChange={(e) =>
                          setWorkflowData({
                            ...workflowData,
                            diagnosis: {
                              ...workflowData.diagnosis,
                              severity: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                      <span>Chronic?</span>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="chronic"
                          value="yes"
                          checked={workflowData.diagnosis.chronic === "yes"}
                          onChange={(e) =>
                            setWorkflowData({
                              ...workflowData,
                              diagnosis: {
                                ...workflowData.diagnosis,
                                chronic: e.target.value,
                              },
                            })
                          }
                        />{" "}
                        Yes
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="chronic"
                          value="no"
                          checked={workflowData.diagnosis.chronic === "no"}
                          onChange={(e) =>
                            setWorkflowData({
                              ...workflowData,
                              diagnosis: {
                                ...workflowData.diagnosis,
                                chronic: e.target.value,
                              },
                            })
                          }
                        />{" "}
                        No
                      </label>
                    </div>
                  </div>
                )}

              {activeWorkflow !== "prescription" &&
                activeWorkflow !== "lab" &&
                activeWorkflow !== "notes" &&
                activeWorkflow !== "files" && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-slate-700">
                      Symptoms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {symptomOptions.map((symptom) => (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() =>
                            setWorkflowData({
                              ...workflowData,
                              symptoms: toggleListValue(
                                workflowData.symptoms,
                                symptom,
                              ),
                            })
                          }
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            workflowData.symptoms.includes(symptom)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-slate-200 text-slate-600"
                          }`}
                        >
                          {symptom}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {activeWorkflow !== "prescription" &&
                activeWorkflow !== "lab" &&
                activeWorkflow !== "notes" &&
                activeWorkflow !== "files" && (
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Clinical Observations
                    </label>
                    <textarea
                      value={workflowData.observations}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          observations: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Doctor's clinical observations during examination..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

              {activeWorkflow !== "prescription" &&
                activeWorkflow !== "lab" &&
                activeWorkflow !== "notes" &&
                activeWorkflow !== "files" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Treatment Plan *
                      </label>
                      <select
                        value={workflowData.treatment.plan}
                        onChange={(e) =>
                          setWorkflowData({
                            ...workflowData,
                            treatment: {
                              ...workflowData.treatment,
                              plan: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="medication">Medication</option>
                        <option value="therapy">Therapy</option>
                        <option value="rest">Rest & Observation</option>
                        <option value="referral">Specialist Referral</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={workflowData.followUpDate}
                        onChange={(e) =>
                          setWorkflowData({
                            ...workflowData,
                            followUpDate: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

              {activeWorkflow !== "prescription" &&
                activeWorkflow !== "lab" &&
                activeWorkflow !== "notes" &&
                activeWorkflow !== "files" && (
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Treatment Details
                    </label>
                    <input
                      type="text"
                      value={workflowData.treatment.details}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          treatment: {
                            ...workflowData.treatment,
                            details: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., 7 days medication course, physiotherapy 3 times weekly"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

              {activeWorkflow !== "prescription" &&
                activeWorkflow !== "lab" &&
                activeWorkflow !== "notes" &&
                activeWorkflow !== "files" && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <input
                      type="text"
                      value={workflowData.vitalSigns.bloodPressure}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          vitalSigns: {
                            ...workflowData.vitalSigns,
                            bloodPressure: e.target.value,
                          },
                        })
                      }
                      placeholder="BP (e.g., 120/80)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={workflowData.vitalSigns.heartRate}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          vitalSigns: {
                            ...workflowData.vitalSigns,
                            heartRate: e.target.value,
                          },
                        })
                      }
                      placeholder="Heart Rate"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={workflowData.vitalSigns.temperature}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          vitalSigns: {
                            ...workflowData.vitalSigns,
                            temperature: e.target.value,
                          },
                        })
                      }
                      placeholder="Temp (°C)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={workflowData.vitalSigns.weight}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          vitalSigns: {
                            ...workflowData.vitalSigns,
                            weight: e.target.value,
                          },
                        })
                      }
                      placeholder="Weight (kg)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={workflowData.vitalSigns.height}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          vitalSigns: {
                            ...workflowData.vitalSigns,
                            height: e.target.value,
                          },
                        })
                      }
                      placeholder="Height (cm)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={workflowData.vitalSigns.oxygenSaturation}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          vitalSigns: {
                            ...workflowData.vitalSigns,
                            oxygenSaturation: e.target.value,
                          },
                        })
                      }
                      placeholder="SpO2 (%)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

              {activeWorkflow === "lab" && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    Order Lab Tests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {labTestOptions.map((test) => (
                      <button
                        key={test}
                        type="button"
                        onClick={() =>
                          setWorkflowData({
                            ...workflowData,
                            lab: {
                              ...workflowData.lab,
                              tests: toggleListValue(
                                workflowData.lab.tests,
                                test,
                              ),
                            },
                          })
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          workflowData.lab.tests.includes(test)
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        {test}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <select
                      value={workflowData.lab.priority}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          lab: {
                            ...workflowData.lab,
                            priority: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <select
                      value={workflowData.lab.fasting}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          lab: { ...workflowData.lab, fasting: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="no">Fasting Not Required</option>
                      <option value="yes">Fasting Required</option>
                    </select>
                    <select
                      value={workflowData.lab.sampleType}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          lab: {
                            ...workflowData.lab,
                            sampleType: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="blood">Blood</option>
                      <option value="urine">Urine</option>
                      <option value="imaging">Imaging</option>
                    </select>
                  </div>
                  <textarea
                    value={workflowData.lab.instructions}
                    onChange={(e) =>
                      setWorkflowData({
                        ...workflowData,
                        lab: {
                          ...workflowData.lab,
                          instructions: e.target.value,
                        },
                      })
                    }
                    placeholder="Lab instructions"
                    rows={2}
                    className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {activeWorkflow === "notes" && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-700">
                      Doctor Notes
                    </h4>
                    <select
                      value={workflowData.notes.type}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          notes: {
                            ...workflowData.notes,
                            type: e.target.value,
                          },
                        })
                      }
                      className="rounded-lg border border-slate-300 px-3 py-1 text-xs"
                    >
                      <option value="SOAP">SOAP</option>
                      <option value="Progress">Progress</option>
                      <option value="Discharge">Discharge</option>
                    </select>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <textarea
                      value={workflowData.notes.subjective}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          notes: {
                            ...workflowData.notes,
                            subjective: e.target.value,
                          },
                        })
                      }
                      placeholder="Subjective"
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <textarea
                      value={workflowData.notes.objective}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          notes: {
                            ...workflowData.notes,
                            objective: e.target.value,
                          },
                        })
                      }
                      placeholder="Objective"
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <textarea
                      value={workflowData.notes.assessment}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          notes: {
                            ...workflowData.notes,
                            assessment: e.target.value,
                          },
                        })
                      }
                      placeholder="Assessment"
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <textarea
                      value={workflowData.notes.plan}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          notes: {
                            ...workflowData.notes,
                            plan: e.target.value,
                          },
                        })
                      }
                      placeholder="Plan"
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}

              {activeWorkflow === "files" && (
                <div className="rounded-xl border border-slate-200 p-6">
                  <h4 className="mb-4 text-lg font-semibold text-slate-900">
                    📎 Upload Medical Documents
                  </h4>
                  <p className="mb-4 text-sm text-slate-600">
                    Upload relevant medical documents, test reports, or images
                  </p>
                  
                  {/* File Upload Area */}
                  <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-6 py-12 transition-all hover:border-blue-500 hover:bg-blue-100">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          files: Array.from(e.target.files || []),
                        })
                      }
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-4xl">📁</div>
                      <div className="text-center">
                        <p className="font-semibold text-slate-900">
                          Drag files here or click to browse
                        </p>
                        <p className="text-xs text-slate-600">
                          Supported: PDF, JPG, JPEG, PNG
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Uploaded Files List */}
                  {workflowData.files.length > 0 && (
                    <div className="mt-6">
                      <h5 className="mb-3 font-semibold text-slate-900">
                        Selected Files ({workflowData.files.length})
                      </h5>
                      <div className="space-y-2">
                        {workflowData.files.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 transition-all hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">
                                {file.name.endsWith('.pdf') ? '📄' : '🖼️'}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {file.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {(file.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setWorkflowData({
                                  ...workflowData,
                                  files: workflowData.files.filter(
                                    (_, i) => i !== idx,
                                  ),
                                })
                              }
                              className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 transition-all hover:bg-red-200"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeWorkflow === "prescription" && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    Medications
                  </h4>
                  <div className="space-y-3">
                    {workflowData.prescription.medications.map((med, idx) => (
                      <div key={idx} className="grid gap-3 md:grid-cols-5">
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) =>
                            updateMedication(idx, "name", e.target.value)
                          }
                          placeholder="Medicine"
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) =>
                            updateMedication(idx, "dosage", e.target.value)
                          }
                          placeholder="Dosage"
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) =>
                            updateMedication(idx, "frequency", e.target.value)
                          }
                          placeholder="Frequency"
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) =>
                            updateMedication(idx, "duration", e.target.value)
                          }
                          placeholder="Duration"
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={med.instructions}
                            onChange={(e) =>
                              updateMedication(
                                idx,
                                "instructions",
                                e.target.value,
                              )
                            }
                            placeholder="Instructions"
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                          {workflowData.prescription.medications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedication(idx)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMedication}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      + Add Medication
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Prescription Notes
                    </label>
                    <textarea
                      value={workflowData.prescription.notes}
                      onChange={(e) =>
                        setWorkflowData({
                          ...workflowData,
                          prescription: {
                            ...workflowData.prescription,
                            notes: e.target.value,
                          },
                        })
                      }
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Additional instructions"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  onClick={() => navigate("/doctor")}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                {activeWorkflow === "lab" && (
                  <button
                    onClick={() => {
                      toast.info("Lab tests skipped");
                      setActiveWorkflow("notes");
                    }}
                    className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                  >
                    Skip Lab Tests
                  </button>
                )}
                {activeWorkflow === "notes" && (
                  <button
                    onClick={() => {
                      toast.info("Notes skipped");
                      setActiveWorkflow("files");
                    }}
                    className="rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100"
                  >
                    Skip Notes
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={workflowSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {workflowSubmitting
                    ? "Saving..."
                    : activeWorkflow === "prescription"
                      ? "Create Prescription"
                      : activeWorkflow === "lab"
                        ? "Order Tests"
                        : activeWorkflow === "notes"
                          ? "Save Notes"
                          : activeWorkflow === "files"
                            ? "Upload & Save"
                            : "Save Record"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorConsultationWorkflow;
