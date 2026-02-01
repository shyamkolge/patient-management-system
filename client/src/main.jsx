import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";

import {
  LoginPage,
  SignupPage,
  ProtectedRoute,
  NotFound,
} from "./pages/index.js";

import {
  AdminDashboard,
  AdminPatients,
  AdminDoctors,
  AdminAppointments,
  AdminUsers,
} from "./pages/admin/index.js";

import {
  DoctorDashboard,
  DoctorAppointments,
  DoctorSchedule,
  DoctorPatients,
  DoctorPrescriptions,
  DoctorMedicalRecords,
  AppointmentDetailsPage,
} from "./pages/doctor/index.js";

import {
  PatientDashboard,
  PatientAppointments,
  PatientAppointmentDetailsPage,
  PatientRecords,
  LabReportsPage,
  PatientPrescriptions,
} from "./pages/patient/index.js";

import Profile from "./pages/common/Profile.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={["admin", "doctor", "patient"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/patients"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDoctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor"
        element={
          <ProtectedRoute roles={["doctor"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute roles={["doctor"]}>
            <DoctorAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments/:appointmentId"
        element={
          <ProtectedRoute roles={["doctor"]}>
            <AppointmentDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/schedule"
        element={
          <ProtectedRoute roles={["doctor"]}>
            <DoctorSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute roles={["doctor"]}>
            <DoctorPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescriptions"
        element={
          <ProtectedRoute roles={["doctor"]}>
            <DoctorPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/records"
        element={
          <ProtectedRoute roles={["doctor"]}>
            <DoctorMedicalRecords />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient"
        element={
          <ProtectedRoute roles={["patient"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute roles={["patient"]}>
            <PatientAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments/:appointmentId"
        element={
          <ProtectedRoute roles={["patient"]}>
            <PatientAppointmentDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/records"
        element={
          <ProtectedRoute roles={["patient"]}>
            <PatientRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/reports"
        element={
          <ProtectedRoute roles={["patient"]}>
            <LabReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/prescriptions"
        element={
          <ProtectedRoute roles={["patient"]}>
            <PatientPrescriptions />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SocketContextProvider>
        <RouterProvider router={router} />
      </SocketContextProvider>
    </AuthProvider>
  </StrictMode>
);
