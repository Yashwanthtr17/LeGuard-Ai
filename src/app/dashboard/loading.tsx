export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    </div>
  );
}
