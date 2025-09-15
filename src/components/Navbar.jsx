// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router';
import { FaHome, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import useAuthContext from '../hooks/useAuthContext';

function Navbar() {
  const { user, logoutUser } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-b-lg shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <FaHome className="mr-2" /> BlogInk
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="hidden md:inline">Welcome, {user.full_name || user.username}</span>
              <button 
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition flex items-center"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition flex items-center"
              >
                <FaSignInAlt className="mr-2" /> Login
              </Link>
              <Link 
                to="/register" 
                className="bg-transparent border-2 border-white px-4 py-2 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition flex items-center"
              >
                <FaUserPlus className="mr-2" /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;