import { TrendingUp, Clock, Package, Lightbulb, Bot, CheckCircle, Users } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Bot className="text-primary" size={36} />
          Business Insights
        </h1>
        <p className="text-muted-foreground text-lg">AI-powered analytics and recommendations.</p>
      </header>

      {/* Section 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Today's Revenue", value: "₹4,280", trend: "+12%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Monthly Sales", value: "₹1,28,500", trend: "+18%", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Orders", value: "342", trend: "+5%", icon: Package, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Customers", value: "89", trend: "+8%", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-card-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="px-2.5 py-1 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold">{stat.trend}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Section 2: Charts */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-card border border-card-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-8 text-foreground">Monthly Sales Overview</h3>
            <div className="h-80 flex items-end justify-between gap-2 md:gap-4 relative pb-6 border-b border-border">
              {/* Baseline */}
              <div className="absolute bottom-6 left-0 right-0 h-px bg-border"></div>
              
              {[
                { label: "Jan", val: 85000, height: "65%" },
                { label: "Feb", val: 92000, height: "70%" },
                { label: "Mar", val: 78000, height: "60%" },
                { label: "Apr", val: 110000, height: "85%" },
                { label: "May", val: 128500, height: "100%" },
                { label: "Jun", val: 115000, height: "90%" },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group cursor-default h-full justify-end relative z-10">
                  <div className="w-full max-w-[4rem] relative flex flex-col items-center justify-end h-full">
                    {/* Value Label */}
                    <div className="text-xs font-bold text-muted-foreground mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-background px-2 py-1 rounded shadow-sm border border-border">
                      ₹{(bar.val/1000).toFixed(1)}k
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full bg-gradient-to-t from-primary/80 to-accent/80 group-hover:from-primary group-hover:to-accent rounded-t-xl transition-all duration-300 ease-out"
                      style={{ height: bar.height }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground mt-4 font-bold">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-foreground">Weekly Orders</h3>
              <div className="h-48 relative mt-4">
                <svg viewBox="0 0 700 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="line-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 0,200 L 0,150 L 100,160 L 200,120 L 300,105 L 400,65 L 500,30 L 600,140 L 700,140 L 700,200 Z" 
                    fill="url(#line-gradient)" 
                  />
                  <polyline 
                    points="0,150 100,160 200,120 300,105 400,65 500,30 600,140 700,140" 
                    fill="none" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  {/* Data points */}
                  <circle cx="0" cy="150" r="6" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
                  <circle cx="100" cy="160" r="6" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
                  <circle cx="200" cy="120" r="6" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
                  <circle cx="300" cy="105" r="6" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
                  <circle cx="400" cy="65" r="6" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
                  <circle cx="500" cy="30" r="6" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
                  <circle cx="600" cy="140" r="6" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
                  <circle cx="700" cy="140" r="6" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
                </svg>
                <div className="flex justify-between text-xs font-bold text-muted-foreground mt-4">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold mb-6 text-foreground">Revenue Split</h3>
              <div className="flex-1 flex items-center justify-center gap-8">
                <div className="w-36 h-36 rounded-full relative" 
                     style={{ 
                       background: "conic-gradient(hsl(var(--primary)) 0% 60%, hsl(var(--accent)) 60% 90%, hsl(var(--muted)) 90% 100%)" 
                     }}>
                  <div className="absolute inset-5 bg-card rounded-full shadow-inner flex items-center justify-center">
                    <span className="font-bold text-sm">₹1.2L</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-4 h-4 rounded bg-primary"></div>
                    <span className="text-foreground font-medium">Products (60%)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-4 h-4 rounded bg-accent"></div>
                    <span className="text-foreground font-medium">Services (30%)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-4 h-4 rounded bg-muted border border-border"></div>
                    <span className="text-foreground font-medium">Other (10%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 & 4: Insights & Roadmap */}
        <div className="space-y-8">
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">AI Action Items</h3>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Bot size={24} />
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border-l-4 border-green-500 border border-border shadow-sm">
                <div className="bg-green-500/10 p-2 rounded-lg shrink-0">
                  <TrendingUp size={20} className="text-green-500" />
                </div>
                <p className="text-sm text-foreground/90 font-medium pt-1">Sales increased 18% this month. Good job maintaining inventory!</p>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border-l-4 border-blue-500 border border-border shadow-sm">
                <div className="bg-blue-500/10 p-2 rounded-lg shrink-0">
                  <Clock size={20} className="text-blue-500" />
                </div>
                <p className="text-sm text-foreground/90 font-medium pt-1">Peak order time identified: 6PM - 8PM. Plan staff accordingly.</p>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border-l-4 border-accent border border-border shadow-sm">
                <div className="bg-accent/10 p-2 rounded-lg shrink-0">
                  <Package size={20} className="text-accent" />
                </div>
                <p className="text-sm text-foreground/90 font-medium pt-1">Most selling item: 20L Water Can. Ensure stock availability for weekend.</p>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border-l-4 border-yellow-500 border border-border shadow-sm">
                <div className="bg-yellow-500/10 p-2 rounded-lg shrink-0">
                  <Lightbulb size={20} className="text-yellow-500" />
                </div>
                <p className="text-sm text-foreground/90 font-medium pt-1">Tip: Offer Tuesday discounts to boost mid-week sales slumps.</p>
              </div>
            </div>

            <div className="pt-8 border-t border-border bg-muted/30 -mx-6 -mb-6 p-6 rounded-b-2xl">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center justify-between">
                Business Health Score
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold">Excellent</span>
              </h4>
              <div className="flex items-end gap-4 mb-4">
                <span className="text-5xl font-black text-primary leading-none">78</span>
                <span className="text-xl text-muted-foreground font-bold mb-1">/ 100</span>
              </div>
              <div className="w-full h-4 bg-background rounded-full overflow-hidden border border-border">
                <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full w-[78%]"></div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-8 text-foreground pb-4 border-b border-border">Growth Roadmap</h3>
            <div className="space-y-0 relative pl-6">
              {[
                { week: "Phase 1", task: "Launch Digital Website", done: true, desc: "Completed on Oct 12" },
                { week: "Phase 2", task: "Enable WhatsApp CRM", done: true, desc: "Completed on Oct 15" },
                { week: "Phase 3", task: "Collect 50+ Google Reviews", done: false, desc: "In progress (32/50)" },
                { week: "Phase 4", task: "Run Festival Offers Ads", done: false, desc: "Planned for Nov" },
              ].map((item, i, arr) => (
                <div key={i} className="relative pb-8">
                  {i !== arr.length - 1 && (
                    <div className={`absolute top-4 left-[-20px] w-1 h-full rounded-full ${item.done ? 'bg-primary' : 'bg-muted border border-border'}`}></div>
                  )}
                  <div className={`absolute top-1 left-[-28px] w-5 h-5 rounded-full border-4 bg-card z-10 ${item.done ? 'border-primary bg-primary' : 'border-muted-foreground bg-background'}`}></div>
                  
                  <div className="flex flex-col gap-1 -mt-1 bg-background p-4 rounded-xl border border-border shadow-sm">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.week}</span>
                    <span className={`font-bold text-lg ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>{item.task}</span>
                    <span className="text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
