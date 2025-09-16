// src/components/Layout.jsx
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" 
         style={{ backgroundImage: "url('/images/background1.jpg')" }}>
		<div className='h-[50px]'></div>
      <div className="max-w-[1440px] mx-auto">
        <div className="bg-white/60 rounded-xl shadow-xl overflow-hidden">
          <Navbar />
          <div className="flex flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
          <Footer />
        </div>
      </div>
	  <div className='h-[50px]'></div>
    </div>
  );
}

export default Layout;