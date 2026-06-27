"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CountrySelect } from "@/components/CountrySelect";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, updateUser, logout } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("leguard_token") : null;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/settings");
      return;
    }
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setDefaultCountry(user.default_country || "United States");
    }
  }, [isAuthenticated, authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: fullName, default_country: defaultCountry }),
      });
      if (res.ok) {
        const data = await res.json();
        updateUser(data);
        setMessage({ type: "success", text: "Profile updated successfully." });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.message || "Update failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    // Stub - account deletion would require a dedicated endpoint
    setMessage({ type: "error", text: "Account deletion is not yet implemented. Contact support." });
    setShowDeleteConfirm(false);
  }

  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h1>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            message.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input type="email" value={email} disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed at this time.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Default Country</label>
              <CountrySelect value={defaultCountry} onChange={setDefaultCountry} />
            </div>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all text-sm">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-bold text-danger mb-2">Danger Zone</h2>
          <p className="text-sm text-slate-500 mb-4">Permanently delete your account and all associated data.</p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2.5 bg-danger text-white font-semibold rounded-xl hover:bg-red-700 transition-all text-sm">
              Delete my account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-danger">Are you absolutely sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={handleDeleteAccount}
                  className="px-6 py-2.5 bg-danger text-white font-semibold rounded-xl hover:bg-red-700 transition-all text-sm">
                  Yes, delete my account
                </button>
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
