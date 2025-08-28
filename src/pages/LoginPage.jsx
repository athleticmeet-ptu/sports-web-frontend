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
      const res = await API.post("/auth/login", { email, password }, { withCredentials: true });


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
    // ✅ Correct: withCredentials must be in config, not in body
   const res= await API.post(
      "/auth/set-role",
      { role: selectedRole },   // body
      { withCredentials: true } // ✅ config
    );
    const newRole = res.data.activeRole;
    redirectUser(newRole);
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
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-50">
    <form
      onSubmit={handleLogin}
      className="w-full max-w-sm p-8 bg-white shadow-lg rounded-2xl border border-gray-100"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Welcome To GNDEC SPORTS 👋
      </h2>

      {err && (
        <p className="text-red-500 mb-4 text-center font-medium bg-red-50 p-2 rounded">
          {err}
        </p>
      )}

      {!roles.length ? (
        <>
          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-600 text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field with Eye Toggle */}
          <div className="mb-6 relative">
            <label className="block text-gray-600 text-sm mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Eye / Hide Icon (no extra package, just emoji) */}
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 cursor-pointer text-gray-500 hover:text-gray-700 select-none"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-[1.02] shadow-md"
          >
            Login
          </button>
        </>
      ) : (
        <>
          {/* Role Selection */}
          <label className="block text-gray-600 text-sm mb-2">Select Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
          >
            <option value="">-- Choose Role --</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleRoleSelection}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-[1.02] shadow-md"
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
