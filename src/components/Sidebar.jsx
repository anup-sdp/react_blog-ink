// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router';
import { useSidebar } from '../context/SidebarContext';
import { 
  FaHome, 
  FaUser, 
  FaUserShield, 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaSignOutAlt,
  FaBlog,
  FaEdit,
  FaPlus,
  FaTags // Add this import
} from 'react-icons/fa';
import useAuthContext from '../hooks/useAuthContext';

function Sidebar() {
  const { sidebarOpen, closeSidebar } = useSidebar();
  const { user, logoutUser } = useAuthContext();
  const location = useLocation();

  const sidebarItems = [
    { to: '/', icon: <FaHome />, label: 'Home' },
    { to: '/profile', icon: <FaUser />, label: 'My Profile' },
    ...(user && (user.is_staff || user.is_superuser) 
      ? [{ to: '/admin-profile', icon: <FaUserShield />, label: 'Admin Profile' }] 
      : []),
    { to: '/my-payments', icon: <FaCreditCard />, label: 'My Payments' },
    ...(user && (user.is_staff || user.is_superuser) 
      ? [{ to: '/all-payments', icon: <FaMoneyBillWave />, label: 'All Payments' }] 
      : []),
    { to: '/my-blogs', icon: <FaBlog />, label: 'My Blogs' },
    ...(user && (user.is_staff || user.is_superuser) 
      ? [
          { to: '/all-blogs', icon: <FaEdit />, label: 'All Blogs' },
          { to: '/category-management', icon: <FaTags />, label: 'Categories' } // Add this item
        ] 
      : []),
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-16 left-0 z-50 w-64 h-[calc(100vh-4rem)] bg-white rounded-r-lg shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Menu</h2>
          <button 
            onClick={closeSidebar}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-8rem)]">
          {sidebarItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                location.pathname === item.to 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 768) {
                  closeSidebar();
                }
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          
          <button
            onClick={logoutUser}
            className="flex items-center space-x-3 p-3 rounded-lg text-red-500 hover:bg-red-50 w-full"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;