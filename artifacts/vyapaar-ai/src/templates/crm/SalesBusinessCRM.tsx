import { BusinessBranding } from "../../services/geminiService";
import { Users, ShoppingBag, IndianRupee, Package } from "lucide-react";

interface Props {
  branding: BusinessBranding;
}

export function SalesBusinessCRM({ branding }: Props) {
  return (
    <div className="w-full min-h-full bg-slate-50 text-slate-900 font-sans p-4 md:p-8 overflow-y-auto">
      <header className="mb-10 pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
            style={{ backgroundColor: branding.primaryColor }}
          >
            {branding.businessName.charAt(0)}
          </div>
          {branding.businessName} CRM
        </h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Customers", value: "128", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Orders This Month", value: "45", icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Revenue", value: "₹32,400", icon: IndianRupee, color: "text-green-600", bg: "bg-green-100" },
          { label: "Active Products", value: "24", icon: Package, color: "text-orange-600", bg: "bg-orange-100" },
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
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-5">Name</th>
                  <th className="p-5">Phone</th>
                  <th className="p-5">Last Order</th>
                  <th className="p-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: "Rahul Kumar", phone: "+91 98765 43210", order: "20L Water Can x 2", status: "Paid" },
                  { name: "Priya Singh", phone: "+91 87654 32109", order: "10L Bottle", status: "Pending" },
                  { name: "Amit Patel", phone: "+91 76543 21098", order: "20L Water Can x 5", status: "Paid" },
                  { name: "Neha Sharma", phone: "+91 65432 10987", order: "1L Mineral Water", status: "Paid" },
                  { name: "Suresh Reddy", phone: "+91 54321 09876", order: "20L Water Can", status: "Pending" },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50 hover:bg-slate-50"}>
                    <td className="p-5 font-bold text-slate-800">{row.name}</td>
                    <td className="p-5 text-slate-600 font-medium">{row.phone}</td>
                    <td className="p-5 text-slate-600">{row.order}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                        row.status === "Paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800">Pending Orders</h2>
          </div>
          <div className="p-6 space-y-4 flex-1">
            {[
              { id: "#ORD-089", customer: "Priya Singh", items: "1 item", amount: "₹25" },
              { id: "#ORD-090", customer: "Vikram Reddy", items: "3 items", amount: "₹120" },
              { id: "#ORD-091", customer: "Anjali Gupta", items: "2 items", amount: "₹80" },
              { id: "#ORD-092", customer: "Suresh Reddy", items: "1 item", amount: "₹40" },
            ].map((order, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50">
                <div>
                  <p className="font-bold text-slate-800 text-lg mb-1">{order.id}</p>
                  <p className="text-sm font-medium text-slate-500">{order.customer} • {order.items}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="font-black text-slate-800 text-lg mb-2">{order.amount}</p>
                  <button 
                    className="text-xs font-bold px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
