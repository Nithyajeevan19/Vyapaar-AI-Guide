import { BusinessBranding } from "../../services/geminiService";

interface Props {
  branding: BusinessBranding;
}

export function ServiceBusinessCRM({ branding }: Props) {
  return (
    <div className="w-full h-full bg-stone-50 text-stone-900 font-sans p-6 overflow-y-auto">
      <header className="mb-8 pb-6 border-b border-stone-200">
        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
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
          { label: "Today's Appointments", value: "18" },
          { label: "Total Customers", value: "94" },
          { label: "Revenue (MTD)", value: "₹28,500" },
          { label: "Average Rating", value: "4.8/5" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <p className="text-sm font-medium text-stone-500 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-stone-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-stone-800">Upcoming Appointments</h2>
            <button 
              className="text-sm font-medium px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: branding.primaryColor }}
            >
              + New Booking
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-500 text-sm">
                <tr>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Time</th>
                  <th className="p-4 font-medium">Service</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {[
                  { name: "Ramesh Sharma", time: "10:00 AM", service: "Consultation", status: "Confirmed" },
                  { name: "Sunita Patel", time: "11:30 AM", service: "Premium Service", status: "In Progress" },
                  { name: "Kiran Kumar", time: "02:00 PM", service: "Standard Service", status: "Pending" },
                  { name: "Pooja Singh", time: "04:15 PM", service: "Consultation", status: "Pending" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-stone-50">
                    <td className="p-4 font-medium text-stone-800">{row.name}</td>
                    <td className="p-4 text-stone-600 font-medium">{row.time}</td>
                    <td className="p-4 text-stone-600">{row.service}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        row.status === "Confirmed" ? "bg-blue-100 text-blue-700" : 
                        row.status === "In Progress" ? "bg-purple-100 text-purple-700" :
                        "bg-amber-100 text-amber-700"
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

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100">
          <div className="p-6 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-800">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-6">
            {[
              { title: "Service Completed", desc: "Suresh's Premium Service finished", time: "2 hours ago" },
              { title: "New 5★ Review", desc: "Anita left a positive review", time: "5 hours ago" },
              { title: "Payment Received", desc: "₹1,500 from Mahesh", time: "Yesterday" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div 
                  className="w-2 h-2 mt-2 rounded-full"
                  style={{ backgroundColor: branding.primaryColor }}
                />
                <div>
                  <p className="font-bold text-stone-800 text-sm">{activity.title}</p>
                  <p className="text-sm text-stone-500 mb-1">{activity.desc}</p>
                  <p className="text-xs text-stone-400 font-medium">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
