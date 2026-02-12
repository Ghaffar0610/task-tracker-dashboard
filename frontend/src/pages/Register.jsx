import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const Register = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      login({ token: data.token, user: data.user, remember });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Unable to reach the server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <h1 className="text-center text-2xl font-semibold text-gray-800">
          Task Tracker
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Password
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Remember Me
            </label>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="mx-auto block text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
