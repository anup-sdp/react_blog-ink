// src/components/Footer.jsx
function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg shadow-lg mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} BlogInk. All rights reserved.</p>
        <div className="mt-4 flex justify-center space-x-6">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;