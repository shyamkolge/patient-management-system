
import { motion } from 'framer-motion';
import { Stethoscope, HeartPulse, Brain, Eye, Baby, Pill } from 'lucide-react';

const services = [
    {
        icon: Stethoscope,
        title: 'General Checkup',
        description: 'Comprehensive annual physicals to keep you healthy and proactive.',
    },
    {
        icon: HeartPulse,
        title: 'Cardiology',
        description: 'Expert care for your heart with advanced diagnostics and treatments.',
    },
    {
        icon: Brain,
        title: 'Neurology',
        description: 'Specialized care for neurological disorders and brain health.',
    },
    {
        icon: Eye,
        title: 'Ophthalmology',
        description: 'Complete eye exams and vision care services for all ages.',
    },
    {
        icon: Baby,
        title: 'Pediatrics',
        description: 'Compassionate care for infants, children, and adolescents.',
    },
    {
        icon: Pill,
        title: 'Pharmacy',
        description: 'On-site pharmacy services for accessible and quick medication.',
    },
];

const Services = () => {
    return (
        <section id="services" className="py-16 sm:py-24 px-4 sm:px-8 md:px-16 lg:px-20 bg-white ">
            <div className="container mx-auto px-0 sm:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-text-main mb-4">
                        Our Specialists <span className="text-primary">Services</span>
                    </h2>
                    <p className="text-text-muted max-w-2xl mx-auto">
                        We provide a wide range of specialized medical services to ensure comprehensive care for you and your family.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 hover:bg-white p-8 rounded-2xl border border-gray-600 hover:border-blue-600 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                        >
                            <div className="w-14 h-14 bg-blue-100 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <service.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-text-main mb-3">{service.title}</h3>
                            <p className="text-text-muted leading-relaxed">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
