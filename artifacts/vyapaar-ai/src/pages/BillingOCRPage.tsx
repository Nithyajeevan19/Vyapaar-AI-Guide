import React, { useState, useEffect } from "react";
import { 
  useOcrInvoice, 
  useListCustomers, 
  useListProducts, 
  useCreateProduct, 
  useCreateOrder, 
  useCreateInvoice,
  useCreateCustomer
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { 
  Camera, 
  FileImage, 
  Check, 
  Loader2, 
  Plus, 
  Trash2, 
  X, 
  FileText, 
  Building, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2,
  FileCheck,
  Map,
  Table,
  Upload,
  Files
} from "lucide-react";
import { SkeletonCard } from "../components/SkeletonCard";
import * as XLSX from "xlsx";

interface ExtractedItem {
  id?: string;
  name: string;
  quantity: number;
  price: number; // decimal (e.g. 15.5)
}

export default function BillingOCRPage() {
  const { currentOrgId: orgId } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<"capture" | "processing" | "review" | "done" | "mapping">("capture");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form State for Review
  const [vendorName, setVendorName] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string | "">("");
  const [lineItems, setLineItems] = useState<ExtractedItem[]>([]);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Excel Mapping Specific State
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelRows, setExcelRows] = useState<any[][]>([]);
  const [selectedNameCol, setSelectedNameCol] = useState<string>("");
  const [selectedQtyCol, setSelectedQtyCol] = useState<string>("");
  const [selectedPriceCol, setSelectedPriceCol] = useState<string>("");

  // Multi-stage loading messaging for AI Scanning
  const [loadingStage, setLoadingStage] = useState(0);
  const stages = [
    "Preparing image/document buffer for transmission...",
    "Scanning layout structure via Gemini Flash 1.5...",
    "Extracting vendor details and item matrix...",
    "Running Zod validation checks on parsed JSON..."
  ];

  // API hooks
  const { data: customers = [], isLoading: loadingCustomers } = useListCustomers({ orgId });
  const { data: products = [], refetch: refetchProducts } = useListProducts({ orgId });
  const ocrMutation = useOcrInvoice();
  const createProductMutation = useCreateProduct();
  const createOrderMutation = useCreateOrder();
  const createInvoiceMutation = useCreateInvoice();
  const createCustomerMutation = useCreateCustomer();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "processing") {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const isXlsx = selected.name.endsWith(".xlsx") || selected.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const isPdf = selected.type === "application/pdf";

      // Limit caps verification
      if (isPdf && selected.size > 15 * 1024 * 1024) {
        toast({ title: "PDF File Too Large", description: "PDF documents must not exceed 15MB.", variant: "destructive" });
        return;
      }
      if (!isPdf && selected.size > 5 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Image and spreadsheet files must not exceed 5MB.", variant: "destructive" });
        return;
      }

      setFile(selected);
      if (isPdf) {
        setPreviewUrl("pdf");
      } else if (isXlsx) {
        setPreviewUrl("excel");
      } else {
        setPreviewUrl(URL.createObjectURL(selected));
      }
    }
  };

  const mapAndTransition = (rows: any[][], nameIdx: number, qtyIdx: number, priceIdx: number) => {
    const parsedItems = rows.map((row, idx) => {
      const name = row[nameIdx] !== undefined ? String(row[nameIdx]).trim() : "";
      
      let quantity = 1;
      if (qtyIdx !== -1 && row[qtyIdx] !== undefined) {
        const parsedQty = parseInt(row[qtyIdx], 10);
        if (!isNaN(parsedQty)) quantity = Math.max(1, parsedQty);
      }

      let price = 0;
      if (priceIdx !== -1 && row[priceIdx] !== undefined) {
        const parsedPrice = parseFloat(row[priceIdx]);
        if (!isNaN(parsedPrice)) price = Math.max(0, parsedPrice);
      }

      if (!name) return null;
      return {
        id: `excel-item-${idx}-${Date.now()}`,
        name,
        quantity,
        price
      };
    }).filter(Boolean) as ExtractedItem[];

    if (parsedItems.length === 0) {
      toast({ title: "No Rows Parsed", description: "Could not import any rows. Ensure your columns contain valid data.", variant: "destructive" });
      setStep("capture");
      return;
    }

    setVendorName("Spreadsheet Import");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setLineItems(parsedItems);

    if (customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    } else {
      setSelectedCustomerId("walk-in");
    }
    setStep("review");
    toast({ title: "Import Successful", description: `Successfully parsed and mapped ${parsedItems.length} lines.` });
  };

  const handleConfirmMapping = () => {
    if (!selectedNameCol) {
      toast({ title: "Product Name Column Required", description: "Please map the column containing product names.", variant: "destructive" });
      return;
    }

    const nameIdx = excelHeaders.indexOf(selectedNameCol);
    const qtyIdx = selectedQtyCol ? excelHeaders.indexOf(selectedQtyCol) : -1;
    const priceIdx = selectedPriceCol ? excelHeaders.indexOf(selectedPriceCol) : -1;

    mapAndTransition(excelRows, nameIdx, qtyIdx, priceIdx);
  };

  const handleOcrProcess = async () => {
    if (!file) return;

    const isXlsx = file.name.endsWith(".xlsx") || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (isXlsx) {
      // Excel Direct Processing Flow
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

          if (rawRows.length < 2) {
            toast({ title: "Spreadsheet Empty", description: "The spreadsheet must contain at least a header row and one row of data.", variant: "destructive" });
            return;
          }

          const headers = (rawRows[0] || []).map((h: any) => h ? String(h).trim() : "");
          const rows = rawRows.slice(1);

          // Look for regex indicators
          let nameIdx = headers.findIndex((h) => /name|item|product|description|desc|particulars/i.test(h));
          let qtyIdx = headers.findIndex((h) => /qty|quantity|count|pieces|vol/i.test(h));
          let priceIdx = headers.findIndex((h) => /price|rate|cost|unit/i.test(h));

          if (nameIdx !== -1 && qtyIdx !== -1 && priceIdx !== -1) {
            // Auto map & jump straight to review step
            mapAndTransition(rows, nameIdx, qtyIdx, priceIdx);
          } else {
            // Mismatched: Open column mapping step
            setExcelHeaders(headers);
            setExcelRows(rows);
            setSelectedNameCol(headers[nameIdx] || "");
            setSelectedQtyCol(headers[qtyIdx] || "");
            setSelectedPriceCol(headers[priceIdx] || "");
            setStep("mapping");
            toast({ title: "Column Mapping Required", description: "Some headers were not recognized. Please map them manually." });
          }
        } catch (err: any) {
          toast({ title: "Spreadsheet Error", description: err.message || "Failed to process the spreadsheet.", variant: "destructive" });
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // Native PDF / Image Scanning Path via Gemini
    setStep("processing");

    try {
      const data = await ocrMutation.mutateAsync({
        data: { image: file }
      });

      // Populate review state
      setVendorName(data.vendorName || "Unknown Vendor");
      setInvoiceDate(data.date || new Date().toISOString().split("T")[0]);
      
      const parsedItems = (data.lineItems || []).map((item, idx) => ({
        id: `item-${idx}-${Date.now()}`,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price || 0
      }));
      setLineItems(parsedItems);

      if (customers.length > 0) {
        setSelectedCustomerId(customers[0].id);
      } else {
        setSelectedCustomerId("walk-in");
      }

      setStep("review");
      toast({ title: "OCR Successful", description: "Line items extracted. Please review before committing." });
    } catch (err: any) {
      setStep("capture");
      toast({ 
        title: "OCR Failed", 
        description: err.message || "Failed to extract invoice parameters. Please verify file quality.", 
        variant: "destructive" 
      });
    }
  };

  const handleAddField = () => {
    setLineItems(prev => [
      ...prev,
      { id: `item-${Date.now()}`, name: "", quantity: 1, price: 0 }
    ]);
  };

  const handleRemoveField = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFieldChange = (id: string, field: keyof ExtractedItem, value: any) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + Number(taxAmount) - Number(discountAmount);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedCustomerId) {
      toast({ title: "Customer Required", description: "Please select a customer for this order & invoice record.", variant: "destructive" });
      return;
    }

    try {
      toast({ title: "Saving Records", description: "Mapping products and creating transactions..." });

      let customerIdToUse: number;
      if (typeof selectedCustomerId === "number") {
        customerIdToUse = selectedCustomerId;
      } else {
        // Resolve default/special customer option
        const defaultName = selectedCustomerId === "walk-in" ? "Walk-in Customer" :
                            selectedCustomerId === "online" ? "Online Order Customer" : "Regular Client";
        
        const existing = customers.find((c: any) => c.name.toLowerCase() === defaultName.toLowerCase());
        if (existing) {
          customerIdToUse = existing.id;
        } else {
          // Create the customer on-the-fly
          const newCust = await createCustomerMutation.mutateAsync({
            data: {
              orgId,
              name: defaultName,
              notes: "Automatically generated default customer"
            }
          });
          customerIdToUse = newCust.id;
        }
      }

      const finalItems = [];

      // 1. Resolve product mappings (match or create new catalog products)
      for (const item of lineItems) {
        const existing = products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
        
        let targetProductId: number;
        if (existing) {
          targetProductId = existing.id;
        } else {
          const newProduct = await createProductMutation.mutateAsync({
            data: {
              orgId,
              name: item.name,
              price: Math.round(item.price * 100), // store as paise
              category: "Scanned Invoice Items"
            }
          });
          targetProductId = newProduct.id;
        }

        finalItems.push({
          productId: targetProductId,
          quantity: item.quantity,
          price: Math.round(item.price * 100) // paise
        });
      }

      await refetchProducts();

      // 2. Create the Order
      const subtotalPaise = Math.round(calculateSubtotal() * 100);
      const totalPaise = Math.round(calculateTotal() * 100);

      const order = await createOrderMutation.mutateAsync({
        data: {
          orgId,
          customerId: customerIdToUse,
          status: "pending",
          totalAmount: totalPaise,
          items: finalItems
        }
      });

      // 3. Create the corresponding Invoice
      const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
      await createInvoiceMutation.mutateAsync({
        data: {
          orgId,
          orderId: order.id,
          customerId: customerIdToUse,
          invoiceNumber: invoiceNum,
          subtotal: subtotalPaise,
          tax: Math.round(taxAmount * 100),
          discount: Math.round(discountAmount * 100),
          total: totalPaise,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // due in 15 days
        }
      });

      setStep("done");
      toast({ title: "Billing Logged", description: "Successfully created order and generated client invoice record." });
    } catch (err: any) {
      toast({ title: "Submission Failed", description: err.message || "Failed to commit invoice details.", variant: "destructive" });
    }
  };

  const getSourceIcon = () => {
    if (!file) return <Camera size={32} className="opacity-50" />;
    if (file.type === "application/pdf") return <FileText size={48} className="text-red-500 animate-bounce" />;
    const isXlsx = file.name.endsWith(".xlsx") || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (isXlsx) return <Table size={48} className="text-emerald-500 animate-bounce" />;
    return <FileImage size={40} className="text-primary" />;
  };

  const getProcessingTitle = () => {
    if (file?.type === "application/pdf") return "Gemini scanning PDF Document...";
    return "Gemini OCR Engine Extracting Items...";
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in font-sans">
      
      {/* Header Banner */}
      <div className="flex justify-between items-center pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl font-black font-display tracking-tight text-foreground flex items-center gap-2">
            <Files className="text-primary" /> Invoice & Bill Scanner
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Ingest invoice photos via Gemini OCR, upload PDFs natively, or import structured spreadsheet data directly.
          </p>
        </div>
      </div>

      {step === "capture" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left panel: Upload controls */}
          <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-display text-foreground">Select Ingestion Method</h2>
              
              {/* Informative visual paths */}
              <div className="grid grid-cols-2 gap-2 pb-2">
                <div className="bg-muted/10 border border-border p-3 rounded-xl text-center space-y-1">
                  <span className="font-bold text-foreground text-xs block font-sans">Photo / Scan PDF</span>
                  <span className="text-[10px] text-muted-foreground block font-sans">AI extraction via Gemini</span>
                </div>
                <div className="bg-muted/10 border border-border p-3 rounded-xl text-center space-y-1">
                  <span className="font-bold text-foreground text-xs block font-sans">Spreadsheet (.xlsx)</span>
                  <span className="text-[10px] text-muted-foreground block font-sans">Local direct spreadsheet import</span>
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-muted/10 hover:bg-muted/20 transition-colors flex flex-col items-center justify-center gap-4 relative">
                {getSourceIcon()}
                <div className="text-xs text-muted-foreground font-sans">
                  <label className="text-primary font-bold hover:underline cursor-pointer">
                    Click to select file
                    <input 
                      type="file" 
                      accept="image/*,application/pdf,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  <p className="mt-2 text-[10px] leading-relaxed">
                    Images/Excel (up to 5MB) • PDF (up to 15MB)
                  </p>
                </div>
              </div>
            </div>

            {file && (
              <button
                onClick={handleOcrProcess}
                disabled={ocrMutation.isPending}
                className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 shadow-card cursor-pointer transition-all"
              >
                {(file.name.endsWith(".xlsx") || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ? (
                  <>
                    <Table size={16} /> Parse Spreadsheet
                  </>
                ) : (
                  <>
                    <Camera size={16} /> Scan with Gemini AI
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right panel: Preview container */}
          <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card flex items-center justify-center min-h-[300px] overflow-hidden relative">
            {previewUrl === "pdf" ? (
              <div className="text-center space-y-2">
                <FileText size={80} className="text-red-500 mx-auto" />
                <p className="text-sm font-bold text-foreground font-sans">{file?.name}</p>
                <p className="text-xs text-muted-foreground font-sans">PDF Document Ready for Gemini API Ingestion</p>
              </div>
            ) : previewUrl === "excel" ? (
              <div className="text-center space-y-2">
                <Table size={80} className="text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-foreground font-sans">{file?.name}</p>
                <p className="text-xs text-muted-foreground font-sans">Excel Spreadsheet Ready for Direct Ingestion</p>
              </div>
            ) : previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Receipt Scan Preview" 
                className="max-h-[350px] object-contain rounded-xl border border-border shadow-inner"
              />
            ) : (
              <div className="text-center text-muted-foreground text-sm font-sans flex flex-col items-center gap-2">
                <Camera size={32} className="opacity-50" />
                <span>Uploaded file preview will display here</span>
              </div>
            )}
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="bg-card border border-card-border rounded-3xl p-10 shadow-card text-center flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Camera className="absolute inset-0 m-auto text-primary animate-pulse" size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-foreground">{getProcessingTitle()}</h2>
            <p className="text-sm text-primary font-medium font-sans animate-pulse">
              {stages[loadingStage]}
            </p>
          </div>
        </div>
      )}

      {step === "mapping" && (
        <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
              <Map className="text-primary" /> Excel Column Mapper
            </h2>
            <button 
              onClick={() => setStep("capture")} 
              className="p-2 hover:bg-muted rounded-full text-muted-foreground cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-4 rounded-2xl text-xs space-y-1">
            <span className="font-bold block font-sans">We couldn't automatically match the column headers.</span>
            <p className="font-sans">Please select the matching spreadsheet column for each key invoice field below.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="font-bold text-muted-foreground font-sans block mb-1">Product Description / Name *</label>
              <select
                value={selectedNameCol}
                onChange={(e) => setSelectedNameCol(e.target.value)}
                className="w-full bg-muted/20 border border-border p-3 rounded-xl text-foreground font-sans focus:outline-none"
              >
                <option value="">-- Choose column --</option>
                {excelHeaders.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground font-sans block mb-1">Quantity (Qty) Column</label>
              <select
                value={selectedQtyCol}
                onChange={(e) => setSelectedQtyCol(e.target.value)}
                className="w-full bg-muted/20 border border-border p-3 rounded-xl text-foreground font-sans focus:outline-none"
              >
                <option value="">-- Default to 1 --</option>
                {excelHeaders.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground font-sans block mb-1">Price Column</label>
              <select
                value={selectedPriceCol}
                onChange={(e) => setSelectedPriceCol(e.target.value)}
                className="w-full bg-muted/20 border border-border p-3 rounded-xl text-foreground font-sans focus:outline-none"
              >
                <option value="">-- Default to 0.00 --</option>
                {excelHeaders.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Simple sheet preview table */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider font-sans">File Preview (First 3 rows)</h3>
            <div className="border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    {excelHeaders.map((h, i) => (
                      <th key={i} className="p-2 border-r border-border text-left font-bold text-muted-foreground">{h || `Column ${i+1}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelRows.slice(0, 3).map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-border hover:bg-muted/10">
                      {excelHeaders.map((_, cIdx) => (
                        <td key={cIdx} className="p-2 border-r border-border text-muted-foreground font-sans">{row[cIdx] !== undefined ? String(row[cIdx]) : ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={() => setStep("capture")}
              className="px-5 py-2.5 bg-card border-2 border-border text-foreground hover:bg-muted font-bold rounded-xl transition-colors cursor-pointer text-xs"
            >
              Cancel Import
            </button>
            <button
              onClick={handleConfirmMapping}
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:opacity-95 font-bold rounded-xl flex items-center gap-1.5 shadow-card cursor-pointer text-xs"
            >
              <Check size={14} /> Import Items
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
              <FileCheck className="text-primary" /> Review Ingested Details
            </h2>
            <button 
              onClick={() => setStep("capture")} 
              className="p-2 hover:bg-muted rounded-full text-muted-foreground cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Core Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs uppercase font-bold text-muted-foreground font-sans block mb-1">Vendor / Source</label>
              <div className="flex items-center gap-2 bg-muted/20 border border-border p-3 rounded-xl">
                <Building size={16} className="text-muted-foreground" />
                <input 
                  type="text" 
                  value={vendorName} 
                  onChange={(e) => setVendorName(e.target.value)}
                  className="bg-transparent border-none text-sm text-foreground focus:outline-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-muted-foreground font-sans block mb-1">Billing Date</label>
              <div className="flex items-center gap-2 bg-muted/20 border border-border p-3 rounded-xl">
                <Calendar size={16} className="text-muted-foreground" />
                <input 
                  type="date" 
                  value={invoiceDate} 
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="bg-transparent border-none text-sm text-foreground focus:outline-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-muted-foreground font-sans block mb-1">Customer Association</label>
              <div className="flex items-center gap-2 bg-muted/20 border border-border p-3 rounded-xl">
                <Building size={16} className="text-muted-foreground" />
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setSelectedCustomerId("");
                    } else if (!isNaN(Number(val))) {
                      setSelectedCustomerId(Number(val));
                    } else {
                      setSelectedCustomerId(val);
                    }
                  }}
                  className="bg-transparent border-none text-sm text-foreground focus:outline-none w-full font-sans"
                >
                  <option value="">-- Choose Customer --</option>
                  <option value="walk-in">Walk-in Customer (Default)</option>
                  <option value="online">Online Order Customer (Default)</option>
                  <option value="regular">Regular Client (Default)</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email || c.phone || "No details"})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Line items list */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider font-sans">Line Items</h3>
              <button 
                onClick={handleAddField}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border text-left">
                    <th className="p-3 font-semibold text-muted-foreground">Product Description</th>
                    <th className="p-3 font-semibold text-muted-foreground w-24 text-center">Qty</th>
                    <th className="p-3 font-semibold text-muted-foreground w-32 text-right">Unit Price</th>
                    <th className="p-3 font-semibold text-muted-foreground w-32 text-right">Total Price</th>
                    <th className="p-3 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleFieldChange(item.id!, "name", e.target.value)}
                          className="bg-transparent border-none text-sm font-semibold text-foreground focus:outline-none w-full"
                          placeholder="e.g. Sonamasuri Rice"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          onChange={(e) => handleFieldChange(item.id!, "quantity", parseInt(e.target.value) || 1)}
                          className="bg-transparent border-none text-sm text-center font-bold text-foreground focus:outline-none w-full"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleFieldChange(item.id!, "price", parseFloat(e.target.value) || 0)}
                          className="bg-transparent border-none text-sm text-right font-bold text-foreground focus:outline-none w-full"
                        />
                      </td>
                      <td className="p-3 text-right font-bold text-foreground">
                        Rs. {(item.quantity * item.price).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleRemoveField(item.id!)}
                          className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing aggregates */}
          <div className="flex flex-col md:flex-row md:justify-end gap-4 border-t border-border pt-6">
            <div className="w-full md:w-80 space-y-3 font-sans">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-bold text-foreground">Rs. {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Tax Amount:</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={taxAmount} 
                  onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                  className="bg-muted/20 border border-border px-2.5 py-1 rounded-lg text-right font-bold w-24 text-sm focus:outline-none"
                />
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Discount Amount:</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={discountAmount} 
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="bg-muted/20 border border-border px-2.5 py-1 rounded-lg text-right font-bold w-24 text-sm focus:outline-none"
                />
              </div>
              <div className="flex justify-between text-base font-black border-t border-dashed border-border pt-3">
                <span>Total Amount:</span>
                <span className="text-primary">Rs. {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Form action triggers */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={() => setStep("capture")}
              className="px-5 py-2.5 bg-card border-2 border-border text-foreground hover:bg-muted font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel Scan
            </button>
            <button
              onClick={handleConfirmSubmit}
              disabled={
                createOrderMutation.isPending || 
                createInvoiceMutation.isPending || 
                createProductMutation.isPending
              }
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:opacity-95 font-bold rounded-xl flex items-center gap-1.5 shadow-card cursor-pointer"
            >
              {(createOrderMutation.isPending || createInvoiceMutation.isPending) ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Check size={16} /> Confirm & Log Transaction
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="bg-card border border-card-border rounded-3xl p-10 shadow-card text-center flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shadow-lg">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-foreground">Transaction Logged Successfully</h2>
            <p className="text-sm text-muted-foreground font-sans">
              Invoice items matched against catalog, client order generated, and billing records logged.
            </p>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setPreviewUrl(null);
              setStep("capture");
            }}
            className="px-6 py-3 bg-primary hover:opacity-95 text-primary-foreground font-bold rounded-xl shadow-card transition-all cursor-pointer"
          >
            Scan Another Document
          </button>
        </div>
      )}
    </div>
  );
}
