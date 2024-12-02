'use client';
import { useDispatch, useSelector } from 'react-redux'
import Navbar from './navbar'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { getRequest, updateRequest } from './auth/api_requests';
import { userActions } from './store/userSlice';
import { socket } from './socket';


export default function Home() {
  const dispatch = useDispatch();
  const userStoreData = useSelector((state: any) => state.user);
  const userStateRef = useRef(userStoreData);
  const router = useRouter();
  let [isAuthenticated, setIsAuthenticated] = useState(false);
  let [isEditing, setIsEditing] = useState(false);
  let [errorMessage, setErrorMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  let usernameElement = useRef<HTMLInputElement>(null);
  let phoneElement = useRef<HTMLInputElement>(null);

  // Fetch messages for the current page
  const fetchNotifications = async (page: number) => {
    let jwtToken = localStorage.getItem('access_token') || ''; // Get access token
    const notificationsRes = await getRequest({ path: '/notifications/me', jwt: jwtToken || '', pageNo: page });
    setNotifications(notificationsRes.data.data);
    setPageNumber(notificationsRes.data.page);
    setTotalPages(notificationsRes.data.totalPages || 1);
  };

  // Keep the ref updated
  useEffect(() => {
    userStateRef.current = userStoreData; 
  }, [userStoreData]);

  // Get user data
  useEffect((): any => {
    async function fetchUserData() {
      // Check if user is authenticated
      let jwtToken = localStorage.getItem('access_token') || ''; // Get access token
      if (!jwtToken) {
        router.push('/auth/login');
        return null;
      }
      let userDataRes = await getRequest({ path: '/users/me', jwt: jwtToken || '' });
      if (userDataRes.error) {
        router.push('/auth/login');
        return null;
      } else {
        dispatch(userActions.setUserData(userDataRes.data,));
        setIsAuthenticated(true);
      }
    }

    fetchUserData();
  }, []);

  useEffect(() => {
    socket.on("super-admin-update", (data) => {
      if(userStateRef.current.id !== data.id) return
      dispatch(userActions.setUserData(data.updatedData));
      showNewData(data.updatedData.username, data.updatedData.phoneNumber);
      setNotifications(data.notifications.data);
      setPageNumber(data.notifications.page);
      setTotalPages(data.notifications.totalPages || 1);
    });

    // return () => {
    //   socket.disconnect();
    //   console.log("Disconnected from server");
    // };
  }, []);

  useEffect(() => {
    fetchNotifications(pageNumber);
  }, [pageNumber]);

  const showNewData = (username: string, phoneNumber: string) => {
    if( usernameElement.current && phoneElement.current) {
      usernameElement.current.value = username;
      phoneElement.current.value = phoneNumber;
    }
  }
  const handleEdit = () => { 
    setIsEditing(true);
    toggleEnabled();
  }
  
  const handleSave = async () => { 
    setIsEditing(false);
    toggleEnabled();
    let body = { username: usernameElement.current?.value, phoneNumber: phoneElement.current?.value };
    let res = await updateRequest('/users/me', body, localStorage.getItem('access_token') || '');
    console.log(res);
    if (res.error) {
      cancelChanges();
      setErrorMessage(res.error);
      return;
    }
    dispatch(userActions.setUserData(res.data));
    // setUserState({ ...userState, ...res.data });
  }
  
  const handleCancel = () => {
    setIsEditing(false);
    toggleEnabled();
    cancelChanges();
  }

  const toggleEnabled = () => {
    if (usernameElement.current && phoneElement.current) {
      usernameElement.current.disabled = !usernameElement.current.disabled
      phoneElement.current.disabled = !phoneElement.current.disabled
    }
  }
  const cancelChanges = () => {
    if (usernameElement.current && phoneElement.current) {
      usernameElement.current.value = userStoreData.username;
      phoneElement.current.value = userStoreData.phoneNumber;
    }
  }  

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
      fetchNotifications(pageNumber - 1);
    }
  };

  // Navigate to the next page
  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      setPageNumber(pageNumber + 1);
      fetchNotifications(pageNumber + 1);
    }
  };
  const handleUsernameChange = (e: any) => {
    console.log(e.target.value);
    if (usernameElement.current) { 
      usernameElement.current.value = e.target.value
    }
  }

  return (
    isAuthenticated && (
      <Fragment>
        <Navbar />
        <section className="user-data-container bg-gray-100 p-6 rounded-lg shadow-md max-w-3xl mx-auto mt-8">
          <div className="ml-5 mt-5 mb-5 flex flex-col gap-4">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">Your Personal Data:</h1>
            <div className="flex items-center gap-3">
              <span className="w-32 font-semibold text-gray-700">Username:</span>
              <input 
                type="text" 
                disabled={true} 
                defaultValue={userStoreData.username} 
                onChange={handleUsernameChange}
                ref={usernameElement} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-32 font-semibold text-gray-700">Phone Number:</span>
              <input 
                type="email" 
                disabled={true} 
                defaultValue={userStoreData.phoneNumber} 
                ref={phoneElement} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>
            <p className="flex items-center gap-3">
              <span className="w-32 font-semibold text-gray-700">Email:</span>
              <span className="text-gray-600">{userStoreData.email}</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="w-32 font-semibold text-gray-700">Role:</span>
              <span className="text-gray-600">
                {userStoreData.role
                  .split('-')
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </span>
            </p>
          </div>
          <div className="ml-5 mt-6 flex gap-4">
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300"
              >
                Edit
              </button>
            )}
            {isEditing && (
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>



        <section className="bg-gray-100 p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto mt-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Notifications</h2>
          <div className="space-y-4">
            {notifications.map((notification: any, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-md shadow-sm border border-gray-200 flex justify-between items-center"
              >
                <p className="text-gray-700">{notification.message}</p>
                <span className="text-sm text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrevPage}
              disabled={pageNumber === 1}
              className={`px-4 py-2 rounded-md text-white ${
                pageNumber === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {pageNumber} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pageNumber === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                pageNumber === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
        </section>
      </Fragment>
    )
  )
}
