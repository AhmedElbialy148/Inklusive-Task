'use client';

import { useEffect, useState, ChangeEvent, FormEvent, Fragment, useRef } from "react";
import { getRequest, postRequest, updateRequest } from "../auth/api_requests";
import { useRouter } from "next/navigation";
import Navbar from "../navbar";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../store/userSlice";
import { socket } from "../socket";

interface NewUser {
  id: string;
  username: string;
  email: string;
  password: string;
}
interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  status: "active" | "inactive";
  role: "super-admin" | "admin";
}

interface PaginatedResponse<T> {
  data: T[];
  pageNumber: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const userStoreData = useSelector((state: any) => state.user);
  let router = useRouter()
  const [users, setUsers] = useState<User[]>([]);
  let usersRef = useRef(users);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });
  const [currentUserId, setCurrentUserId] = useState('');
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [newUser, setNewUser] = useState<NewUser>({
    id: "",
    username: "",
    email: "",
    password: "",
  });

  // Keep the ref updated
  useEffect(() => {
    usersRef.current = users; 
  }, [users]);

  // Fetch paginated users
  const fetchUsers = async (page: number = 1) => {
    try {
      const response = await getRequest({
        path: '/users', pageNo: page, perPage: pagination.perPage, jwt: localStorage.getItem('access_token') || ''
      });
      if (response.error) throw new Error(response.error);
      setCurrentUserId(response.data.currentUserId);
      setUsers(response.data.data);
      setPagination({
        pageNumber: response.data.page,
        perPage: response.data.perPage,
        total: response.data.total,
        totalPages: response.data.totalPages || 1,
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };
  async function fetchCurrentUser() {
    let userDataRes = await getRequest({ path: '/users/me', jwt: localStorage.getItem('access_token') || '' });
    if (userDataRes.error) {
      router.push('/auth/login');
      return null;
    } else {
      dispatch(userActions.setUserData(userDataRes.data,));
    }
  }
  // Fetch users on component mount or when pagination changes
  useEffect(() => {
    // Check if user is authenticated
    let jwtToken = localStorage.getItem('access_token') || ''; // Get access token
    if (!jwtToken) {
      router.push('/auth/login');
      return;
    }
    fetchUsers(pagination.pageNumber);
    fetchCurrentUser();
  }, [pagination.pageNumber]);


  useEffect(() => {
    socket.on("admin-update", (data) => {
      let updatedUserIndex = usersRef.current.findIndex((user) => user.id === data.id);
      if (updatedUserIndex === -1) return;
      let newUsersData = [...usersRef.current];
      newUsersData[updatedUserIndex] = data.updatedData;
      setUsers(newUsersData);
    });

    // return () => {
    //   socket.disconnect();
    //   console.log("Disconnected from server");
    // };
  }, []);

  // Handle input changes for creating a new user
  const handleNewUserChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  // Create a new user
  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let jwt = localStorage.getItem('access_token') || ''
      const response = await postRequest("/users", newUser, jwt);
      if (response.data) {
        fetchUsers(pagination.pageNumber); // Refresh users after adding
        setNewUser({ id: "", username: "", email: "", password: "" });
      } else {
        alert("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Toggle editing for a specific user
  const toggleEdit = (userId: string) => {
    setIsEditing((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Handle user data editing
  const handleUserChange = (e: ChangeEvent<HTMLInputElement>, userId: string) => {
    const { name, value } = e.target;
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, [name]: value } : user
      )
    );
  };

  // Save user data
  const handleSave = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    try {
      const response = await updateRequest(`/users/${userId}`, user, localStorage.getItem('access_token') || '');
      if (response.data) {
        setIsEditing((prev) => ({ ...prev, [userId]: false }));
        fetchUsers(pagination.pageNumber); // Refresh users after editing
      } else {
        alert("Failed to save user data");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };
  const formatRole = (role: string) => {
    return role.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }


  return (
    <Fragment>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        {/* Section 1: Create New User */}
        <section className="mb-10 bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Create New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Username Input */}
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleNewUserChange}
                placeholder="Username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {/* Email Input */}
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Password Input */}
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleNewUserChange}
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Create User
            </button>
          </form>
        </section>


        {/* Section 2: Existing Users Table */}
        <section className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Users</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Username</th>
                <th className="border border-gray-300 px-4 py-2">Role</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Phone Number</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {isEditing[user.id] ? (
                      <input
                        type="text"
                        name="username"
                        value={user.username}
                        onChange={(e) => handleUserChange(e, user.id)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      user.username
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {isEditing[user.id] && currentUserId !== user.id.toString() ? (
                      <input
                        type="text"
                        name="role"
                        value={formatRole(user.role)}
                        onChange={(e) => handleUserChange(e, user.id)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      formatRole(user.role)
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{user.status}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {isEditing[user.id] ? (
                      <input
                        type="text"
                        name="phoneNumber"
                        value={user.phoneNumber || ''}
                        onChange={(e) => handleUserChange(e, user.id)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      user.phoneNumber || ''
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 flex gap-2">
                    {isEditing[user.id] ? (
                      <>
                        <button
                          onClick={() => handleSave(user.id)}
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => toggleEdit(user.id)}
                          className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => toggleEdit(user.id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(pagination.pageNumber - 1)}
              disabled={pagination.pageNumber === 1}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            <p>
              Page {pagination.pageNumber} of {pagination.totalPages}
            </p>
            <button
              onClick={() => handlePageChange(pagination.pageNumber + 1)}
              disabled={pagination.pageNumber === pagination.totalPages}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </Fragment>  
  );
}
