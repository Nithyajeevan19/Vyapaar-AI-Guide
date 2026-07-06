import { BusinessBranding } from "../../services/geminiService";

interface Props {
  branding: BusinessBranding;
}

export function SalesBusinessCRM({ branding }: Props) {
  return (
    <div className="w-full h-full bg-slate-50 text-slate-900 font-sans p-6 overflow-y-auto">
      <header className="mb-8 pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: branding.primaryColor }}
          >
            {branding.businessName.charAt(0)}
          </div>
          {branding.businessName} CRM
        </h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Customers", value: "128" },
          { label: "Orders This Month", value: "45" },
          { label: "Revenue", value: "₹32,400" },
          { label: "Active Products", value: "24" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Recent Customers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Last Order</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: "Rahul Kumar", phone: "+91 98765 43210", order: "20L Water Can x 2", status: "Paid" },
                  { name: "Priya Singh", phone: "+91 87654 32109", order: "10L Bottle", status: "Pending" },
                  { name: "Amit Patel", phone: "+91 76543 21098", order: "20L Water Can x 5", status: "Paid" },
                  { name: "Neha Sharma", phone: "+91 65432 10987", order: "1L Mineral Water (Case)", status: "Paid" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{row.name}</td>
                    <td className="p-4 text-slate-600">{row.phone}</td>
                    <td className="p-4 text-slate-600">{row.order}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        row.status === "Paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Pending Orders</h2>
          </div>
          <div className="p-6 space-y-6">
            {[
              { id: "#ORD-089", customer: "Priya Singh", items: "1 item", amount: "₹25" },
              { id: "#ORD-090", customer: "Vikram Reddy", items: "3 items", amount: "₹120" },
              { id: "#ORD-091", customer: "Anjali Gupta", items: "2 items", amount: "₹80" },
            ].map((order, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{order.id}</p>
                  <p className="text-sm text-slate-500">{order.customer} • {order.items}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{order.amount}</p>
                  <button 
                    className="text-xs font-medium px-3 py-1 rounded mt-1 text-white"
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
