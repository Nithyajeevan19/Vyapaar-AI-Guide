import { BusinessBranding } from "../../services/geminiService";
import { CalendarClock, Users, IndianRupee, Star, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  useListCustomers,
  useListTasks,
  useGetAnalyticsDashboard,
} from "@workspace/api-client-react";

interface Props {
  branding: BusinessBranding;
}

export function ServiceBusinessCRM({ branding }: Props) {
  const { currentOrgId } = useAuth();
  const orgId = currentOrgId;

  // React Query Hooks
  const { data: stats, isLoading: loadingStats } = useGetAnalyticsDashboard({ orgId });
  const { data: customers = [], isLoading: loadingCusts } = useListCustomers(
    { orgId },
    { query: { queryKey: ["customers", orgId] } as any }
  );
  const { data: tasks = [], isLoading: loadingTasks } = useListTasks(
    { orgId },
    { query: { queryKey: ["tasks", orgId] } as any }
  );

  const isLoading = loadingStats || loadingCusts || loadingTasks;

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  // Derived stats
  const customersCount = stats?.customersCount !== undefined ? stats.customersCount : customers.length;
  const apptsCount = stats?.ordersTotal !== undefined ? stats.ordersTotal : tasks.length;
  const revenueVal = stats?.revenueMonthly !== undefined
    ? `₹${(stats.revenueMonthly / 100).toLocaleString("en-IN")}`
    : "₹28,500";

  return (
    <div className="w-full min-h-full bg-stone-50 text-stone-900 font-sans p-4 md:p-8 overflow-y-auto">
      <header className="mb-10 pb-6 border-b border-stone-200">
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
            style={{ backgroundColor: branding.primaryColor || "#c2410c" }}
          >
            {branding.businessName.charAt(0)}
          </div>
          {branding.businessName} CRM
        </h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Today's Schedule", value: String(apptsCount), icon: CalendarClock, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Total Customers", value: String(customersCount), icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Revenue (MTD)", value: revenueVal, icon: IndianRupee, color: "text-green-600", bg: "bg-green-100" },
          { label: "Average Rating", value: "4.8/5", icon: Star, color: "text-amber-500", bg: "bg-amber-100" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity ${stat.color}`}>
              <stat.icon size={32} />
            </div>
            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-stone-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments / Tasks Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <h2 className="text-xl font-bold text-stone-800">Upcoming Schedule</h2>
          </div>
          <div className="overflow-x-auto">
            {tasks.length === 0 ? (
              <div className="p-10 text-center text-sm text-stone-400 font-medium">No pending tasks or appointments.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-stone-50 text-stone-500 text-sm font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-5">Title</th>
                    <th className="p-5">Due Date</th>
                    <th className="p-5">Description</th>
                    <th className="p-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {tasks.slice(0, 5).map((row: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-stone-50/50 hover:bg-stone-50"}>
                      <td className="p-5 font-bold text-stone-800">{row.title}</td>
                      <td className="p-5 text-stone-600 font-bold">
                        {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-5 text-stone-600 font-medium">{row.description || "-"}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                          row.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col">
          <div className="p-6 border-b border-stone-100 bg-stone-50/50">
            <h2 className="text-xl font-bold text-stone-800">Recent Customer List</h2>
          </div>
          <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[350px]">
            {customers.length === 0 ? (
              <div className="text-center py-10 text-sm text-stone-400 font-medium">No customer records.</div>
            ) : (
              customers.map((c: any, i: number) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== customers.length - 1 && <div className="absolute left-2.5 top-6 w-0.5 h-10 bg-stone-100"></div>}
                  <div 
                    className="w-5 h-5 rounded-full border-4 border-white shadow-sm mt-0.5 z-10 shrink-0"
                    style={{ backgroundColor: branding.primaryColor || "#c2410c" }}
                  />
                  <div>
                    <p className="font-bold text-stone-800">{c.name}</p>
                    <p className="text-sm font-medium text-stone-600 mb-1">{c.phone || "-"}</p>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">{c.notes || "Registered customer"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
