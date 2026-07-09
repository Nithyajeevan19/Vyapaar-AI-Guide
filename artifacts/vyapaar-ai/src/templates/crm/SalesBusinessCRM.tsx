import { BusinessBranding } from "../../services/geminiService";
import { Users, ShoppingBag, IndianRupee, Package, Loader2 } from "lucide-react";
import {
  useListCustomers,
  useListOrders,
  useGetAnalyticsDashboard,
} from "@workspace/api-client-react";

interface Props {
  branding: BusinessBranding;
}

export function SalesBusinessCRM({ branding }: Props) {
  const orgId = 1;

  // React Query Hooks
  const { data: stats, isLoading: loadingStats } = useGetAnalyticsDashboard({ orgId });
  const { data: customers = [], isLoading: loadingCusts } = useListCustomers(
    { orgId },
    { query: { queryKey: ["customers", orgId] } as any }
  );
  const { data: orders = [], isLoading: loadingOrders } = useListOrders(
    { orgId },
    { query: { queryKey: ["orders", orgId] } as any }
  );

  const isLoading = loadingStats || loadingCusts || loadingOrders;

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  // Derived stats
  const customersCount = stats?.customersCount !== undefined ? stats.customersCount : customers.length;
  const ordersCount = stats?.ordersTotal !== undefined ? stats.ordersTotal : orders.length;
  const revenueVal = stats?.revenueMonthly !== undefined
    ? `₹${(stats.revenueMonthly / 100).toLocaleString("en-IN")}`
    : "₹32,400";

  return (
    <div className="w-full min-h-full bg-slate-50 text-slate-900 font-sans p-4 md:p-8 overflow-y-auto">
      <header className="mb-10 pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
            style={{ backgroundColor: branding.primaryColor || "#6366f1" }}
          >
            {branding.businessName.charAt(0)}
          </div>
          {branding.businessName} CRM
        </h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Customers", value: String(customersCount), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Orders Placed", value: String(ordersCount), icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Monthly Revenue", value: revenueVal, icon: IndianRupee, color: "text-green-600", bg: "bg-green-100" },
          { label: "Active Presets", value: "24", icon: Package, color: "text-orange-600", bg: "bg-orange-100" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity ${stat.color}`}>
              <stat.icon size={32} />
            </div>
            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Recent Customers</h2>
          </div>
          <div className="overflow-x-auto">
            {customers.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400 font-medium">No customers registered yet.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-5">Name</th>
                    <th className="p-5">Phone</th>
                    <th className="p-5">Email</th>
                    <th className="p-5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.slice(0, 5).map((row: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50 hover:bg-slate-50"}>
                      <td className="p-5 font-bold text-slate-800">{row.name}</td>
                      <td className="p-5 text-slate-600 font-medium">{row.phone || "-"}</td>
                      <td className="p-5 text-slate-600">{row.email || "-"}</td>
                      <td className="p-5 text-slate-400 text-xs truncate max-w-xs">{row.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Order List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Pending Orders</h2>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[350px]">
            {orders.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-400 font-medium">No pending orders.</div>
            ) : (
              orders.map((order: any, i: number) => {
                const customer = customers.find((c: any) => c.id === order.customerId);
                return (
                  <div key={i} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-800 text-base mb-1">Order #{order.id}</p>
                      <p className="text-xs font-semibold text-slate-500">{customer?.name || "Walk-in Customer"}</p>
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded uppercase">{order.status}</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-black text-slate-800 text-base mb-2">₹{(order.totalAmount / 100).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
