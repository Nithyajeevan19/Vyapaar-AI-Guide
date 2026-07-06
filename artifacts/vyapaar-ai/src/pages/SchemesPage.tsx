import { Landmark, Factory, FileCheck, Monitor, CheckCircle, ExternalLink } from "lucide-react";

const SCHEMES = [
  { 
    title: "Mudra Loan", 
    Icon: Landmark, 
    eligibility: "Indian citizens with a non-farm small business or startup", 
    benefits: ["Loans up to ₹10 Lakhs", "No collateral required", "Low interest rates", "Available at all banks"], 
    url: "https://www.mudra.org.in/" 
  },
  { 
    title: "PMEGP", 
    Icon: Factory, 
    eligibility: "Indian citizens above 18 years with 8th pass qualification", 
    benefits: ["25-35% government subsidy", "Projects up to ₹50 Lakhs", "Manufacturing & service sectors", "Training support"], 
    url: "https://www.kviconline.gov.in/pmegpeportal/" 
  },
  { 
    title: "Udyam Registration", 
    Icon: FileCheck, 
    eligibility: "Micro, Small & Medium Enterprises in India", 
    benefits: ["Free registration", "Access to government tenders", "Priority sector lending", "Protection against delayed payments"], 
    url: "https://udyamregistration.gov.in/" 
  },
  { 
    title: "Digital MSME", 
    Icon: Monitor, 
    eligibility: "MSME registered units wanting to go digital", 
    benefits: ["Free website creation", "Digital training", "E-commerce support", "Cloud adoption assistance"], 
    url: "https://msme.gov.in/" 
  },
];

export default function SchemesPage() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-10 border-b border-border pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Govt. Schemes & Support</h1>
        <p className="text-muted-foreground text-lg">
          Explore financial and digital assistance programs designed for Indian SMEs.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {SCHEMES.map((scheme, idx) => (
          <div key={idx} className="bg-card border border-card-border rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <scheme.Icon size={28} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{scheme.title}</h2>
            </div>
            
            <div className="mb-6 bg-muted/50 p-4 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Eligibility</span>
              <p className="text-foreground font-medium">{scheme.eligibility}</p>
            </div>
            
            <div className="flex-1 mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Key Benefits</span>
              <ul className="space-y-3">
                {scheme.benefits.map((benefit, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <a 
              href={scheme.url} 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-4 px-6 bg-accent/10 hover:bg-accent/20 text-accent font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-auto border border-accent/20"
            >
              Apply Now
              <ExternalLink size={18} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
