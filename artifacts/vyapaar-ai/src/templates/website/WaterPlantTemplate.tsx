import { BusinessBranding } from "../../services/geminiService";
import { Droplet, Phone, MessageCircle } from "lucide-react";

interface Props {
  branding: BusinessBranding;
  phone: string;
}

export function WaterPlantTemplate({ branding, phone }: Props) {
  const whatsappLink = `https://wa.me/${phone.replace(/\D/g, "")}`;
  const themeBlue = branding.primaryColor.includes("water") || !branding.primaryColor ? "#0284c7" : branding.primaryColor;

  return (
    <div className="w-full min-h-full bg-slate-50 text-slate-900 font-sans overflow-y-auto">
      {/* Hero */}
      <section 
        className="relative py-28 px-6 text-center text-white overflow-hidden bg-gradient-to-br"
        style={{ backgroundImage: `linear-gradient(to bottom right, ${themeBlue}, #0369a1)` }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-8 border border-white/30 shadow-xl">
            <Droplet size={40} className="text-white fill-white/50" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-md">{branding.businessName}</h1>
          <p className="text-2xl md:text-3xl mb-12 font-medium text-blue-50 max-w-2xl mx-auto drop-shadow-sm">{branding.tagline}</p>
          <a 
            href={`tel:${phone}`}
            className="inline-flex items-center gap-3 bg-white font-bold py-5 px-12 rounded-full shadow-2xl hover:shadow-white/20 transition-all transform hover:-translate-y-1 text-xl"
            style={{ color: themeBlue }}
          >
            <Phone size={24} /> Order Water Now
          </a>
        </div>
        
        {/* Decorative waves */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none transform translate-y-1">
          <svg className="relative block w-[calc(100%+1.3px)] h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,123.15,190.41,111.45,236.4,102.5,279.7,78.2,321.39,56.44Z" fill="#f8fafc"></path>
          </svg>
        </div>
      </section>

      {/* Products */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-black mb-16 text-center text-slate-800">Our Premium Water</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "20L Water Can", price: "₹40", desc: "Purified RO water for homes & offices", icon: "💧" },
            { name: "10L Bottle", price: "₹25", desc: "Perfect for small families and events", icon: "🧊" },
            { name: "1L Mineral Water", price: "₹15", desc: "Added minerals for essential hydration", icon: "🌊" }
          ].map((product, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 text-center hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: themeBlue }}></div>
              <div 
                className="w-24 h-24 mx-auto rounded-full mb-8 flex items-center justify-center text-4xl font-bold bg-blue-50 group-hover:scale-110 transition-transform"
                style={{ color: themeBlue }}
              >
                {product.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">{product.name}</h3>
              <p className="text-slate-500 mb-8 text-lg">{product.desc}</p>
              <div className="text-4xl font-black mb-6" style={{ color: themeBlue }}>{product.price}</div>
              <button className="w-full py-3 rounded-xl font-bold text-white transition-colors" style={{ backgroundColor: themeBlue }}>
                Order
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery Callout */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="bg-blue-50 rounded-3xl p-10 md:p-14 text-center border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🚚</div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800">Fast & Free Delivery</h2>
            <p className="text-xl md:text-2xl text-slate-600 font-medium mb-4">We deliver daily 6 AM - 10 AM.</p>
            <p className="text-lg text-slate-500 bg-white/60 inline-block px-6 py-2 rounded-full font-bold">Same-day delivery for orders before 8 AM</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8 text-slate-800">About {branding.businessName}</h2>
        <p className="text-xl text-slate-600 leading-relaxed font-medium">{branding.shortDescription}</p>
      </section>

      {/* Contact */}
      <section className="py-24 px-6 bg-white text-center border-t border-slate-100">
        <h2 className="text-4xl font-black mb-12 text-slate-800">Need Water Immediately?</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <a 
            href={`tel:${phone}`}
            className="w-full sm:w-auto flex items-center justify-center gap-3 text-xl font-bold px-10 py-5 rounded-2xl border-2 hover:bg-slate-50 transition-colors"
            style={{ borderColor: themeBlue, color: themeBlue }}
          >
            <Phone size={24} /> Call {phone}
          </a>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-3 text-xl font-bold px-10 py-5 rounded-2xl bg-[#25D366] text-white hover:bg-[#128C7E] shadow-xl shadow-green-500/20 transition-colors border-2 border-[#25D366]"
          >
            <MessageCircle size={24} /> WhatsApp Us
          </a>
        </div>
      </section>
      
      <footer className="py-8 text-center text-slate-500 text-base font-medium bg-slate-100">
        &copy; {new Date().getFullYear()} {branding.businessName}. All rights reserved.
      </footer>
    </div>
  );
}
