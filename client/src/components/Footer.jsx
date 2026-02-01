
import { Rocket, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#0f172a] text-white pt-12 sm:pt-20 pb-8 sm:pb-10">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-16">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 text-2xl font-bold text-white mb-6">
                            <Rocket className="w-8 h-8 text-primary" />
                            <span>CarePlus</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Providing world-class healthcare with a focus on patient comfort and advanced medical treatments.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            {['About Us', 'Services', 'Our Experts', 'Contact Us', 'Book Appointment'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Services</h4>
                        <ul className="space-y-4">
                            {['Cardiology', 'Neurology', 'Pediatrics', 'Ophthalmology', 'Dental Care'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Newsletter</h4>
                        <p className="text-gray-400 mb-4">Subscribe to our newsletter for health tips and updates.</p>
                        <div className="flex flex-col gap-4">
                            <input type="email" placeholder="Your email address" className="bg-gray-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none" />
                            <button className="bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition-colors cursor-pointer">Subscribe</button>
                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4 text-gray-500 text-xs sm:text-sm">
                    <p>© 2024 CarePlus Medical. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span>for better health</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
