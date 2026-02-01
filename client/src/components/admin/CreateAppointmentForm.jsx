import { useState } from 'react';

export default function CreateAppointmentForm({ onCreate, creating, error, patients, doctors }) {
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreate(form, () => setForm({
      patient: '',
      doctor: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      notes: '',
    }));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-blue-600 w-7 h-7 text-2xl">📅</span>
        <h3 className="text-xl font-bold text-slate-900">Schedule Appointment</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold mb-1">
              <span className="text-blue-500">👤</span>
              <span>Patient</span>
            </div>
            <select
              name="patient"
              value={form.patient}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
              required
            >
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.user ? `${patient.user.firstName} ${patient.user.lastName}` : ''}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 text-primary font-semibold mb-1">
              <span className="text-blue-500">🩺</span>
              <span>Doctor</span>
            </div>
            <select
              name="doctor"
              value={form.doctor}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
              required
            >
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.user ? `${doctor.user.firstName} ${doctor.user.lastName}` : ''} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold mb-1">
              <span className="text-blue-500">📅</span>
              <span>Date & Time</span>
            </div>
            <input
              type="date"
              name="appointmentDate"
              value={form.appointmentDate}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
              required
            />
            <input
              type="time"
              name="appointmentTime"
              value={form.appointmentTime}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
              required
            />
            <input
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Reason for visit"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
              required
            />
            <input
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notes"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm w-full"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-60 w-full"
        >
          {creating ? 'Scheduling…' : 'Create Appointment'}
        </button>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </form>
    </div>
  );
}
