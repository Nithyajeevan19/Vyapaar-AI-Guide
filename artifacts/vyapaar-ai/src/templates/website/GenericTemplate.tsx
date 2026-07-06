import { BusinessBranding } from "../../services/geminiService";
import { Phone, MapPin, Mail, ChevronRight, CheckCircle2 } from "lucide-react";

interface Props {
  branding: BusinessBranding;
  phone: string;
}

export function GenericTemplate({ branding, phone }: Props) {
  const whatsappLink = `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <div className="w-full min-h-full bg-slate-50 text-slate-900 font-sans overflow-y-auto">
      {/* Hero */}
      <section 
        className="py-24 px-6 md:px-12 text-center text-white relative overflow-hidden"
        style={{ backgroundColor: branding.primaryColor }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">{branding.businessName}</h1>
          <p className="text-xl md:text-3xl mb-10 font-medium text-white/90">{branding.tagline}</p>
          <a 
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 bg-white font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-lg"
            style={{ color: branding.primaryColor }}
          >
            Call Now <ChevronRight size={20} />
          </a>
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-800">About Us</h2>
        <p className="text-xl text-slate-600 leading-relaxed font-medium">{branding.shortDescription}</p>
      </section>

      {/* Services */}
      <section className="py-20 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-800">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Consultation", "Delivery", "Support"].map((service, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                <div 
                  className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${branding.primaryColor}15`, color: branding.primaryColor }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800">{service}</h3>
                <p className="text-slate-600 text-lg">Professional {service.toLowerCase()} services tailored to your specific business needs with top-tier quality.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-800">Get In Touch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <Phone size={32} className="mb-4" style={{ color: branding.primaryColor }} />
            <h3 className="font-bold text-lg mb-2">Phone</h3>
            <p className="text-slate-600">{phone}</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <Mail size={32} className="mb-4" style={{ color: branding.primaryColor }} />
            <h3 className="font-bold text-lg mb-2">Email</h3>
            <p className="text-slate-600">contact@{branding.businessName.toLowerCase().replace(/\s+/g, "")}.com</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <MapPin size={32} className="mb-4" style={{ color: branding.primaryColor }} />
            <h3 className="font-bold text-lg mb-2">Location</h3>
            <p className="text-slate-600">Main Branch</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <a 
            href={`tel:${phone}`}
            className="w-full sm:w-auto text-xl font-bold px-10 py-4 rounded-xl border-2 hover:bg-slate-50 transition-colors"
            style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
          >
            Call Direct
          </a>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto text-xl font-bold px-10 py-4 rounded-xl bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/25 transition-all"
          >
            WhatsApp Us
          </a>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-base font-medium bg-slate-100 border-t border-slate-200">
        &copy; {new Date().getFullYear()} {branding.businessName}. All rights reserved.
      </footer>
    </div>
  );
}
