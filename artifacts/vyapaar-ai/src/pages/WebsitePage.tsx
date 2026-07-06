import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { generateBranding, BusinessBranding } from "../services/geminiService";
import { GenericTemplate } from "../templates/website/GenericTemplate";
import { WaterPlantTemplate } from "../templates/website/WaterPlantTemplate";
import { SalesBusinessCRM } from "../templates/crm/SalesBusinessCRM";
import { ServiceBusinessCRM } from "../templates/crm/ServiceBusinessCRM";
import { Wand2, AlertCircle } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

export default function WebsitePage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  
  const [generating, setGenerating] = useState(false);
  const [branding, setBranding] = useState<BusinessBranding | null>(null);
  
  const [activeTab, setActiveTab] = useState<"website" | "crm">("website");

  useEffect(() => {
    async function fetchBusinessInfo() {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().businessInfo) {
            setBusinessInfo(docSnap.data().businessInfo);
          }
        } catch (error) {
          console.error("Error fetching business info", error);
        }
      }
      setLoading(false);
    }
    fetchBusinessInfo();
  }, [user]);

  const handleGenerate = async () => {
    if (!businessInfo) return;
    setGenerating(true);
    try {
      const result = await generateBranding(
        businessInfo.name,
        businessInfo.type,
        businessInfo.phone || "+919876543210",
        language
      );
      setBranding(result);
    } catch (error) {
      console.error("Error generating branding", error);
      alert("Failed to generate website. Please ensure your API key is set.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!businessInfo) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-10">
        <div className="bg-card border border-card-border rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Complete AI Setup First</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            We need your business details to generate your website and CRM.
          </p>
          <Link href="/ai-setup">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Go to AI Setup
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-6"></div>
        <p className="text-xl font-medium animate-pulse text-foreground">
          Generating your website with AI...
        </p>
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="p-6 max-w-3xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-8">AI Website & CRM Generator</h1>
        
        <div className="bg-card border border-card-border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b border-border pb-4">Business Profile Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business Name</p>
              <p className="font-medium text-lg">{businessInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business Type</p>
              <p className="font-medium text-lg">{businessInfo.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
              <p className="font-medium text-lg">{businessInfo.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <p className="font-medium text-lg">{businessInfo.location || "Not provided"}</p>
            </div>
          </div>
          
          <button 
            onClick={handleGenerate}
            data-testid="button-generate-website"
            className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20"
          >
            <Wand2 size={20} />
            Generate with AI
          </button>
        </div>
      </div>
    );
  }

  const isWaterPlant = businessInfo.type.toLowerCase().includes("water");
  const phone = businessInfo.phone || "+919876543210";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-full min-h-[calc(100vh-100px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Your Generated Assets</h1>
          <div className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-4 py-2 rounded-lg text-sm font-medium border border-yellow-500/30 inline-block">
            Preview Only — Deployment coming soon
          </div>
        </div>
        
        <div className="flex bg-muted p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab("website")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "website" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Website Preview
          </button>
          <button
            onClick={() => setActiveTab("crm")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "crm" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            CRM Preview
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-border rounded-xl shadow-2xl overflow-hidden relative" style={{ maxHeight: "calc(100vh - 200px)" }}>
        <div className="absolute top-0 left-0 w-full h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2 z-50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 text-center text-xs text-slate-500 font-medium font-mono px-4 truncate">
            {activeTab === "website" ? `https://${businessInfo.name.toLowerCase().replace(/\s+/g, '-')}.vyapaar.ai` : `crm.${businessInfo.name.toLowerCase().replace(/\s+/g, '-')}.vyapaar.ai`}
          </div>
        </div>
        
        <div className="w-full h-full overflow-y-auto pt-8 pb-10">
          {activeTab === "website" ? (
            isWaterPlant ? (
              <WaterPlantTemplate branding={branding} phone={phone} />
            ) : (
              <GenericTemplate branding={branding} phone={phone} />
            )
          ) : (
            isWaterPlant ? (
              <ServiceBusinessCRM branding={branding} />
            ) : (
              <SalesBusinessCRM branding={branding} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
