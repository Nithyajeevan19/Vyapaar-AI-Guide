import { useState } from "react";
import { BookOpen, PlayCircle, Search } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  { name: "CRM", videos: [
    { title: "What Is CRM? | Introduction To CRM Software", url: "https://www.youtube.com/embed/sQD7kaZ5h0s?si=akqCj53MvRMWzHW4" },
    { title: "CRM Tutorial for Beginners | Step-by-Step Guide", url: "https://www.youtube.com/embed/jibQ60PlZhs?si=UkdI_lgfTSQ60ENP" },
  ]},
  { name: "Marketing", videos: [
    { title: "Digital Marketing for Small Businesses | Get More Leads", url: "https://www.youtube.com/embed/Q4NujwJ_mhY?si=p6Rtz2Zqp9pmbe7W" },
  ]},
  { name: "WhatsApp Automation", videos: [
    { title: "How to Use WhatsApp Business Account (Full Course)", url: "https://www.youtube.com/embed/YI2qPPP-3OY?si=eQnu037kdrMUn0yO" },
  ]},
  { name: "Payments Methods", videos: [
    { title: "Types of Digital Payments | Digital Payments System", url: "https://www.youtube.com/embed/2ugB_KI7ZR8?si=jIbpaCmXgLJs448F" },
    { title: "Types of Digital Payments | How Digital Payments Work", url: "https://www.youtube.com/embed/W3CGCAEWobk?si=obhRnUrDzI0rFd7Z" },
  ]},
];


export default function LearningPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleCategories = activeCategory === "All" 
    ? CATEGORIES 
    : CATEGORIES.filter(c => c.name === activeCategory);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-card-border p-6 md:p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary flex items-center justify-center shadow-inner">
            <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-1">Learning Hub</h1>
            <p className="text-muted-foreground text-lg font-medium">Master digital tools to grow your business.</p>
          </div>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Search tutorials..." 
            className="w-full md:w-64 pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-10 gap-3 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("All")}
          className={`relative px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-colors z-10 ${
            activeCategory === "All" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-card border border-border shadow-sm"
          }`}
        >
          {activeCategory === "All" && (
            <motion.div layoutId="learningTab" className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md" />
          )}
          All Topics
        </button>
        {CATEGORIES.map(category => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={`relative px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-colors z-10 ${
              activeCategory === category.name ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-card border border-border shadow-sm"
            }`}
          >
            {activeCategory === category.name && (
              <motion.div layoutId="learningTab" className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md" />
            )}
            {category.name}
          </button>
        ))}
      </div>

      {/* Video Grids */}
      <div className="space-y-16">
        {visibleCategories.map(category => (
          <div key={category.name}>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
              <div className="h-px flex-1 bg-border"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.videos.map((video, idx) => (
                <div key={idx} className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                  <div className="aspect-video relative bg-slate-900 overflow-hidden">
                    <iframe
                      src={video.url}
                      title={video.title}
                      className="absolute inset-0 w-full h-full z-10 relative"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                      <PlayCircle className="text-white/30" size={48} />
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-4 leading-tight">
                      {video.title}
                    </h3>
                    <div className="mt-auto flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span className="px-2 py-1 bg-muted rounded-md border border-border">Tutorial</span>
                      <span className="px-2 py-1 bg-muted rounded-md border border-border">5 mins</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
