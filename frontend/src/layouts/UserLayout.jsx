import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const UserLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Navbar />
            
            <main className="flex-1">
                {children}
            </main>
            
            <Footer />
        </div>
    );
};

export default UserLayout;