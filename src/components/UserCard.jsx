// src/components/UserCard.jsx
import { Link } from 'react-router';

const UserCard = ({ user }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-64 flex flex-col">
      <div className="p-4 flex flex-col items-center text-center flex-grow">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
          <span className="text-xl font-bold text-blue-600">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{user.username}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-1">{user.email}</p>
        {user.location && (
          <p className="text-gray-600 text-sm mb-3">{user.location}</p>
        )}
        <Link 
          to={`/profile/${user.id}`}
          className="mt-auto text-blue-500 hover:text-blue-700 text-sm font-medium"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default UserCard;