'use client';
import { useSelector } from 'react-redux';
import './globals.css'
import Link from "next/link"
import { settings } from '@/app.config'
import { usePathname, useRouter } from 'next/navigation';
import { postRequest } from './auth/api_requests';

export default function Navbar() {
  let userData = useSelector((state: any) => state.user);
  const router = useRouter();
  let currentPath = usePathname()
  
  const handleLogout = () => {
    // Clear the access token from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Redirect to login page
    router.push('/auth/login');
  };

  const handle2FA = async () => {
    // send a request to the backend
    let jwtToken = localStorage.getItem('access_token') || '';
    let response = await postRequest('/auth/send-otp', {}, jwtToken)
    if (response.error) {
      alert(response.error)
    }

    // Redirect to the 2FA page
    router.push('/auth/2fa');
  }

  return (
    <header className="bg-gray-800 p-4 shadow-md">
      <nav className="container mx-auto flex items-center">
      {/* <nav className="container mx-auto flex justify-between items-center"> */}
        <ul className="flex justify-center flex-grow space-x-6">
          <li>
            <Link
              href="/"
              key="home"
              className={` hover:text-gray-400 transition duration-300 ${currentPath == "/" ? 'text-blue-500 underline': 'text-white'}`} >
              Home
            </Link>
          </li>
          {
            userData.role === settings.userRoles.superAdmin &&
            <li>
              <Link
                href="/dashboard"
                key="dashboard"
                className={` hover:text-gray-400 transition duration-300 ${currentPath == "/dashboard" ? 'text-blue-500 underline': 'text-white'}`} >
                Dashboard
              </Link>
            </li>
          }
        </ul>
        <button
          onClick={handle2FA}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 mr-4"
        >
          2FA
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300 mr-4"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}