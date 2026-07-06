import { MessageCircle, ArrowRight, Smartphone, Settings } from "lucide-react";

export default function WhatsAppPage() {
  const dummyMessage = "Hello 👋,\n\nYour order has been confirmed and is being processed.\n\nThank you for choosing us! Reply to this message if you need any help.";
  const encodedMessage = encodeURIComponent(dummyMessage);
  const whatsappUrl = `https://wa.me/919876543210?text=${encodedMessage}`;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full flex flex-col justify-center min-h-[calc(100vh-100px)]">
      <div className="bg-card border border-card-border rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#128C7E] to-[#25D366] p-8 md:p-10 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg">
              <MessageCircle size={40} className="fill-white/20" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">WhatsApp Business</h1>
              <p className="text-green-50 text-lg font-medium opacity-90">Connect with your customers instantly, 24/7.</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Preview */}
          <div>
            <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Smartphone className="text-muted-foreground" /> Auto-Message Preview
            </h2>
            
            {/* Chat Bubble Simulation */}
            <div className="bg-[#EFEAE2] dark:bg-[#0b141a] p-6 rounded-2xl border border-border shadow-inner relative h-[300px] flex flex-col justify-end">
              <div className="absolute inset-0 opacity-40 bg-[url('https://i.pinimg.com/originals/8f/ba/cb/8fbacbd464e996966eb9d4a6b7a9c21e.jpg')] bg-cover mix-blend-overlay"></div>
              
              <div className="relative z-10 bg-white dark:bg-[#202c33] p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] self-end ml-auto">
                <p className="text-[#111b21] dark:text-[#e9edef] whitespace-pre-wrap font-medium text-[15px] leading-relaxed">
                  {dummyMessage}
                </p>
                <div className="text-[11px] text-[#667781] dark:text-[#8696a0] text-right mt-2 flex justify-end items-center gap-1">
                  10:42 AM 
                  <svg viewBox="0 0 16 15" width="16" height="15" className="fill-[#53bdeb]"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="bg-muted/50 border border-border p-6 rounded-2xl">
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <Settings size={18} className="text-primary" /> Configuration Needed
              </h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                Replace the dummy number with your official business WhatsApp number in the settings to activate automated responses for your customers.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                data-testid="button-open-whatsapp"
                className="w-full py-5 px-6 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-500/25 transform hover:-translate-y-1 text-lg"
              >
                <MessageCircle size={24} />
                Test on WhatsApp
                <ArrowRight size={20} />
              </a>
              
              <button className="w-full py-4 px-6 bg-card border-2 border-border hover:border-primary/50 hover:bg-muted text-foreground rounded-xl font-bold transition-colors">
                Edit Auto-Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
