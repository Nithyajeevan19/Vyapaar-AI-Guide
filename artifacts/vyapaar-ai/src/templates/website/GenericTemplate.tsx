import { BusinessBranding } from "../../services/geminiService";

interface Props {
  branding: BusinessBranding;
  phone: string;
}

export function GenericTemplate({ branding, phone }: Props) {
  const whatsappLink = `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <div className="w-full h-full bg-white text-black font-sans overflow-y-auto">
      {/* Hero */}
      <section 
        className="py-20 px-6 text-center text-white"
        style={{ backgroundColor: branding.primaryColor }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{branding.businessName}</h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">{branding.tagline}</p>
        <a 
          href={`tel:${phone}`}
          className="inline-block bg-white text-black font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          style={{ color: branding.primaryColor }}
        >
          Call Now
        </a>
      </section>

      {/* About */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">About Us</h2>
        <p className="text-lg text-gray-700 leading-relaxed">{branding.shortDescription}</p>
      </section>

      {/* Services */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Consultation", "Delivery", "Support"].map((service, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
                <div 
                  className="w-16 h-16 mx-auto rounded-full mb-6 flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${branding.primaryColor}20`, color: branding.primaryColor }}
                >
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold mb-3">{service}</h3>
                <p className="text-gray-600">Professional {service.toLowerCase()} services tailored to your specific business needs.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <a 
            href={`tel:${phone}`}
            className="text-xl font-medium px-6 py-3 rounded-lg border-2"
            style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
          >
            {phone}
          </a>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="text-xl font-medium px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600"
          >
            WhatsApp Us
          </a>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm bg-gray-100">
        &copy; {new Date().getFullYear()} {branding.businessName}. All rights reserved.
      </footer>
    </div>
  );
}
