import { TrendingUp, Clock, Package, Lightbulb, Bot, CheckCircle } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Business Insights</h1>
        <p className="text-muted-foreground text-lg">AI-powered analytics and recommendations.</p>
      </header>

      {/* Section 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: "₹4,280", trend: "+12%" },
          { label: "Monthly Sales", value: "₹1,28,500", trend: "+18%" },
          { label: "Total Orders", value: "342", trend: "+5%" },
          { label: "Customers", value: "89", trend: "+8%" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <span className="text-green-500 text-sm font-medium mb-1">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 2: Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-foreground">Monthly Sales Overview</h3>
            <div className="h-64 flex items-end justify-between gap-2 pt-4">
              {[
                { label: "Jan", val: 85000, height: "65%" },
                { label: "Feb", val: 92000, height: "70%" },
                { label: "Mar", val: 78000, height: "60%" },
                { label: "Apr", val: 110000, height: "85%" },
                { label: "May", val: 128500, height: "100%" },
                { label: "Jun", val: 115000, height: "90%" },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group cursor-default">
                  <div className="w-full relative flex-1 flex items-end rounded-t-sm">
                    <div 
                      className="w-full bg-primary/80 group-hover:bg-primary rounded-t-md transition-all duration-300 ease-out"
                      style={{ height: bar.height }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{(bar.val/1000).toFixed(1)}k
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-3 font-medium">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-foreground">Weekly Orders</h3>
              <div className="h-40 relative mt-4">
                <svg viewBox="0 0 700 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <path 
                    d="M 0,200 L 0,150 L 100,160 L 200,120 L 300,105 L 400,65 L 500,30 L 600,140 L 700,140 L 700,200 Z" 
                    fill="currentColor" 
                    className="text-primary/20"
                  />
                  <polyline 
                    points="0,150 100,160 200,120 300,105 400,65 500,30 600,140 700,140" 
                    fill="none" 
                    stroke="currentColor" 
                    className="text-primary"
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold mb-6 text-foreground">Revenue Split</h3>
              <div className="flex-1 flex items-center justify-center gap-8">
                <div className="w-32 h-32 rounded-full relative" 
                     style={{ 
                       background: "conic-gradient(hsl(var(--primary)) 0% 60%, hsl(var(--accent)) 60% 90%, hsl(var(--muted)) 90% 100%)" 
                     }}>
                  <div className="absolute inset-4 bg-card rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-sm bg-primary"></div>
                    <span className="text-foreground">Products (60%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-sm bg-accent"></div>
                    <span className="text-foreground">Services (30%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-sm bg-muted"></div>
                    <span className="text-foreground">Other (10%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 & 4: Insights & Roadmap */}
        <div className="space-y-6">
          <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">AI Business Insights</h3>
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Bot size={18} />
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <TrendingUp size={18} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/90 font-medium">Sales increased 18% this month compared to last month.</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Clock size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/90 font-medium">Peak order time identified: 6PM - 8PM. Plan staff accordingly.</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <Package size={18} className="text-accent mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/90 font-medium">Most selling item: 20L Water Can. Ensure stock availability.</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Lightbulb size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/90 font-medium">Tip: Offer Tuesday discounts to boost mid-week sales slumps.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Business Health Score</h4>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl font-black text-primary">78</span>
                <span className="text-xl text-muted-foreground font-medium">/ 100</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[78%]"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-right">Good condition</p>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-foreground">Growth Roadmap</h3>
            <div className="space-y-0 relative pl-4">
              {[
                { week: "Week 1", task: "Launch Website", done: true },
                { week: "Week 2", task: "Enable WhatsApp Business", done: true },
                { week: "Week 3", task: "Collect Google Reviews", done: false },
                { week: "Week 4", task: "Run Festival Offers", done: false },
              ].map((item, i, arr) => (
                <div key={i} className="relative pb-6">
                  {i !== arr.length - 1 && (
                    <div className={`absolute top-2 left-[-16px] w-0.5 h-full ${item.done ? 'bg-primary' : 'bg-primary/20'}`}></div>
                  )}
                  <div className={`absolute top-0.5 left-[-22px] w-3.5 h-3.5 rounded-full border-2 bg-card ${item.done ? 'border-primary bg-primary' : 'border-primary/30'}`}></div>
                  
                  <div className="flex flex-col gap-1 -mt-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.week}</span>
                    <span className={`font-medium ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>{item.task}</span>
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
