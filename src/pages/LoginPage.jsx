// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [roles, setRoles] = useState([]); // ✅ multiple roles
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });

      const { user } = res.data;

      if (Array.isArray(user.roles) && user.roles.length > 1) {
        // ✅ Multiple roles → show dropdown
        setRoles(user.roles);
        setErr("Please select a role to continue");
      } else {
        // ✅ Single role → redirect directly
        redirectUser(user.activeRole);
      }
    } catch (error) {
      setErr(error.response?.data?.message || "Login failed");
    }
  };

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setErr("Please select a role");
      return;
    }

    try {
      // ✅ Tell backend which role we are using
      await API.post("/auth/set-role", { role: selectedRole,  withCredentials: true  });

      redirectUser(selectedRole);
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to set role");
    }
  };

  const redirectUser = (role) => {
    setTimeout(() => {
      if (role === "admin") navigate("/admin");
      else if (role === "teacher") navigate("/teacher");
      else if (role === "student") navigate("/student/profile");
      else if (role === "captain") navigate("/captain");
      else navigate("/");
    }, 200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm p-6 bg-white shadow-md rounded"
      >
        <h2 className="text-xl mb-4 text-center font-semibold">Login</h2>
        {err && <p className="text-red-500 mb-2">{err}</p>}

        {!roles.length ? (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              className="w-full p-2 mb-3 border rounded"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              className="w-full p-2 mb-4 border rounded"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
            >
              Login
            </button>
          </>
        ) : (
          <>
            <label className="block mb-2">Select Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="">-- Choose Role --</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleRoleSelection}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
            >
              Continue
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default LoginPage;
