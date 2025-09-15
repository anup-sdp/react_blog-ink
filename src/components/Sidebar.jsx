// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router';
import { 
  FaUser, 
  FaUserShield, 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaHome, 
  FaSignOutAlt 
} from 'react-icons/fa';
import useAuthContext from '../hooks/useAuthContext';

function Sidebar() {
  const { user, logoutUser } = useAuthContext();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
  };

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
  ];

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg p-4 h-full">
      <div className="space-y-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center space-x-3 p-3 rounded-lg transition ${
              location.pathname === item.to 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 rounded-lg text-red-500 hover:bg-red-50 w-full"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;