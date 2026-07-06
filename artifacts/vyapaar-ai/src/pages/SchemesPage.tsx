import { Landmark, Factory, FileCheck, Monitor, CheckCircle2, ExternalLink } from "lucide-react";

const SCHEMES = [
  { 
    title: "Mudra Loan", 
    Icon: Landmark, 
    color: "bg-green-500",
    colorText: "text-green-600",
    colorBg: "bg-green-500/10",
    eligibility: "Indian citizens with a non-farm small business or startup", 
    benefits: ["Loans up to ₹10 Lakhs", "No collateral required", "Low interest rates", "Available at all banks"], 
    url: "https://www.mudra.org.in/" 
  },
  { 
    title: "PMEGP", 
    Icon: Factory,
    color: "bg-blue-500",
    colorText: "text-blue-600",
    colorBg: "bg-blue-500/10",
    eligibility: "Indian citizens above 18 years with 8th pass qualification", 
    benefits: ["25-35% government subsidy", "Projects up to ₹50 Lakhs", "Manufacturing & service sectors", "Training support"], 
    url: "https://www.kviconline.gov.in/pmegpeportal/" 
  },
  { 
    title: "Udyam Registration", 
    Icon: FileCheck,
    color: "bg-orange-500",
    colorText: "text-orange-600",
    colorBg: "bg-orange-500/10",
    eligibility: "Micro, Small & Medium Enterprises in India", 
    benefits: ["Free registration", "Access to government tenders", "Priority sector lending", "Protection against delayed payments"], 
    url: "https://udyamregistration.gov.in/" 
  },
  { 
    title: "Digital MSME", 
    Icon: Monitor,
    color: "bg-purple-500",
    colorText: "text-purple-600",
    colorBg: "bg-purple-500/10",
    eligibility: "MSME registered units wanting to go digital", 
    benefits: ["Free website creation", "Digital training", "E-commerce support", "Cloud adoption assistance"], 
    url: "https://msme.gov.in/" 
  },
];

export default function SchemesPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      <header className="bg-card border border-card-border p-8 rounded-3xl shadow-sm text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3 tracking-tight">Govt. Schemes & Support</h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl">
            Explore financial and digital assistance programs designed to accelerate growth for Indian SMEs.
          </p>
        </div>
        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center shrink-0 shadow-inner">
          <Landmark size={40} className="text-primary" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {SCHEMES.map((scheme, idx) => (
          <div key={idx} className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group relative">
            <div className={`absolute top-0 left-0 w-full h-2 ${scheme.color}`} />
            
            <div className="p-8 flex flex-col flex-1">
              <div className="flex items-center gap-5 mb-8">
                <div className={`w-16 h-16 rounded-2xl ${scheme.colorBg} ${scheme.colorText} flex items-center justify-center shrink-0 transform group-hover:scale-110 transition-transform`}>
                  <scheme.Icon size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{scheme.title}</h2>
                  <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground uppercase tracking-wider border border-border">Govt. of India</span>
                </div>
              </div>
              
              <div className="mb-8 bg-muted/30 border border-border p-5 rounded-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Eligibility
                </span>
                <p className="text-foreground font-medium text-lg leading-relaxed">{scheme.eligibility}</p>
              </div>
              
              <div className="flex-1 mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Key Benefits
                </span>
                <ul className="space-y-4">
                  {scheme.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-3">
                      <CheckCircle2 size={22} className={`${scheme.colorText} shrink-0`} />
                      <span className="text-foreground font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <a 
                href={scheme.url} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-primary/25 mt-auto"
              >
                Apply Now on Portal
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
