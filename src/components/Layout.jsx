// src/components/Layout.jsx
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center bg-fixed" 
         style={{ backgroundImage: "url('/images/background1.jpg')" }}>
      <Navbar />
      <Sidebar />
      
      <div className="flex flex-1 pt-16 md:pl-64">
        <main className="flex-1 p-6">
          <div className="max-w-[1440px] mx-auto my-16">
            <div className="bg-white/80 rounded-xl shadow-xl p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

export default Layout;