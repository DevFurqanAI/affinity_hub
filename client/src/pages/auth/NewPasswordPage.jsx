import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import AuthShell from "../../components/auth/AuthShell.jsx";
import authService from "../../services/authService.js";

const RESET_EMAIL_KEY = "affinity_hub_reset_email";
const RESET_TOKEN_KEY = "affinity_hub_reset_token";

function NewPasswordPage() {
  const navigate = useNavigate();

  const email = sessionStorage.getItem(RESET_EMAIL_KEY) || "";
  const resetToken = sessionStorage.getItem(RESET_TOKEN_KEY) || "";

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  if (!isResetComplete && (!email || !resetToken)) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const result = await authService.resetPassword({
        email,
        resetToken,
        newPassword: formData.newPassword
      });

      setIsResetComplete(true);
      
      sessionStorage.removeItem(RESET_EMAIL_KEY);
      sessionStorage.removeItem(RESET_TOKEN_KEY);

      toast.success(result.message || "Password reset successfully");

      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="New Password"
      title="Create a new password"
      description="Choose a new secure password for your Affinity Hub account."
      footer={
        <p>
          Need a new code?{" "}
          <Link
            to="/forgot-password"
            className="font-black text-rose-500 transition hover:text-rose-400"
          >
            Restart recovery
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="new-reset-password"
          label="New Password"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
          required
        />

        <Input
          id="confirm-reset-password"
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Repeat your new password"
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          className="w-full !border-0 !bg-gradient-to-r !from-rose-600 !to-amber-500 !text-white hover:brightness-110"
          disabled={isLoading}
        >
          {isLoading ? "Resetting Password..." : "Reset Password"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default NewPasswordPage;