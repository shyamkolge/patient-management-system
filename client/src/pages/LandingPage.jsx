
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Experts from '../components/Experts';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <div className="font-sans antialiased text-text-main bg-white">
            <Navbar />
            <main className="flex flex-col gap-0">
                <Hero />
                <Services />
                <Experts />
                <Contact />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
