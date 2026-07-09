import React, { useState, useEffect } from "react";
import { 
  useGetBusinessProfile, 
  useUpdateBusinessProfile,
  useListOrganizations,
  useListBranches
} from "@workspace/api-client-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase/config";
import { 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  Clock, 
  Globe, 
  UploadCloud, 
  Save, 
  Loader2, 
  ChevronRight, 
  Layers,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { SkeletonCard } from "../components/SkeletonCard";

export default function ProfilePage() {
  const { 
    user, 
    currentOrgId, 
    setCurrentOrgId, 
    currentBranchId, 
    setCurrentBranchId 
  } = useAuth();
  const { toast } = useToast();

  // Form State
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [tagline, setTagline] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [businessHours, setBusinessHours] = useState<Record<string, string>>({
    Monday: "9:00 AM - 9:00 PM",
    Tuesday: "9:00 AM - 9:00 PM",
    Wednesday: "9:00 AM - 9:00 PM",
    Thursday: "9:00 AM - 9:00 PM",
    Friday: "9:00 AM - 9:00 PM",
    Saturday: "9:00 AM - 9:00 PM",
    Sunday: "Closed"
  });

  const [saving, setSaving] = useState(false);

  // Queries
  const { data: orgs = [], isLoading: loadingOrgs } = useListOrganizations();
  const { data: branches = [], isLoading: loadingBranches } = useListBranches({ orgId: currentOrgId });
  const { data: profile, isLoading: loadingProfile, refetch: refetchProfile } = useGetBusinessProfile({ orgId: currentOrgId });
  const updateProfileMutation = useUpdateBusinessProfile();

  // Load backend profile data
  useEffect(() => {
    if (profile) {
      setLogoUrl(profile.logoUrl || null);
      setTagline(profile.tagline || "");
      setPrimaryColor(profile.primaryColor || "#4f46e5");
      setShortDescription(profile.shortDescription || "");
      setCategory(profile.category || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      if (profile.businessHours && typeof profile.businessHours === "object") {
        setBusinessHours(profile.businessHours as Record<string, string>);
      }
    }
  }, [profile]);

  // Sync user display name if changed from Firebase auth load
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  // Handle Logo file upload base64 mapping
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        toast({ title: "Logo Uploaded", description: "Converted image layout to local asset preview. Remember to click save to commit changes." });
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update Firebase User Name if present
      if (auth.currentUser && displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }

      // 2. Save Business Profile
      await updateProfileMutation.mutateAsync({
        data: {
          orgId: currentOrgId,
          logoUrl: logoUrl ?? undefined,
          tagline: tagline || undefined,
          primaryColor: primaryColor || undefined,
          shortDescription: shortDescription || undefined,
          category: category || undefined,
          phone: phone || undefined,
          address: address || undefined,
          businessHours: businessHours || undefined
        }
      });

      toast({ title: "Profile Saved", description: "Successfully updated account profile details and business settings." });
      refetchProfile();
    } catch (err: any) {
      toast({ 
        title: "Save Failed", 
        description: err.message || "Failed to update profile configurations", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextOrgId = parseInt(e.target.value, 10);
    setCurrentOrgId(nextOrgId);
    toast({ title: "Organization Context Switched", description: `Viewing data for org id: ${nextOrgId}` });
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextBranchId = parseInt(e.target.value, 10);
    setCurrentBranchId(nextBranchId);
    toast({ title: "Branch Context Switched", description: `Viewing data for branch id: ${nextBranchId}` });
  };

  if (loadingProfile || loadingOrgs || loadingBranches) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <SkeletonCard className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard className="h-40 col-span-1" />
          <SkeletonCard className="h-40 col-span-2" />
        </div>
        <SkeletonCard className="h-96 w-full" />
      </div>
    );
  }

  const activeOrgName = orgs.find((o: any) => o.id === currentOrgId)?.name || "Selected Organization";
  const activeBranchName = branches.find((b: any) => b.id === currentBranchId)?.name || "Selected Branch";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in font-sans">
      
      {/* Title & Switches */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl font-black font-display tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="text-primary" /> Profile & Settings
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Manage organization configurations, switch branches, and update branding assets.
          </p>
        </div>

        {/* Multi-tenant Context switch bar */}
        <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-2xl border border-border">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase block font-sans">Active Org</span>
            <select 
              value={currentOrgId} 
              onChange={handleOrgChange}
              className="bg-card text-xs font-bold text-foreground border border-border px-3 py-1.5 rounded-xl outline-none focus:border-primary cursor-pointer font-sans"
            >
              {orgs.map((o: any) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase block font-sans">Active Branch</span>
            <select 
              value={currentBranchId} 
              onChange={handleBranchChange}
              className="bg-card text-xs font-bold text-foreground border border-border px-3 py-1.5 rounded-xl outline-none focus:border-primary cursor-pointer font-sans"
            >
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: User Details & Logo drag-drop */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Logo Card */}
          <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card space-y-4">
            <h3 className="text-base font-bold font-display text-foreground">Business Logo</h3>
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-2xl text-center space-y-3 relative group">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Business Logo Preview" 
                  className="w-24 h-24 rounded-full object-cover border border-border shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black font-display text-2xl">
                  {activeOrgName[0]?.toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block font-sans">Drag logo image or click to browse</span>
                <label className="inline-block py-1.5 px-3 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl border border-secondary-border hover:shadow-raised transition-all cursor-pointer">
                  <UploadCloud size={14} className="inline mr-1" /> Choose File
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoFileChange} 
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* User metadata */}
          <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card space-y-4">
            <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <User size={18} className="text-muted-foreground" /> Owner Account
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground font-sans">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-muted/20 border border-border px-3 py-2 rounded-xl text-foreground focus:border-primary outline-none font-sans"
                  placeholder="Demo Owner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground font-sans">Email Address (Read-only)</label>
                <input 
                  type="email" 
                  value={user?.email || "demo@vyapaar.ai"}
                  readOnly
                  disabled
                  className="w-full bg-muted/40 border border-border px-3 py-2 rounded-xl text-muted-foreground outline-none font-sans cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Branding & Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-card space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="text-lg font-bold font-display text-foreground">Business Profiles & Branding</h3>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                Save Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground font-sans">Tagline / Brand Motto</label>
                <input 
                  type="text" 
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-muted/20 border border-border px-3 py-2 rounded-xl text-foreground focus:border-primary outline-none font-sans"
                  placeholder="Your daily grocery partner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground font-sans">Brand Primary Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 border border-border rounded-xl cursor-pointer bg-transparent"
                  />
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-muted/20 border border-border px-3 py-2 rounded-xl text-foreground focus:border-primary outline-none font-sans font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground font-sans">Industry Category</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-muted/20 border border-border px-3 py-2 rounded-xl text-foreground focus:border-primary outline-none font-sans"
                  placeholder="Retail & Grocery"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground font-sans">Contact Hotline</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-muted/20 border border-border px-3 py-2 rounded-xl text-foreground focus:border-primary outline-none font-sans"
                  placeholder="+919876543210"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-muted-foreground font-sans">Physical Address</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-muted/20 border border-border px-3 py-2 rounded-xl text-foreground focus:border-primary outline-none font-sans"
                  placeholder="12-34 Main St, Hyderabad"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-muted-foreground font-sans">Short Brand Description</label>
                <textarea 
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-muted/20 border border-border px-3 py-2 rounded-xl text-foreground focus:border-primary outline-none font-sans resize-none"
                  placeholder="Tell customers about your store..."
                />
              </div>
            </div>

            {/* Business Hours Week slots */}
            <div className="pt-4 border-t border-border space-y-4">
              <h4 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" /> Business Operating Hours
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {Object.keys(businessHours).map((day) => (
                  <div key={day} className="bg-muted/10 border border-border p-3 rounded-2xl space-y-1">
                    <span className="font-bold text-foreground font-sans">{day}</span>
                    <input 
                      type="text"
                      value={businessHours[day]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBusinessHours(prev => ({ ...prev, [day]: val }));
                      }}
                      className="w-full bg-card border border-border px-2 py-1 rounded-lg text-foreground focus:border-primary outline-none font-sans"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
