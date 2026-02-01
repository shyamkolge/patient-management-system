
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const Hero = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGetStarted = () => {
        if (user && user.role === 'admin') {
            navigate('/admin');
        } else if (user && user.role === 'doctor') {
            navigate('/doctor');
        } else if (user && user.role === 'patient') {
            navigate('/patient');
        } else {
            navigate('/login');
        }
    };
    return (
        <section id="home" className="relative pt-16 sm:pt-20 px-4 sm:px-8 md:px-16 lg:px-20 pb-16 sm:pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
            <div className="container mx-auto px-0 sm:px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-10 sm:gap-12 lg:gap-20">

                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-primary-dark px-4 py-2 rounded-full text-sm font-semibold mb-6">
                                <Activity className="w-4 h-4" />
                                <span>#1 Healthcare Provider</span>
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-bold text-text-main leading-tight mb-6">
                                Your Health, Our <br />
                                <span className="text-primary">Top Priority</span>
                            </h1>
                            <p className="text-text-muted text-lg lg:text-xl mb-8 max-w-2xl mx-auto lg:mx-0">
                                Experience world-class healthcare with our team of expert doctors and state-of-the-art facilities. We are dedicated to providing comprehensive care for you and your family.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <button
                                    className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2 cursor-pointer"
                                    onClick={handleGetStarted}
                                >
                                    Get Started <ArrowRight className="w-5 h-5" />
                                </button>
                                <button className="w-full sm:w-auto bg-white border border-gray-200 hover:border-primary text-text-main hover:text-primary px-8 py-4 rounded-xl font-bold text-lg transition-all cursor-pointer">
                                    Learn More
                                </button>
                            </div>

                            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <Users className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-main">10k+</p>
                                        <p className="text-xs text-text-muted">Happy Patients</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-purple-100 p-2 rounded-lg">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-main">100%</p>
                                        <p className="text-xs text-text-muted">Secure Data</p>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </div>

                    <div className="flex-1 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative z-10"
                        >
                            <img
                                src="./hero1.png"
                                alt="Medical Team"
                                className="rounded-3xl shadow-2xl w-full h-auto object-cover max-h-[600px]"
                            />

                            {/* Floating Card 1 */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl hidden md:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-main">Expert Doctors</p>
                                        <p className="text-xs text-text-muted">24/7 Availability</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Card 2 */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.8 }}
                                className="absolute top-10 -right-8 bg-white p-4 rounded-2xl shadow-xl hidden md:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-main">Top Rated</p>
                                        <p className="text-xs text-text-muted">Clinic 2024</p>
                                    </div>
                                </div>
                            </motion.div>

                        </motion.div>

                        {/* Background Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-blue-200/50 to-purple-200/50 rounded-full blur-3xl -z-10 animate-pulse"></div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;
