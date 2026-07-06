import { MessageCircle, ArrowRight } from "lucide-react";

export default function WhatsAppPage() {
  const dummyMessage = "Hello,\nYour order has been confirmed.\nThank you for choosing us!";
  const encodedMessage = encodeURIComponent(dummyMessage);
  const whatsappUrl = `https://wa.me/919876543210?text=${encodedMessage}`;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto h-full flex flex-col justify-center">
      <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <MessageCircle size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">WhatsApp Business</h1>
            <p className="text-muted-foreground">Connect with your customers instantly.</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3 text-foreground">Preview Auto-Message</h2>
          <div className="bg-muted p-4 rounded-xl font-mono text-sm text-foreground whitespace-pre-wrap border border-border">
            {dummyMessage}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="button-open-whatsapp"
            className="w-full sm:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg shadow-green-500/20"
          >
            <MessageCircle size={20} />
            Open WhatsApp
            <ArrowRight size={18} />
          </a>
          
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Replace the dummy number with your business WhatsApp number to go live.
          </p>
        </div>
      </div>
    </div>
  );
}
