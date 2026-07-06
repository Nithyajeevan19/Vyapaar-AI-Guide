import { BusinessBranding } from "../../services/geminiService";
import { CalendarClock, Users, IndianRupee, Star } from "lucide-react";

interface Props {
  branding: BusinessBranding;
}

export function ServiceBusinessCRM({ branding }: Props) {
  return (
    <div className="w-full min-h-full bg-stone-50 text-stone-900 font-sans p-4 md:p-8 overflow-y-auto">
      <header className="mb-10 pb-6 border-b border-stone-200">
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-4">
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
          { label: "Today's Appts", value: "18", icon: CalendarClock, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Total Customers", value: "94", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Revenue (MTD)", value: "₹28,500", icon: IndianRupee, color: "text-green-600", bg: "bg-green-100" },
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
        {/* Appointments Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <h2 className="text-xl font-bold text-stone-800">Upcoming Appointments</h2>
            <button 
              className="text-sm font-bold px-5 py-2.5 rounded-lg text-white shadow-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: branding.primaryColor }}
            >
              + New Booking
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-500 text-sm font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-5">Customer</th>
                  <th className="p-5">Time</th>
                  <th className="p-5">Service</th>
                  <th className="p-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {[
                  { name: "Ramesh Sharma", time: "10:00 AM", service: "Consultation", status: "Confirmed" },
                  { name: "Sunita Patel", time: "11:30 AM", service: "Premium Service", status: "In Progress" },
                  { name: "Kiran Kumar", time: "02:00 PM", service: "Standard Service", status: "Pending" },
                  { name: "Pooja Singh", time: "04:15 PM", service: "Consultation", status: "Pending" },
                  { name: "Anand Verma", time: "05:30 PM", service: "Standard Service", status: "Confirmed" },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-stone-50/50 hover:bg-stone-50"}>
                    <td className="p-5 font-bold text-stone-800">{row.name}</td>
                    <td className="p-5 text-stone-600 font-bold">{row.time}</td>
                    <td className="p-5 text-stone-600 font-medium">{row.service}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider ${
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
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col">
          <div className="p-6 border-b border-stone-100 bg-stone-50/50">
            <h2 className="text-xl font-bold text-stone-800">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-6 flex-1">
            {[
              { title: "Service Completed", desc: "Suresh's Premium Service finished", time: "2 hours ago" },
              { title: "New 5★ Review", desc: "Anita left a positive review", time: "5 hours ago" },
              { title: "Payment Received", desc: "₹1,500 from Mahesh", time: "Yesterday" },
              { title: "Booking Rescheduled", desc: "Kavita moved to Tomorrow 10 AM", time: "Yesterday" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== 3 && <div className="absolute left-2.5 top-6 w-0.5 h-10 bg-stone-100"></div>}
                <div 
                  className="w-5 h-5 rounded-full border-4 border-white shadow-sm mt-0.5 z-10 shrink-0"
                  style={{ backgroundColor: branding.primaryColor }}
                />
                <div>
                  <p className="font-bold text-stone-800">{activity.title}</p>
                  <p className="text-sm font-medium text-stone-600 mb-1">{activity.desc}</p>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
