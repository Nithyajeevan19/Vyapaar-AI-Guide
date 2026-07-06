import { useState } from "react";
import { BookOpen } from "lucide-react";

const CATEGORIES = [
  { name: "Marketing", videos: [
    { title: "Digital Marketing Basics", url: "https://www.youtube.com/embed/bixR-KIJKYM" },
    { title: "Social Media Strategy", url: "https://www.youtube.com/embed/2C6wkpBt0bE" },
  ]},
  { name: "CRM", videos: [
    { title: "What is CRM?", url: "https://www.youtube.com/embed/Htyl4d_HF7A" },
    { title: "CRM for Small Business", url: "https://www.youtube.com/embed/tJhzMIzJrSI" },
  ]},
  { name: "Google Business", videos: [
    { title: "Google My Business Setup", url: "https://www.youtube.com/embed/Cp8b9RBezDs" },
    { title: "Get More Google Reviews", url: "https://www.youtube.com/embed/pEiCNNpBF0I" },
  ]},
  { name: "WhatsApp Business", videos: [
    { title: "WhatsApp Business Setup", url: "https://www.youtube.com/embed/3jw-fGaYPWE" },
    { title: "WhatsApp Business Features", url: "https://www.youtube.com/embed/V5DtOE-noZA" },
  ]},
  { name: "Digital Payments", videos: [
    { title: "UPI for Business", url: "https://www.youtube.com/embed/7zrMlKOdqPQ" },
    { title: "PhonePe for Merchants", url: "https://www.youtube.com/embed/nLijPQh2h1g" },
  ]},
];

export default function LearningPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleCategories = activeCategory === "All" 
    ? CATEGORIES 
    : CATEGORIES.filter(c => c.name === activeCategory);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-10 flex items-center gap-4 border-b border-border pb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Learning Hub</h1>
          <p className="text-muted-foreground text-lg mt-1">Master digital tools for your business</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
            activeCategory === "All" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All Topics
        </button>
        {CATEGORIES.map(category => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
              activeCategory === category.name 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Video Grids */}
      <div className="space-y-12">
        {visibleCategories.map(category => (
          <div key={category.name}>
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
              {category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.videos.map((video, idx) => (
                <div key={idx} className="bg-card border border-card-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="aspect-video relative bg-muted">
                    <iframe
                      src={video.url}
                      title={video.title}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {video.title}
                    </h3>
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
