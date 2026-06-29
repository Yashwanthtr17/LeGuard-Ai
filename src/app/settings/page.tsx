"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useUpdateProfile } from "@/lib/hooks/use-auth";
import { useUpdatePassword, useDeleteAccount, useExportData } from "@/lib/hooks/use-settings";
import { useTheme } from "@/lib/theme-context";
import { CountrySelect } from "@/components/CountrySelect";

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
        enabled ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionCard({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface rounded-2xl border border-border p-6 ${className || ""}`}>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="text-sm text-subtle mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function ThemeCard({ label, icon, selected, onClick }: { label: string; icon: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-surface hover:border-primary/30 hover:bg-surface-hover"
      }`}
    >
      <div className={`w-full h-20 rounded-lg flex items-center justify-center overflow-hidden ${
        label === "Light" ? "bg-white" : label === "Dark" ? "bg-slate-900" : "bg-gradient-to-br from-white to-slate-900"
      }`}>
        {icon}
      </div>
      <span className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>{label}</span>
    </button>
  );
}

export default function SettingsPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const deleteAccount = useDeleteAccount();
  const exportData = useExportData();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [twoFactorEnabled] = useState(false);

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    marketing_emails: false,
  });

  const [themePreference, setThemePreference] = useState<"light" | "dark" | "system">("light");

  const initRef = useRef(false);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const token = localStorage.getItem("leguard_token");
      const res = await fetch("/api/sessions", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
    enabled: !!user,
  });

  const deleteSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const token = localStorage.getItem("leguard_token");
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete session");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace("/login?redirect=/settings");
      return;
    }
    if (user && !initRef.current) {
      initRef.current = true;
      setFullName(user.full_name || "");
      setDefaultCountry(user.default_country || "United States");

      const stored = localStorage.getItem("leguard_theme_preference") as "light" | "dark" | "system" | null;
      setThemePreference(stored || (theme === "dark" ? "dark" : "light"));
    }
  }, [user, userLoading, router, theme]);

  if (userLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    updateProfile.mutate(
      { full_name: fullName, default_country: defaultCountry },
      {
        onSuccess: () => {
          setMessage({ type: "success", text: "Profile updated successfully." });
        },
        onError: (err) => {
          setMessage({ type: "error", text: err.message || "Update failed." });
        },
      }
    );
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setMessage(null);
    updatePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setMessage({ type: "success", text: "Password changed successfully." });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err) => {
          setMessage({ type: "error", text: err.message || "Failed to change password." });
        },
      }
    );
  }

  function handleDeleteAccount() {
    setMessage(null);
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        router.push("/");
      },
      onError: (err) => {
        setMessage({ type: "error", text: err.message || "Account deletion failed." });
        setShowDeleteConfirm(false);
      },
    });
  }

  function handleNotificationToggle(key: keyof typeof notifications) {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updateProfile.mutate(updated as unknown as Record<string, unknown>, {
      onError: () => {
        setNotifications(notifications);
      },
    });
  }

  function handleThemeChange(pref: "light" | "dark" | "system") {
    setThemePreference(pref);
    localStorage.setItem("leguard_theme_preference", pref);
    if (pref === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    } else {
      setTheme(pref);
    }
    updateProfile.mutate({ theme: pref } as unknown as Record<string, unknown>);
  }

  function handleExportData() {
    exportData.mutate(undefined, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "leguard-export.json";
        a.click();
        URL.revokeObjectURL(url);
        setMessage({ type: "success", text: "Data exported successfully." });
      },
      onError: () => {
        setMessage({ type: "error", text: "Export failed." });
      },
    });
  }

  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6 pb-16">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-subtle text-sm mt-1">Manage your account preferences and security</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium animate-fade-in ${
            message.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"
          }`}>
            {message.text}
          </div>
        )}

        <SectionCard title="Profile" description="Update your personal information">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-surface-hover text-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted mt-1">Email cannot be changed at this time.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Default Country</label>
              <CountrySelect value={defaultCountry} onChange={setDefaultCountry} />
            </div>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all text-sm"
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Appearance" description="Customize how LeGuard-AI looks">
          <div className="flex gap-4">
            <ThemeCard
              label="Light"
              selected={themePreference === "light"}
              onClick={() => handleThemeChange("light")}
              icon={
                <div className="flex flex-col gap-1.5 w-full px-3">
                  <div className="h-1.5 w-12 rounded-full bg-amber-300" />
                  <div className="h-1.5 w-full rounded-full bg-slate-200" />
                  <div className="h-1.5 w-3/4 rounded-full bg-slate-200" />
                  <div className="h-1.5 w-1/2 rounded-full bg-slate-200" />
                </div>
              }
            />
            <ThemeCard
              label="Dark"
              selected={themePreference === "dark"}
              onClick={() => handleThemeChange("dark")}
              icon={
                <div className="flex flex-col gap-1.5 w-full px-3">
                  <div className="h-1.5 w-12 rounded-full bg-indigo-400" />
                  <div className="h-1.5 w-full rounded-full bg-slate-700" />
                  <div className="h-1.5 w-3/4 rounded-full bg-slate-700" />
                  <div className="h-1.5 w-1/2 rounded-full bg-slate-700" />
                </div>
              }
            />
            <ThemeCard
              label="System"
              selected={themePreference === "system"}
              onClick={() => handleThemeChange("system")}
              icon={
                <div className="flex items-center justify-center w-full h-full relative">
                  <div className="absolute left-2 top-2 bottom-2 w-1/2 rounded-lg bg-white border border-slate-200 flex flex-col gap-1 p-1.5">
                    <div className="h-1 w-6 rounded-full bg-amber-300" />
                    <div className="h-1 w-full rounded-full bg-slate-200" />
                    <div className="h-1 w-3/4 rounded-full bg-slate-200" />
                  </div>
                  <div className="absolute right-2 top-2 bottom-2 w-1/3 rounded-lg bg-slate-900 border border-slate-700 flex flex-col gap-1 p-1.5">
                    <div className="h-1 w-4 rounded-full bg-indigo-400" />
                    <div className="h-1 w-full rounded-full bg-slate-700" />
                    <div className="h-1 w-3/4 rounded-full bg-slate-700" />
                  </div>
                </div>
              }
            />
          </div>
        </SectionCard>

        <SectionCard title="Security" description="Manage your password and authentication">
          <div className="space-y-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
              <div>
                <label className="block text-sm font-medium text-subtle mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-subtle mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-subtle mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={updatePassword.isPending}
                className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all text-sm"
              >
                {updatePassword.isPending ? "Updating..." : "Update Password"}
              </button>
            </form>

            <hr className="border-border" />

            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Two-Factor Authentication</h3>
                  <p className="text-xs text-subtle">Add an extra layer of security to your account</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-warning bg-warning/10 px-2 py-0.5 rounded-full">Coming Soon</span>
                  <Toggle enabled={twoFactorEnabled} onChange={() => {}} />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
                  <p className="text-xs text-subtle">Devices logged into your account</p>
                </div>
              </div>
              <div className="space-y-3">
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-muted text-center py-4">No active sessions.</p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-hover border border-border"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {session.device}
                            {session.isCurrent && <span className="text-xs text-primary ml-2 font-normal">(Current)</span>}
                          </p>
                          <p className="text-xs text-subtle truncate">{session.browser} &middot; {session.location} &middot; {session.ip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs text-muted">{session.lastActive}</span>
                        {!session.isCurrent && (
                          <button
                            onClick={() => deleteSession.mutate(session.id)}
                            disabled={deleteSession.isPending}
                            className="text-xs font-semibold text-danger hover:underline disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Notifications" description="Choose what email updates you receive">
          <div className="space-y-4">
            {[
              { key: "email_notifications" as const, label: "Email Notifications", description: "Receive email updates about your account" },
              { key: "marketing_emails" as const, label: "Marketing", description: "Promotions and special offers" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-subtle">{item.description}</p>
                </div>
                <Toggle enabled={notifications[item.key]} onChange={() => handleNotificationToggle(item.key)} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Data & Privacy" description="Manage your data and export options">
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleExportData}
              disabled={exportData.isPending}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-all text-left group disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Export My Data</p>
                <p className="text-xs text-subtle">Download all your personal data in JSON format</p>
              </div>
              <svg className="w-5 h-5 text-muted group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </SectionCard>

        <div className="bg-surface rounded-2xl border border-danger/30 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-danger">Danger Zone</h2>
            <p className="text-sm text-subtle mt-1">Irreversible actions that affect your account</p>
          </div>
          <p className="text-sm text-subtle mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteAccount.isPending}
              className="px-6 py-2.5 bg-danger text-white font-semibold rounded-xl hover:bg-red-700 transition-all text-sm disabled:opacity-50"
            >
              {deleteAccount.isPending ? "Deleting..." : "Delete my account"}
            </button>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <p className="text-sm font-semibold text-danger">Are you absolutely sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteAccount.isPending}
                  className="px-6 py-2.5 bg-danger text-white font-semibold rounded-xl hover:bg-red-700 transition-all text-sm disabled:opacity-50"
                >
                  {deleteAccount.isPending ? "Deleting..." : "Yes, delete my account"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-hover transition-all text-sm"
                >
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
