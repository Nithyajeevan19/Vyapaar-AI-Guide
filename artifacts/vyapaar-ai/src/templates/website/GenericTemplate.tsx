import { useState } from "react";
import { BusinessBranding } from "../../services/geminiService";
import { Phone, MapPin, Mail, ChevronRight, CheckCircle2, MessageSquare, ShoppingCart, Search, CreditCard, Sparkles } from "lucide-react";
import { useSubmitInquiry, useCreateOrder, useListOrders } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../hooks/useAuth";

interface Props {
  branding: BusinessBranding;
  phone: string;
}

export function GenericTemplate({ branding, phone }: Props) {
  const { toast } = useToast();
  const { currentOrgId } = useAuth();
  const orgId = currentOrgId;
  const whatsappLink = `https://wa.me/${phone.replace(/\D/g, "")}`;

  // Form State variables
  const [inqForm, setInqForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [orderQty, setOrderQty] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState("Standard Delivery");
  const [trackPhone, setTrackPhone] = useState("");
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<number | null>(null);

  // Mutation Hooks
  const submitInquiryMutation = useSubmitInquiry();
  const createOrderMutation = useCreateOrder();

  // Search orders query for tracking
  const { data: trackOrders = [], refetch: refetchTrackOrders } = useListOrders(
    { orgId },
    { query: { enabled: false } as any }
  );

  // Calculate pricing based on selection
  const unitPrice = selectedProduct === "Standard Delivery" ? 40 : 150; // in Rupees
  const totalAmount = unitPrice * orderQty;

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inqForm.name || !inqForm.phone) return;
    try {
      await submitInquiryMutation.mutateAsync({
        data: {
          orgId,
          name: inqForm.name,
          email: inqForm.email || undefined,
          phone: inqForm.phone,
          message: inqForm.message,
        },
      });
      toast({ title: "Inquiry Sent", description: "Your message has been registered with our team." });
      setInqForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast({ title: "Error", description: "Failed to send inquiry.", variant: "destructive" });
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const order = await createOrderMutation.mutateAsync({
        data: {
          orgId,
          totalAmount: totalAmount * 100, // convert to paise
          status: "pending",
          paymentStatus: "pending",
          paymentMethod: "upi",
          type: "delivery",
          items: [
            {
              price: unitPrice * 100,
              quantity: orderQty,
            },
          ],
        },
      });
      setSubmittedOrderId(order.id);
      setOrderSubmitted(true);
      toast({ title: "Order Placed", description: "Your order is registered. Scan the UPI QR below to finish payment." });
    } catch {
      toast({ title: "Error", description: "Checkout failed.", variant: "destructive" });
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackPhone) return;
    await refetchTrackOrders();
    toast({ title: "Tracking Updated", description: "Fetched order history matching your active profile." });
  };

  // Simulated UPI URI for QR codes
  const businessCleanName = branding.businessName.replace(/\s+/g, "+");
  const upiPayLink = `upi://pay?pa=vyapaar.ai@axis&pn=${businessCleanName}&am=${totalAmount}&cu=INR&tn=Order+Payment`;

  return (
    <div className="w-full min-h-full bg-slate-50 text-slate-900 font-sans overflow-y-auto pb-10">
      {/* Hero */}
      <section 
        className="py-24 px-6 md:px-12 text-center text-white relative overflow-hidden"
        style={{ backgroundColor: branding.primaryColor }}
      >
        <div className="absolute inset-0 bg-black/15"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">{branding.businessName}</h1>
          <p className="text-xl md:text-2xl mb-8 font-medium text-white/90 italic">"{branding.tagline}"</p>
          <div className="flex justify-center gap-4">
            <a 
              href="#order-portal"
              className="bg-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-base flex items-center gap-2"
              style={{ color: branding.primaryColor }}
            >
              <ShoppingCart size={16} /> Order Online
            </a>
            <a 
              href="#contact"
              className="bg-white/10 hover:bg-white/20 font-bold py-3.5 px-8 rounded-full border border-white/35 transition-all text-base"
            >
              Send Inquiry
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-wide">About Us</h2>
        <p className="text-lg text-slate-600 leading-relaxed font-semibold">{branding.shortDescription}</p>
      </section>

      {/* Interactive Self-Service Portal */}
      <section id="order-portal" className="py-16 px-6 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-800 flex items-center justify-center gap-2">
              <Sparkles className="text-primary animate-pulse" size={28} />
              Customer Self-Service Portal
            </h2>
            <p className="text-muted-foreground text-sm">Place quick orders, verify invoices, or drop inquiries directly.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Box 1: Booking / Order Flow */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <ShoppingCart size={20} className="text-primary" />
                Quick Booking & Order Placement
              </h3>

              {!orderSubmitted ? (
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Choose Product / Service</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl outline-none focus:border-primary text-sm font-semibold cursor-pointer"
                    >
                      <option value="Standard Delivery">Standard Service Package (₹40)</option>
                      <option value="Premium Delivery">Premium Service Package (₹150)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                        className="w-9 h-9 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-base w-6 text-center">{orderQty}</span>
                      <button
                        type="button"
                        onClick={() => setOrderQty(orderQty + 1)}
                        className="w-9 h-9 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-800">
                    <span>Total Bill:</span>
                    <span className="text-lg text-primary font-black">₹{totalAmount}</span>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-primary text-white hover:opacity-95 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm text-sm"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <CreditCard size={16} /> Place Order & Pay
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Order #{submittedOrderId} Placed!</h4>
                    <p className="text-xs text-slate-500">Scan the UPI QR Code below to finalize your instant transaction.</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl w-40 h-40 mx-auto flex items-center justify-center shadow-inner relative group">
                    {/* Simulated QR Code using design blocks */}
                    <div className="grid grid-cols-5 gap-2 w-28 h-28 opacity-90">
                      {Array.from({ length: 25 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`rounded-sm ${(idx * 7 + 13) % 5 === 0 || idx % 4 === 0 ? "bg-slate-900" : "bg-transparent"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <a
                    href={upiPayLink}
                    className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Open UPI App (₹{totalAmount})
                  </a>
                  <button
                    onClick={() => { setOrderSubmitted(false); setOrderQty(1); }}
                    className="block mx-auto text-xs text-primary font-bold hover:underline"
                  >
                    Place Another Order
                  </button>
                </div>
              )}
            </div>

            {/* Box 2: Return Customer Track History */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Search size={20} className="text-primary" />
                Track Order / Booking Status
              </h3>
              <form onSubmit={handleTrack} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={trackPhone}
                  onChange={(e) => setTrackPhone(e.target.value)}
                  placeholder="Enter registered phone number"
                  className="flex-1 px-3 py-2 border border-slate-200 bg-white rounded-xl outline-none focus:border-primary text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-950 text-white font-bold rounded-xl"
                >
                  Track
                </button>
              </form>

              <div className="space-y-3 max-h-[220px] overflow-y-auto">
                {trackOrders.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-semibold">Enter your phone number to retrieve active ticket states.</div>
                ) : (
                  trackOrders.map((ord: any, idx: number) => (
                    <div key={idx} className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">Order #{ord.id}</p>
                        <p className="text-slate-500 font-semibold mt-0.5">Amount: ₹{(ord.totalAmount / 100).toLocaleString("en-IN")}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">
                        {ord.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Inquiry Form / Contact Section */}
      <section id="contact" className="py-20 px-6 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-wide">Get In Touch</h2>
          <p className="text-muted-foreground text-sm">Have special bulk requirements? Message us directly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Phone size={24} style={{ color: branding.primaryColor }} />
              <div>
                <h4 className="font-bold text-xs text-slate-400 uppercase">Phone</h4>
                <p className="text-slate-700 font-bold text-sm">{phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Mail size={24} style={{ color: branding.primaryColor }} />
              <div>
                <h4 className="font-bold text-xs text-slate-400 uppercase">Email</h4>
                <p className="text-slate-700 font-semibold text-sm">contact@{branding.businessName.toLowerCase().replace(/\s+/g, "")}.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <MapPin size={24} style={{ color: branding.primaryColor }} />
              <div>
                <h4 className="font-bold text-xs text-slate-400 uppercase">Address</h4>
                <p className="text-slate-700 font-semibold text-sm">Main Branch, Hyderabad</p>
              </div>
            </div>
          </div>

          {/* Form container */}
          <form onSubmit={handleInquirySubmit} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={inqForm.name}
                onChange={(e) => setInqForm({ ...inqForm, name: e.target.value })}
                placeholder="Ramesh Kumar"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={inqForm.phone}
                  onChange={(e) => setInqForm({ ...inqForm, phone: e.target.value })}
                  placeholder="+91..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  value={inqForm.email}
                  onChange={(e) => setInqForm({ ...inqForm, email: e.target.value })}
                  placeholder="name@email.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Requirements / Message</label>
              <textarea
                value={inqForm.message}
                onChange={(e) => setInqForm({ ...inqForm, message: e.target.value })}
                placeholder="Write your request here..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary text-xs resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-xs"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <MessageSquare size={14} /> Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm font-medium bg-slate-100 border-t border-slate-200">
        <p>© {new Date().getFullYear()} {branding.businessName}. All rights reserved.</p>
        <p className="text-xs text-slate-400 mt-1">Powered by Vyapaar AI OS.</p>
      </footer>
    </div>
  );
}
