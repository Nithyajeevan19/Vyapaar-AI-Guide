import { BusinessBranding } from "../../services/geminiService";

interface Props {
  branding: BusinessBranding;
  phone: string;
}

export function WaterPlantTemplate({ branding, phone }: Props) {
  const whatsappLink = `https://wa.me/${phone.replace(/\D/g, "")}`;
  const themeBlue = branding.primaryColor.includes("water") ? branding.primaryColor : "#0ea5e9";

  return (
    <div className="w-full h-full bg-slate-50 text-slate-900 font-sans overflow-y-auto">
      {/* Hero */}
      <section 
        className="relative py-24 px-6 text-center text-white overflow-hidden"
        style={{ backgroundColor: themeBlue }}
      >
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">{branding.businessName}</h1>
          <p className="text-xl md:text-2xl mb-10 font-medium text-blue-50">{branding.tagline}</p>
          <a 
            href={`tel:${phone}`}
            className="inline-block bg-white font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
            style={{ color: themeBlue }}
          >
            Order Now
          </a>
        </div>
        
        {/* Decorative waves */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none transform translate-y-1">
          <svg className="relative block w-[calc(100%+1.3px)] h-[50px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,123.15,190.41,111.45,236.4,102.5,279.7,78.2,321.39,56.44Z" fill="#f8fafc"></path>
          </svg>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black mb-12 text-center text-slate-800">Our Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "20L Water Can", price: "₹40", desc: "Purified RO water for homes & offices" },
            { name: "10L Bottle", price: "₹25", desc: "Perfect for small families and events" },
            { name: "1L Mineral Water", price: "₹15", desc: "Added minerals for essential hydration" }
          ].map((product, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
              <div 
                className="w-24 h-24 mx-auto rounded-full mb-6 flex items-center justify-center text-3xl font-bold bg-blue-50"
                style={{ color: themeBlue }}
              >
                💧
              </div>
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-slate-500 mb-6">{product.desc}</p>
              <div className="text-2xl font-black" style={{ color: themeBlue }}>{product.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery */}
      <section className="py-16 px-6 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-6">🚚</div>
          <h2 className="text-3xl font-bold mb-6 text-slate-800">Fast & Free Delivery</h2>
          <p className="text-xl text-slate-600 font-medium">We deliver daily 6 AM - 10 AM.</p>
          <p className="text-slate-500 mt-2">Same-day orders before 8 AM.</p>
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8 text-slate-800">About {branding.businessName}</h2>
        <p className="text-lg text-slate-600 leading-relaxed">{branding.shortDescription}</p>
      </section>

      {/* Contact */}
      <section className="py-20 px-6 bg-white text-center border-t border-slate-100">
        <h2 className="text-3xl font-bold mb-10 text-slate-800">Need Water?</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <a 
            href={`tel:${phone}`}
            className="text-xl font-bold px-8 py-4 rounded-xl border-2 hover:bg-slate-50 transition-colors"
            style={{ borderColor: themeBlue, color: themeBlue }}
          >
            Call {phone}
          </a>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="text-xl font-bold px-8 py-4 rounded-xl bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30 transition-colors"
          >
            WhatsApp Us
          </a>
        </div>
      </section>
    </div>
  );
}
