import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface User {
  _id: string;
  email: string;
}

const Dashboard = () => {
  const { token, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [data, setUserData] = useState<User | null>(null);

  useEffect(() => {
    async function getUserData() {
      try {
        setLoading(true);

        const res = await axios.get<User>("http://localhost:8000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(res.data);
      } catch (error) {
        console.log(error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            logout();
          }
        }
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      getUserData();
    }
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log(data);

  return (
    <div>
      <h1>DASHBOARD</h1>

      {data && (
        <div>
          <p>ID: {data._id}</p>
          <p>Email: {data.email}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
