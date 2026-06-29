"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCheck, Bell, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useRealtimeNotifications } from "@/lib/hooks/use-realtime-notifications";
import { useQueryClient } from "@tanstack/react-query";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("leguard_token");
}

async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const limit = PAGE_SIZE;
  const offset = page * PAGE_SIZE;

  const { data: notifications = [], isLoading } = useNotifications(limit);
  const displayed = notifications.slice(offset, offset + limit);

  useRealtimeNotifications();

  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));

  async function handleMarkRead(id: string) {
    try {
      await authFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      // silently fail
    }
  }

  async function handleDelete(id: string) {
    try {
      await authFetch(`/api/notifications/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      // silently fail
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500 mt-1">
              Stay updated with your document analyses and alerts
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="w-12 h-12 text-slate-300 mb-4" />
            <h2 className="text-lg font-semibold text-slate-700 mb-1">No notifications</h2>
            <p className="text-sm text-slate-500">You&apos;re all caught up!</p>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {displayed.map((n) => (
                <li
                  key={n.id}
                  className={`group flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    n.read
                      ? "bg-white border-slate-200"
                      : "bg-primary/5 border-primary/20"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!n.read && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                      <p
                        className={`text-sm truncate ${
                          n.read ? "text-slate-700" : "text-slate-900 font-semibold"
                        }`}
                      >
                        {n.title}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-slate-600">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
