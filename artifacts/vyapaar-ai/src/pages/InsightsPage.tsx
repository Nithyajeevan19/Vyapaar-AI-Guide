import { 
  TrendingUp, 
  Clock, 
  Package, 
  Bot, 
  Users, 
  Loader2, 
  ChevronRight, 
  AlertCircle, 
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  CheckCircle2
} from "lucide-react";
import { 
  useGetAnalyticsDashboard, 
  useGetInventoryForecast, 
  useGetRevenueForecast 
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://vyapaar-ai-guide-1.onrender.com";

export default function InsightsPage() {
  const orgId = 1;

  // API hooks for analytics and predictions
  const { data: stats, isLoading: loadingStats } = useGetAnalyticsDashboard({ orgId });
  const { data: inventoryForecast = [], isLoading: loadingInventory } = useGetInventoryForecast({ orgId, days: 10 });
  const { data: revenueForecast, isLoading: loadingRevenue } = useGetRevenueForecast({ orgId });

  const { data: insights = [] } = useQuery<any[]>({
    queryKey: ["analyticsInsights"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/analytics/insights?orgId=${orgId}`);
      return res.json();
    }
  });

  if (loadingStats || loadingInventory || loadingRevenue) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  // Formatted KPIs
  const revenueTodayVal = stats?.revenueToday !== undefined
    ? `₹${(stats.revenueToday / 100).toLocaleString("en-IN")}`
    : "₹4,280";
  const revenueMonthlyVal = stats?.revenueMonthly !== undefined
    ? `₹${(stats.revenueMonthly / 100).toLocaleString("en-IN")}`
    : "₹1,28,500";
  const ordersTotalVal = stats?.ordersTotal !== undefined
    ? String(stats.ordersTotal)
    : "342";
  const customersCountVal = stats?.customersCount !== undefined
    ? String(stats.customersCount)
    : "89";

  const salesHistory = stats?.salesHistory || [];
  const maxVal = Math.max(...salesHistory.map(s => s.val ?? 0), 1);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Bot className="text-primary animate-pulse" size={36} />
          Business Insights & Forecasts
        </h1>
        <p className="text-muted-foreground text-base md:text-lg font-sans">
          AI performance analytics and predictive trend modeling.
        </p>
      </header>

      {/* Section 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Today's Revenue", value: revenueTodayVal, trend: "+12%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Monthly Sales", value: revenueMonthlyVal, trend: "+18%", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Orders", value: ordersTotalVal, trend: "+5%", icon: Package, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Customers", value: customersCountVal, trend: "+8%", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-card-border rounded-3xl p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="px-2.5 py-1 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold font-sans">{stat.trend}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 font-sans">{stat.label}</p>
              <p className="text-3xl font-black text-foreground font-sans">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section 2: Predictive Forecast Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Forecasting */}
        {revenueForecast && (
          <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" /> Projected Revenue Estimate
              </h3>
              <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full font-sans uppercase tracking-wider">
                {revenueForecast.projectedMonth} Forecast
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-foreground font-sans">
                  ₹{(revenueForecast.projectedRevenue / 100).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-muted-foreground font-sans">estimated billing</span>
              </div>

              {/* Caveat alert callout */}
              <div className="flex gap-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-500 p-4 rounded-2xl text-xs font-sans">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Estimate Notice:</strong> {revenueForecast.caveat}
                </p>
              </div>

              {/* Mini Trend Spark chart */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider font-sans">Linear Trend Path</span>
                <div className="h-16 flex items-end gap-1 border-b border-border pb-1">
                  {(revenueForecast.historicalTrend || []).map((t: any, idx: number) => {
                    const hMax = Math.max(...revenueForecast.historicalTrend.map((ht: any) => ht.revenue), 1);
                    const pct = `${Math.round((t.revenue / hMax) * 100)}%`;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        <div className="bg-primary/30 group-hover:bg-primary/50 rounded-t w-full" style={{ height: pct }} />
                        <span className="text-[9px] text-muted-foreground mt-1 font-sans">{t.month}</span>
                      </div>
                    );
                  })}
                  {/* Projected Month Bar */}
                  <div className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div className="bg-gradient-to-t from-primary to-accent rounded-t w-full animate-pulse" 
                         style={{ height: `${Math.round((revenueForecast.projectedRevenue / Math.max(...revenueForecast.historicalTrend.map((ht: any) => ht.revenue), 1)) * 100)}%` }} />
                    <span className="text-[9px] text-primary font-bold mt-1 font-sans">{revenueForecast.projectedMonth.slice(0, 3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Stockout Alerts */}
        <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <ShieldAlert size={20} className="text-destructive animate-bounce" /> Inventory Stockout Forecast (10-Day Horizon)
            </h3>
            <span className="text-[10px] bg-destructive/10 text-destructive font-bold px-2 py-0.5 rounded-full font-sans uppercase">
              Predictive Risks
            </span>
          </div>

          {inventoryForecast.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground font-sans space-y-2">
              <CheckCircle2 className="text-emerald-500" size={32} />
              <h4 className="font-bold text-foreground">Catalog is safe</h4>
              <p className="text-xs">No products are likely to stock out in the next 10 days.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {inventoryForecast.map((item: any) => (
                <div key={item.productId} className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-2xl text-xs font-sans">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground">{item.name}</span>
                    <p className="text-muted-foreground text-[10px]">
                      Velocity: {item.velocity} items/day | Stock: {item.currentStock} remaining
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[9px] ${
                      item.riskLevel === "High" 
                        ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}>
                      {item.daysRemaining === 0 ? "Out of Stock" : `Stockout in ${item.daysRemaining}d`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Historical overview chart */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-card">
            <h3 className="text-xl font-bold mb-8 text-foreground font-display">Monthly Sales Overview</h3>
            <div className="h-80 flex items-end justify-between gap-2 md:gap-4 relative pb-6 border-b border-border">
              {/* Baseline */}
              <div className="absolute bottom-6 left-0 right-0 h-px bg-border"></div>
              
              {salesHistory.map((bar: any, i: number) => {
                const heightPct = `${Math.round(((bar.val ?? 0) / maxVal) * 80) + 10}%`; // scale from 10% to 90%
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group cursor-default h-full justify-end relative z-10">
                    <div className="w-full max-w-[4rem] relative flex flex-col items-center justify-end h-full">
                      {/* Value Label */}
                      <div className="text-xs font-bold text-muted-foreground mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-background px-2 py-1 rounded shadow-sm border border-border font-sans">
                        ₹{((bar.val ?? 0)/100000).toFixed(1)}k
                      </div>
                      {/* Bar */}
                      <div 
                        className="w-full bg-gradient-to-t from-primary/80 to-accent/80 group-hover:from-primary group-hover:to-accent rounded-t-xl transition-all duration-300 ease-out"
                        style={{ height: heightPct }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground mt-4 font-bold font-sans">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Action Items */}
        <div className="space-y-8">
          <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <h3 className="text-xl font-bold text-foreground font-display">AI Action Items</h3>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Bot size={24} />
              </div>
            </div>
            
            <div className="space-y-4 mb-8 font-sans">
              {insights.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground font-semibold animate-pulse">Generating insights...</div>
              ) : (
                insights.map((ins: any, idx: number) => {
                  const borderColors = ["border-green-500", "border-blue-500", "border-amber-500", "border-purple-500"];
                  const bColor = borderColors[idx % borderColors.length];
                  return (
                    <div key={idx} className={`flex flex-col gap-3 p-4 rounded-2xl bg-card border-l-4 ${bColor} border border-border shadow-sm`}>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-foreground flex items-center justify-between gap-2">
                          <span>{ins.title}</span>
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{ins.impact} Impact</span>
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{ins.description}</p>
                      </div>
                      <div className="flex justify-end mt-1">
                        <Link href={ins.actionPath}>
                          <button className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer">
                            {ins.actionText} <ChevronRight size={12} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
