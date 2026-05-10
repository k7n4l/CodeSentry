import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Setting.css";

export default function Settings() {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete Account
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Messages & State
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await axios.put("http://localhost:3001/auth/profile", {
        name,
        email,
      });
      setMessage("Profile updated successfully! 👍");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validation: passwords must match
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    // Validation: current password must be provided
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    // Validation: new password must be strong
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongPassword.test(newPassword)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      );
      return;
    }

    setLoading(true);

    try {
      await axios.put("http://localhost:3001/auth/password", {
        currentPassword,
        newPassword,
      });

      // Clear all password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setMessage("Password changed successfully! 🔒");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setDeleteModalOpen(true);
    setDeleteConfirmation("");
  };

  const handleDeleteAccountConfirm = async () => {
    if (deleteConfirmation !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    setDeleteLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.delete("http://localhost:3001/auth/account");
      setMessage("Account deleted successfully");
      setTimeout(() => {
        logout();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete account");
      setDeleteLoading(false);
    }
  };

  const closeDeleteModal = () => {
    if (!deleteLoading) {
      setDeleteModalOpen(false);
      setDeleteConfirmation("");
      setError("");
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <button
            className={`settings-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Profile
          </button>
          <button
            className={`settings-tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            🔒 Security
          </button>
          <button
            className={`settings-tab ${activeTab === "danger" ? "active" : ""}`}
            onClick={() => setActiveTab("danger")}
          >
            ⚠️ Danger Zone
          </button>
        </div>

        <div className="settings-content">
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {activeTab === "profile" && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Account Type</label>
                  <input
                    type="text"
                    value={user?.role || "user"}
                    disabled
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </div>

                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="settings-section">
              <h2>Change Password</h2>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-field">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="password-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      aria-label="Toggle password visibility"
                    >
                      {showCurrentPassword ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-field">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="password-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showNewPassword ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="password-field">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="password-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="password-requirements">
                  <p>Password must contain:</p>
                  <ul>
                    <li>At least 8 characters</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (@$!%*?&)</li>
                  </ul>
                </div>

                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="settings-section danger-zone">
              <h2>Danger Zone</h2>
              <div className="danger-card">
                <div className="danger-content">
                  <h3>Delete Account</h3>
                  <p>
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                </div>
                <button
                  className="danger-btn"
                  onClick={handleDeleteAccountClick}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="modal-backdrop">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h2>⚠️ Delete Account</h2>
              <button
                className="modal-close"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                ✕
              </button>
            </div>

            <div className="delete-modal-body">
              <p className="delete-warning">
                This action is <strong>permanent</strong> and cannot be undone.
                All your data, reviews, and settings will be permanently
                deleted.
              </p>

              <p className="delete-instruction">
                To confirm, type <strong>"DELETE"</strong> in the field below:
              </p>

              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="delete-input"
                disabled={deleteLoading}
              />
            </div>

            <div className="delete-modal-footer">
              <button
                className="delete-cancel-btn"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-btn"
                onClick={handleDeleteAccountConfirm}
                disabled={deleteLoading || deleteConfirmation !== "DELETE"}
              >
                {deleteLoading ? "Deleting..." : "Delete Account Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
