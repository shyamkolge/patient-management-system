
import { motion } from 'framer-motion';

const experts = [
    {
        name: 'Dr. Sarah Johnson',
        role: 'Chief Cardiologist',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop',
    },
    {
        name: 'Dr. Michael Chen',
        role: 'Neurologist',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop',
    },
    {
        name: 'Dr. Emily Williams',
        role: 'Pediatrician',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974&auto=format&fit=crop',
    },
    {
        name: 'Dr. James Smith',
        role: 'Dermatologist',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
    }
];

const Experts = () => {
    return (
        <section id="experts" className="py-16 sm:py-24 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-text-main mb-4">
                        Meet Our <span className="text-primary">Experts</span>
                    </h2>
                    <p className="text-text-muted max-w-2xl mx-auto">
                        Our team of highly qualified and experienced doctors is dedicated to providing the best possible care.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {experts.map((expert, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className="h-64 overflow-hidden relative">
                                <img
                                    src={expert.image}
                                    alt={expert.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                    <p className="text-white font-medium">Book Appointment</p>
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-lg font-bold text-text-main">{expert.name}</h3>
                                <p className="text-primary font-medium text-sm">{expert.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experts;
