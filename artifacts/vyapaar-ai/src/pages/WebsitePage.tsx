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
import { Wand2, AlertCircle, RefreshCw, Building2, Phone, Briefcase, MapPin } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { motion } from "framer-motion";
import { SkeletonCard } from "../components/SkeletonCard";

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
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  if (!businessInfo) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto mt-10">
        <div className="bg-card border border-card-border rounded-2xl p-8 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 text-red-500 mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Complete AI Setup First</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            We need your business details to generate your website and CRM.
          </p>
          <Link href="/ai-setup">
            <button className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-md">
              Go to AI Setup
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] p-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary relative z-10"></div>
          <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Crafting your digital business...</h2>
        <p className="text-lg text-muted-foreground animate-pulse">
          Designing website, setting up CRM structure, and writing content.
        </p>
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto mt-4 md:mt-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AI Website & CRM Generator</h1>
          <p className="text-lg text-muted-foreground">Review your details and let AI do the magic.</p>
        </div>
        
        <div className="bg-card border border-card-border rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-4 flex items-center gap-2">
            <Briefcase className="text-primary" /> Business Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="bg-blue-500/10 p-3 rounded-lg text-blue-500 h-fit">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-medium">Business Name</p>
                <p className="font-bold text-lg">{businessInfo.name}</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="bg-purple-500/10 p-3 rounded-lg text-purple-500 h-fit">
                <Briefcase size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-medium">Business Type</p>
                <p className="font-bold text-lg">{businessInfo.type}</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="bg-green-500/10 p-3 rounded-lg text-green-500 h-fit">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-medium">Phone Number</p>
                <p className="font-bold text-lg">{businessInfo.phone || "Not provided"}</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="bg-orange-500/10 p-3 rounded-lg text-orange-500 h-fit">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-medium">Location</p>
                <p className="font-bold text-lg">{businessInfo.location || "Not provided"}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleGenerate}
            data-testid="button-generate-website"
            className="w-full relative group overflow-hidden px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-primary/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary background-animate opacity-90 group-hover:opacity-100 transition-opacity"></div>
            {/* Shimmer effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shimmer"></div>
            
            <span className="relative z-10 flex items-center gap-2 text-primary-foreground text-lg">
              <Wand2 size={24} />
              Generate with AI
            </span>
          </button>
        </div>
      </div>
    );
  }

  const isWaterPlant = businessInfo.type.toLowerCase().includes("water");
  const phone = businessInfo.phone || "+919876543210";
  const url = activeTab === "website" 
    ? `https://${businessInfo.name.toLowerCase().replace(/\s+/g, '-')}.vyapaar.ai` 
    : `crm.${businessInfo.name.toLowerCase().replace(/\s+/g, '-')}.vyapaar.ai`;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-full min-h-[calc(100vh-100px)]"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Generated Assets</h1>
          <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-md text-sm font-bold border border-yellow-500/20 inline-block">
            Preview Mode
          </div>
        </div>
        
        <div className="flex bg-muted p-1 rounded-xl border border-border relative">
          <button
            onClick={() => setActiveTab("website")}
            className={`relative px-8 py-2.5 rounded-lg font-bold text-sm transition-colors z-10 ${
              activeTab === "website" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Website
            {activeTab === "website" && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border -z-10" 
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("crm")}
            className={`relative px-8 py-2.5 rounded-lg font-bold text-sm transition-colors z-10 ${
              activeTab === "crm" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            CRM
            {activeTab === "crm" && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border -z-10" 
              />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-border rounded-2xl shadow-2xl overflow-hidden relative flex flex-col" style={{ maxHeight: "calc(100vh - 180px)" }}>
        {/* Realistic Browser Chrome */}
        <div className="bg-[#f1f5f9] dark:bg-[#1e293b] border-b border-border flex items-center px-4 py-3 gap-4 shrink-0">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
          </div>
          <div className="flex gap-2 text-muted-foreground ml-2">
            <RefreshCw size={16} className="hover:text-foreground cursor-pointer transition-colors" />
          </div>
          <div className="flex-1 max-w-2xl mx-auto bg-white dark:bg-black border border-border rounded-lg px-4 py-1.5 text-center text-sm font-medium flex items-center justify-center truncate text-foreground shadow-sm">
            <Lock size={12} className="mr-2 text-green-600 inline" />
            {url}
          </div>
          <div className="w-16"></div> {/* Spacer for balance */}
        </div>
        
        <div className="w-full h-full overflow-y-auto relative bg-background">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full min-h-full"
          >
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
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
