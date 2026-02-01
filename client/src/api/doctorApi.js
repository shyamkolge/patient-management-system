import { api } from '../services/api.js';

/**
 * Doctor Dashboard Analytics API
 */
export const doctorApi = {
  // Dashboard Analytics
  getDashboardStats: async () => {
    const response = await api.get('/appointments/doctor/stats');
    return response.data?.data || response.data;
  },

  getWeeklyConsultations: async () => {
    const response = await api.get('/appointments/doctor/weekly-stats');
    return response.data?.data || response.data;
  },

  getMonthlyTrends: async () => {
    const response = await api.get('/appointments/doctor/monthly-trends');
    return response.data?.data || response.data;
  },

  getAppointmentStatusDistribution: async () => {
    const response = await api.get('/appointments/doctor/status-distribution');
    return response.data?.data || response.data;
  },

  getTodaySchedule: async () => {
    const response = await api.get('/appointments/doctor/today');
    return response.data?.data?.appointments || response.data?.appointments || [];
  },

  // Appointments
  getAppointmentRequests: async () => {
    const response = await api.get('/appointments/doctor/requests');
    return response.data?.data?.appointments || response.data?.appointments || [];
  },

  getAllAppointments: async (params = {}) => {
    const response = await api.get('/appointments', { params });
    return response.data?.appointments || [];
  },

  getUpcomingAppointments: async (params = {}) => {
    const response = await api.get('/appointments/doctor/upcoming', { params });
    return response.data?.data || response.data;
  },

  getPastAppointments: async (params = {}) => {
    const response = await api.get('/appointments/doctor/past', { params });
    return response.data?.data || response.data;
  },

  updateAppointmentStatus: async (appointmentId, status, data = {}) => {
    const response = await api.patch(`/appointments/${appointmentId}/status`, { status, ...data });
    return response.data?.data || response.data;
  },

  getAppointmentById: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data?.data || response.data;
  },

  startConsultation: async (appointmentId) => {
    const response = await api.post(`/appointments/${appointmentId}/start`);
    return response.data?.data || response.data;
  },

  completeConsultation: async (appointmentId, data) => {
    const response = await api.post(`/appointments/${appointmentId}/complete`, data);
    return response.data?.data || response.data;
  },

  // Schedule Management
  getSchedule: async (startDate, endDate) => {
    const response = await api.get('/appointments/doctor/schedule', {
      params: { startDate, endDate }
    });
    return response.data?.data || response.data;
  },

  updateAvailability: async (data) => {
    const response = await api.put('/doctors/availability', data);
    return response.data?.data || response.data;
  },

  // Patients
  getPatients: async (params = {}) => {
    const response = await api.get('/patients', { params });
    return response.data?.data || response.data;
  },

  getPatientById: async (patientId) => {
    const response = await api.get(`/patients/${patientId}`);
    return response.data?.data || response.data;
  },

  getPatientHistory: async (patientId) => {
    const response = await api.get(`/patients/${patientId}/history`);
    return response.data?.data || response.data;
  },

  // Prescriptions
  getPrescriptions: async (params = {}) => {
    const response = await api.get('/prescriptions', { params });
    return response.data?.data || response.data;
  },

  createPrescription: async (data) => {
    const response = await api.post('/prescriptions', data);
    return response.data?.data || response.data;
  },

  updatePrescription: async (prescriptionId, data) => {
    const response = await api.put(`/prescriptions/${prescriptionId}`, data);
    return response.data?.data || response.data;
  },

  getPrescriptionById: async (prescriptionId) => {
    const response = await api.get(`/prescriptions/${prescriptionId}`);
    return response.data?.data || response.data;
  },

  // Medical Records
  getMedicalRecords: async (params = {}) => {
    const response = await api.get('/medical-records', { params });
    return response.data?.data || response.data;
  },

  createMedicalRecord: async (data) => {
    const response = await api.post('/medical-records', data);
    return response.data?.data || response.data;
  },

  updateMedicalRecord: async (recordId, data) => {
    const response = await api.put(`/medical-records/${recordId}`, data);
    return response.data?.data || response.data;
  },

  getMedicalRecordById: async (recordId) => {
    const response = await api.get(`/medical-records/${recordId}`);
    return response.data?.data || response.data;
  },

  uploadLabReport: async (recordId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/medical-records/${recordId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },
};
