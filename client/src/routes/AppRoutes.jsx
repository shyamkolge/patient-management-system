import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import NotFound from '../pages/NotFound.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import AdminPatients from '../pages/admin/Patients.jsx';
import AdminDoctors from '../pages/admin/Doctors.jsx';
import AdminAppointments from '../pages/admin/Appointments.jsx';
import AdminUsers from '../pages/admin/Users.jsx';
import DoctorDashboard from '../pages/doctor/DoctorDashboard.jsx';
import DoctorAppointments from '../pages/doctor/Appointments.jsx';
import DoctorRecords from '../pages/doctor/MedicalRecords.jsx';
import DoctorPrescriptions from '../pages/doctor/Prescriptions.jsx';
import PatientDashboard from '../pages/patient/PatientDashboard.jsx';
import PatientAppointments from '../pages/patient/Appointments.jsx';
import PatientRecords from '../pages/patient/Records.jsx';
import PatientPrescriptions from '../pages/patient/Prescriptions.jsx';
import Profile from '../pages/common/Profile.jsx';

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
  return <Navigate to="/patient" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RoleRedirect />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route
      path="/profile"
      element={(
        <ProtectedRoute roles={['admin', 'doctor', 'patient']}>
          <Profile />
        </ProtectedRoute>
      )}
    />

    <Route
      path="/admin"
      element={(
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin/patients"
      element={(
        <ProtectedRoute roles={['admin']}>
          <AdminPatients />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin/doctors"
      element={(
        <ProtectedRoute roles={['admin']}>
          <AdminDoctors />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin/appointments"
      element={(
        <ProtectedRoute roles={['admin']}>
          <AdminAppointments />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin/users"
      element={(
        <ProtectedRoute roles={['admin']}>
          <AdminUsers />
        </ProtectedRoute>
      )}
    />

    <Route
      path="/doctor"
      element={(
        <ProtectedRoute roles={['doctor']}>
          <DoctorDashboard />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/doctor/appointments"
      element={(
        <ProtectedRoute roles={['doctor']}>
          <DoctorAppointments />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/doctor/records"
      element={(
        <ProtectedRoute roles={['doctor']}>
          <DoctorRecords />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/doctor/prescriptions"
      element={(
        <ProtectedRoute roles={['doctor']}>
          <DoctorPrescriptions />
        </ProtectedRoute>
      )}
    />

    <Route
      path="/patient"
      element={(
        <ProtectedRoute roles={['patient']}>
          <PatientDashboard />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/patient/appointments"
      element={(
        <ProtectedRoute roles={['patient']}>
          <PatientAppointments />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/patient/records"
      element={(
        <ProtectedRoute roles={['patient']}>
          <PatientRecords />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/patient/prescriptions"
      element={(
        <ProtectedRoute roles={['patient']}>
          <PatientPrescriptions />
        </ProtectedRoute>
      )}
    />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
