import { useState, useEffect } from 'react';
import { formatName } from '../../utils/format.js';
import { FaUserMd, FaCalendarAlt, FaClock, FaCreditCard, FaStickyNote, FaCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

export const AppointmentRequestForm = ({ doctors, onSubmit, loading, initialData }) => {
    const initialFormState = {
        doctor: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        notes: '',
        paymentMode: 'offline',
    };
    
    const [currentStage, setCurrentStage] = useState(1); // 1: Doctor, 2: Date/Time, 3: Payment
    const [form, setForm] = useState(initialData || initialFormState);

    useEffect(() => {
        const handleReset = () => {
            setForm(initialFormState);
            setCurrentStage(1);
        };

        window.addEventListener('resetAppointmentForm', handleReset);
        return () => window.removeEventListener('resetAppointmentForm', handleReset);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    const canProceedToStage2 = () => {
        return form.doctor && form.reason;
    };

    const canProceedToStage3 = () => {
        return form.appointmentDate && form.appointmentTime;
    };

    const handleNext = () => {
        if (currentStage === 1 && canProceedToStage2()) {
            setCurrentStage(2);
        } else if (currentStage === 2 && canProceedToStage3()) {
            setCurrentStage(3);
        }
    };

    const handleBack = () => {
        if (currentStage > 1) {
            setCurrentStage(currentStage - 1);
        }
    };

    const selectedDoctor = doctors.find(d => d._id === form.doctor);

    return (
        <div className="bg-white">
            {/* Progress Indicator */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    {[1, 2, 3].map((stage) => (
                        <div key={stage} className="flex items-center flex-1">
                            <div className="flex flex-col items-center gap-1.5 flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                    stage < currentStage
                                        ? 'bg-green-500 text-white'
                                        : stage === currentStage
                                        ? 'bg-cyan-500 text-white ring-4 ring-cyan-100'
                                        : 'bg-slate-200 text-slate-500'
                                }`}>
                                    {stage < currentStage ? <FaCheck /> : stage}
                                </div>
                                <span className={`text-xs font-medium hidden sm:block ${
                                    stage <= currentStage ? 'text-slate-700' : 'text-slate-400'
                                }`}>
                                    {stage === 1 ? 'Select Doctor' : stage === 2 ? 'Date & Time' : 'Payment'}
                                </span>
                            </div>
                            {stage < 3 && (
                                <div className={`h-0.5 flex-1 -mx-2 ${
                                    stage < currentStage ? 'bg-green-500' : 'bg-slate-200'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">

                {/* Stage 1: Doctor Selection */}
                {currentStage === 1 && (
                    <div className="space-y-5">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-1 text-sm">Step 1: Choose Your Doctor</h4>
                            <p className="text-xs text-blue-700">Select a specialist and provide reason for your visit.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <FaUserMd className="text-blue-500" /> Select Doctor *
                            </label>
                            <select
                                name="doctor"
                                value={form.doctor}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                                required
                            >
                                <option value="">Choose a specialist...</option>
                                {doctors.map((doctor) => (
                                    <option key={doctor._id} value={doctor._id}>
                                        {formatName(doctor.user)} - {doctor.specialization}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedDoctor && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {formatName(selectedDoctor.user).charAt(0)}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-900 text-sm">{formatName(selectedDoctor.user)}</h5>
                                        <p className="text-xs text-slate-600">{selectedDoctor.specialization}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Reason for visit *</label>
                            <input
                                name="reason"
                                value={form.reason}
                                onChange={handleChange}
                                placeholder="e.g. Annual checkup, Fever, Consultation..."
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <FaStickyNote className="text-slate-400" /> Additional Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Any specific symptoms or questions..."
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!canProceedToStage2()}
                            className="w-full rounded-xl bg-blue-600 py-3 md:py-3.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Continue to Date & Time
                            <FaArrowRight />
                        </button>
                    </div>
                )}

                {/* Stage 2: Date & Time Selection */}
                {currentStage === 2 && (
                    <div className="space-y-5">
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                            <h4 className="font-bold text-green-900 mb-1 text-sm">Step 2: Schedule Appointment</h4>
                            <p className="text-xs text-green-700">Pick a convenient date and time for your visit.</p>
                        </div>

                        {/* Selected Doctor Summary */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                            <p className="text-xs text-slate-600 mb-1">Booking with:</p>
                            <p className="font-bold text-slate-900 text-sm">{formatName(selectedDoctor.user)}</p>
                            <p className="text-xs text-slate-600">{form.reason}</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <FaCalendarAlt className="text-blue-500" /> Appointment Date *
                            </label>
                            <input
                                type="date"
                                name="appointmentDate"
                                value={form.appointmentDate}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <FaClock className="text-blue-500" /> Appointment Time *
                            </label>
                            <input
                                type="time"
                                name="appointmentTime"
                                value={form.appointmentTime}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex-1 rounded-xl bg-slate-200 py-3 md:py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
                            >
                                <FaArrowLeft />
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!canProceedToStage3()}
                                className="flex-1 rounded-xl bg-blue-600 py-3 md:py-3.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Continue to Payment
                                <FaArrowRight />
                            </button>
                        </div>
                    </div>
                )}

                {/* Stage 3: Payment Method */}
                {currentStage === 3 && (
                    <div className="space-y-5">
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <h4 className="font-bold text-purple-900 mb-1 text-sm">Step 3: Choose Payment Method</h4>
                            <p className="text-xs text-purple-700">Select how you'd like to pay for this appointment.</p>
                        </div>

                        {/* Appointment Summary */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                            <p className="text-xs text-slate-500 font-medium">Appointment Summary</p>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Doctor:</span>
                                    <span className="font-medium text-slate-900">{formatName(selectedDoctor.user)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Date:</span>
                                    <span className="font-medium text-slate-900">{new Date(form.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Time:</span>
                                    <span className="font-medium text-slate-900">{form.appointmentTime}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Reason:</span>
                                    <span className="font-medium text-slate-900">{form.reason}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <FaCreditCard className="text-slate-500" /> Payment Method *
                            </label>
                            <div className="space-y-3">
                                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.paymentMode === 'offline'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-slate-200 hover:bg-slate-50'
                                    }`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMode" 
                                        value="offline" 
                                        checked={form.paymentMode === 'offline'} 
                                        onChange={handleChange} 
                                        className="mt-1" 
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 text-sm mb-1">Pay at Clinic</div>
                                        <p className="text-xs text-slate-600">Pay with cash or card when you arrive for your appointment</p>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        form.paymentMode === 'online'
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-slate-200 hover:bg-slate-50'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="paymentMode"
                                        value="online"
                                        checked={form.paymentMode === 'online'}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 text-sm mb-1">Pay Online Now</div>
                                        <p className="text-xs text-slate-600">Secure payment with card or UPI through our payment gateway</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex-1 rounded-xl bg-slate-200 py-3 md:py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
                            >
                                <FaArrowLeft />
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-xl bg-green-600 py-3 md:py-3.5 text-sm font-bold text-white shadow-lg hover:bg-green-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : 'Confirm Booking'}
                                <FaCheck />
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};
