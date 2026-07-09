import { useState } from "react";
import { 
  useListKnowledgeDocuments, 
  useUploadKnowledgeFile, 
  useQueryKnowledge 
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { 
  UploadCloud, 
  FileText, 
  Send, 
  Bot, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  BookOpen
} from "lucide-react";
import { 
  Empty, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription, 
  EmptyMedia 
} from "../components/ui/empty";
import { SkeletonCard } from "../components/SkeletonCard";

interface Message {
  role: "user" | "agent";
  text: string;
  sources?: any[];
}

export default function SupportPage() {
  const orgId = 1; // Default tenant
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { role: "agent", text: "Hello! I am your business support assistant. Upload your product catalog or policies, and I will answer questions grounded in those documents." }
  ]);
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});

  // API Hooks
  const { data: documents = [], isLoading: loadingDocs, refetch: refetchDocs } = useListKnowledgeDocuments({ orgId });
  const uploadMutation = useUploadKnowledgeFile();
  const queryMutation = useQueryKnowledge();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await uploadMutation.mutateAsync({
        data: { file },
        params: { orgId }
      });
      toast({ title: "Document Uploaded", description: `Successfully uploaded and chunked ${file.name}` });
      setFile(null);
      refetchDocs();
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message || "Failed to index file", variant: "destructive" });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMsg = question;
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setQuestion("");

    try {
      const res = await queryMutation.mutateAsync({
        data: { question: userMsg, orgId }
      });

      setChatHistory(prev => [...prev, { 
        role: "agent", 
        text: res.answer, 
        sources: res.sources 
      }]);
    } catch (err: any) {
      toast({ title: "Query Failed", description: err.message || "Failed to get grounded answer", variant: "destructive" });
    }
  };

  const toggleSource = (msgIndex: number) => {
    setExpandedSources(prev => ({
      ...prev,
      [msgIndex]: !prev[msgIndex]
    }));
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-black tracking-tight font-display text-foreground flex items-center gap-2">
          <Bot className="text-primary animate-pulse" /> Grounded Support Agent
        </h1>
        <p className="text-muted-foreground text-sm font-sans">
          Upload catalogs or guides and get verified answers with source citations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Upload & Document management */}
        <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card space-y-6 lg:col-span-1">
          <div>
            <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2 mb-1">
              <UploadCloud className="text-muted-foreground" size={20} /> Upload Knowledge Base
            </h2>
            <p className="text-xs text-muted-foreground font-sans">
              Add catalog PDFs or instruction TXT files to ground the AI.
            </p>
          </div>

          {/* Upload card box */}
          <div className="border border-dashed border-border rounded-2xl p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center gap-3">
            <UploadCloud size={32} className="text-muted-foreground" />
            <div className="text-xs text-muted-foreground font-sans">
              <label className="text-primary font-bold hover:underline cursor-pointer">
                Choose a file
                <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="hidden" />
              </label>
              <span className="block mt-1">{file ? file.name : "PDF or TXT up to 10MB"}</span>
            </div>
            
            {file && (
              <button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="w-full mt-2 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-card cursor-pointer"
              >
                {uploadMutation.isPending ? <Loader2 className="animate-spin animate-infinite" size={14} /> : "Index Document"}
              </button>
            )}
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider font-sans">
              Indexed Documents ({documents.length})
            </h3>
            
            {loadingDocs ? (
              <div className="space-y-2">
                <SkeletonCard className="h-10 w-full" />
                <SkeletonCard className="h-10 w-full" />
              </div>
            ) : documents.length === 0 ? (
              <Empty className="border border-dashed border-border p-6 rounded-2xl bg-muted/10">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><FileText size={16} className="text-muted-foreground" /></EmptyMedia>
                  <EmptyTitle className="text-sm font-bold">No indexed files</EmptyTitle>
                  <EmptyDescription className="text-xs">No documents uploaded yet.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center gap-2.5 p-3 bg-muted/30 border border-border rounded-xl shadow-card text-xs">
                    <BookOpen size={14} className="text-primary shrink-0" />
                    <span className="font-semibold text-foreground truncate flex-1 font-sans">{doc.filename}</span>
                    <span className="text-[10px] text-muted-foreground font-sans">
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Conversational Chat Agent */}
        <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card lg:col-span-2 flex flex-col h-[600px]">
          <div className="pb-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-foreground">Support Chat</h2>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-sans">
                  <Sparkles size={12} className="text-amber-500" /> Grounded in merchant files
                </span>
              </div>
            </div>
          </div>

          {/* Chat feed */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {chatHistory.map((msg, index) => {
              const isAgent = msg.role === "agent";
              return (
                <div key={index} className={`flex gap-3 max-w-[85%] ${isAgent ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                  {isAgent && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm border border-primary/20">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className={`p-4 rounded-2xl shadow-card text-sm leading-relaxed ${
                      isAgent 
                        ? "bg-muted/40 border border-border text-foreground rounded-tl-none font-sans" 
                        : "bg-primary text-primary-foreground rounded-tr-none font-sans font-bold"
                    }`}>
                      {msg.text}
                    </div>

                    {/* Sources citation view for agent messages */}
                    {isAgent && msg.sources && msg.sources.length > 0 && (
                      <div className="text-xs">
                        <button
                          onClick={() => toggleSource(index)}
                          className="flex items-center gap-1 font-bold text-primary hover:underline cursor-pointer"
                        >
                          {expandedSources[index] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {expandedSources[index] ? "Hide Citations" : `View Sources (${msg.sources.length})`}
                        </button>
                        
                        {expandedSources[index] && (
                          <div className="mt-2 space-y-2 pl-2 border-l border-border bg-muted/20 p-2.5 rounded-xl">
                            {msg.sources.map((src, sIdx) => (
                              <div key={sIdx} className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground font-sans">
                                  <span>Source: {src.filename}</span>
                                  <span className="text-emerald-600 font-sans">Match: {(src.similarity * 100).toFixed(0)}%</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground italic font-sans">
                                  "{src.contentText}"
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {queryMutation.isPending && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 animate-pulse">
                  <Bot size={14} />
                </div>
                <div className="p-3 bg-muted/40 border border-border rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="animate-spin text-primary" size={14} />
                  <span className="text-xs text-muted-foreground font-sans font-semibold">Consulting document chunks...</span>
                </div>
              </div>
            )}
          </div>

          {/* Form chat input */}
          <form onSubmit={handleSend} className="pt-4 border-t border-border flex gap-2.5">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question from catalog documentation..."
              className="flex-1 px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm font-sans focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="submit"
              disabled={queryMutation.isPending || !question.trim()}
              className="p-3 bg-primary text-primary-foreground hover:opacity-95 rounded-xl hover:scale-[1.05] active:scale-[0.95] transition-all cursor-pointer shadow-card flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
