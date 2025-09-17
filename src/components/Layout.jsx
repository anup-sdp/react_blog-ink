// src/components/Layout.jsx
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center bg-fixed" 
         style={{ backgroundImage: "url('/images/background1.jpg')" }}>
      <Navbar />
      
      {/* Centered container for sidebar + main */}
      <div className="flex flex-1 pt-4 justify-center">
        <div className="flex w-full max-w-7xl relative">
          <Sidebar />
          
          <main className="flex-1 p-3 md:p-6 h-full w-full min-w-0 md:ml-[4px]">
            <div className="w-full">
              <div className="bg-white/60 rounded-xl shadow-xl p-3 md:p-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Layout;