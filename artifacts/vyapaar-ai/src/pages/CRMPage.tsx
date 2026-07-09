import { useState } from "react";
import {
  useListCustomers,
  useCreateCustomer,
  useListLeads,
  useCreateLead,
  useUpdateLeadStatus,
  useListInquiries,
  useListTasks,
  useCreateTask,
} from "@workspace/api-client-react";
import {
  Users,
  Target,
  HelpCircle,
  CheckSquare,
  Plus,
  Loader2,
  Trash2,
  Calendar,
  User,
  Phone,
  Mail,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "../components/ui/empty";
import { SkeletonCard } from "../components/SkeletonCard";


export default function CRMPage() {
  const { toast } = useToast();
  const { currentOrgId: orgId } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<"leads" | "customers" | "inquiries" | "tasks">("leads");
  
  // Modals / Drawers State
  const [showCustModal, setShowCustModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Form states
  const [custForm, setCustForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [leadForm, setLeadForm] = useState({ customerId: "", source: "website", notes: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", dueDate: "" });

  // API Hooks
  const { data: customers = [], isLoading: loadingCusts, refetch: refetchCusts } = useListCustomers(
    { orgId },
    { query: { queryKey: ["customers", orgId] } as any }
  );
  
  const { data: leads = [], isLoading: loadingLeads, refetch: refetchLeads } = useListLeads(
    { orgId },
    { query: { queryKey: ["leads", orgId] } as any }
  );

  const { data: inquiries = [], isLoading: loadingInquiries } = useListInquiries(
    { orgId },
    { query: { queryKey: ["inquiries", orgId] } as any }
  );

  const { data: tasks = [], isLoading: loadingTasks, refetch: refetchTasks } = useListTasks(
    { orgId },
    { query: { queryKey: ["tasks", orgId] } as any }
  );

  // Mutation Hooks
  const createCustomerMutation = useCreateCustomer();
  const createLeadMutation = useCreateLead();
  const updateLeadStatusMutation = useUpdateLeadStatus();
  const createTaskMutation = useCreateTask();

  // Handlers
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name) return;
    try {
      await createCustomerMutation.mutateAsync({
        data: {
          orgId,
          name: custForm.name,
          email: custForm.email || undefined,
          phone: custForm.phone || undefined,
          notes: custForm.notes || undefined,
        },
      });
      toast({ title: "Success", description: "Customer created successfully" });
      setCustForm({ name: "", email: "", phone: "", notes: "" });
      setShowCustModal(false);
      refetchCusts();
    } catch (err) {
      toast({ title: "Error", description: "Failed to create customer", variant: "destructive" });
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.customerId) return;
    try {
      await createLeadMutation.mutateAsync({
        data: {
          orgId,
          customerId: parseInt(leadForm.customerId),
          source: leadForm.source,
          status: "new",
          notes: leadForm.notes || undefined,
        },
      });
      toast({ title: "Success", description: "Lead created successfully" });
      setLeadForm({ customerId: "", source: "website", notes: "" });
      setShowLeadModal(false);
      refetchLeads();
    } catch (err) {
      toast({ title: "Error", description: "Failed to create lead", variant: "destructive" });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    try {
      await createTaskMutation.mutateAsync({
        data: {
          orgId,
          title: taskForm.title,
          description: taskForm.description || undefined,
          status: "todo",
          dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
        },
      });
      toast({ title: "Success", description: "Task created successfully" });
      setTaskForm({ title: "", description: "", dueDate: "" });
      setShowTaskModal(false);
      refetchTasks();
    } catch (err) {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (leadId: number, status: string) => {
    try {
      await updateLeadStatusMutation.mutateAsync({
        leadId,
        data: { status },
      });
      toast({ title: "Status Updated", description: `Lead status updated to ${status}` });
      refetchLeads();
    } catch (err) {
      toast({ title: "Error", description: "Failed to update lead status", variant: "destructive" });
    }
  };

  // UI Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "contacted": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "qualified": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "converted": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      default: return "bg-slate-500/10 text-slate-600";
    }
  };

  // Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 20
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight font-display text-foreground">Customer Relationship Management</h1>
          <p className="text-muted-foreground text-sm font-sans">Manage contacts, sales pipelines, and task schedules.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "customers" && (
            <button
              onClick={() => setShowCustModal(true)}
              className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl text-sm flex items-center gap-1.5 shadow-card hover:shadow-raised hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 ease-out-expo cursor-pointer"
            >
              <PlusCircle size={16} /> Add Customer
            </button>
          )}
          {activeTab === "leads" && (
            <button
              onClick={() => setShowLeadModal(true)}
              className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl text-sm flex items-center gap-1.5 shadow-card hover:shadow-raised hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 ease-out-expo cursor-pointer"
            >
              <PlusCircle size={16} /> Create Lead
            </button>
          )}
          {activeTab === "tasks" && (
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl text-sm flex items-center gap-1.5 shadow-card hover:shadow-raised hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 ease-out-expo cursor-pointer"
            >
              <PlusCircle size={16} /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted p-1.5 rounded-2xl border border-border w-fit shadow-card">
        {[
          { id: "leads", label: "Leads Pipeline", icon: Target },
          { id: "customers", label: "Customers", icon: Users },
          { id: "inquiries", label: "Store Inquiries", icon: HelpCircle },
          { id: "tasks", label: "Tasks & Reminders", icon: CheckSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors z-10 font-sans cursor-pointer ${
                isSelected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              {tab.label}
              {isSelected && (
                <motion.div
                  layoutId="crmActiveTab"
                  className="absolute inset-0 bg-background rounded-xl shadow-raised border border-border/80 -z-10"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card min-h-[400px]">
        {activeTab === "leads" && (
          <div>
            {loadingLeads ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {["New", "Contacted", "Qualified", "Converted"].map((status) => (
                  <div key={status} className="bg-muted/40 border border-border/60 p-4 rounded-2xl flex flex-col gap-3 min-h-[300px]">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2 font-sans">{status}</h4>
                    <SkeletonCard className="h-28 w-full" />
                    <SkeletonCard className="h-28 w-full" />
                  </div>
                ))}
              </div>
            ) : leads.length === 0 ? (
              <Empty className="border border-dashed border-border p-12 rounded-3xl bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Target className="text-muted-foreground" size={24} />
                  </EmptyMedia>
                  <EmptyTitle className="font-display font-bold">No active leads</EmptyTitle>
                  <EmptyDescription className="font-sans">
                    No leads yet — they'll show up here once your storefront starts getting inquiries.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {["new", "contacted", "qualified", "converted"].map((columnStatus) => {
                  const filteredLeads = leads.filter((l: any) => l.status === columnStatus);
                  return (
                    <motion.div 
                      key={columnStatus} 
                      variants={itemVariants}
                      className="bg-muted/40 border border-border/60 p-4 rounded-2xl flex flex-col gap-3 min-h-[300px]"
                    >
                      <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between px-1 font-sans">
                        <span>{columnStatus}</span>
                        <span className="bg-card border border-border px-2 py-0.5 rounded-full text-[10px]">{filteredLeads.length}</span>
                      </h4>
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex-1 space-y-2 overflow-y-auto max-h-[400px]"
                      >
                        {filteredLeads.map((lead: any) => {
                          const associatedCustomer = customers.find((c: any) => c.id === lead.customerId);
                          return (
                            <motion.div 
                              key={lead.id} 
                              variants={itemVariants}
                              className="bg-card border border-card-border p-3.5 rounded-xl shadow-card hover:shadow-raised hover:scale-[1.01] transition-all duration-150 ease-out-expo space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <h5 className="font-bold text-sm text-foreground truncate font-display">{associatedCustomer?.name || `Customer #${lead.customerId}`}</h5>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-sans ${getStatusColor(lead.status)}`}>
                                  {lead.source}
                                </span>
                              </div>
                              {lead.notes && <p className="text-xs text-muted-foreground line-clamp-2 font-sans">{lead.notes}</p>}
                              
                              <div className="flex items-center gap-1.5 pt-1.5 border-t border-border mt-2">
                                <select
                                  value={lead.status}
                                  onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                                  className="w-full text-[11px] bg-muted/60 border border-border px-2 py-1 rounded-md outline-none focus:border-primary font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                                >
                                  <option value="new">New</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="qualified">Qualified</option>
                                  <option value="converted">Converted</option>
                                  <option value="lost">Lost</option>
                                </select>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "customers" && (
          <div>
            {loadingCusts ? (
              <div className="space-y-4">
                <div className="flex gap-4 border-b border-border pb-3">
                  <SkeletonCard className="h-4 w-1/4" />
                  <SkeletonCard className="h-4 w-1/4" />
                  <SkeletonCard className="h-4 w-1/4" />
                  <SkeletonCard className="h-4 w-1/4" />
                </div>
                {[1, 2, 3].map((row) => (
                  <div key={row} className="flex gap-4 items-center py-2">
                    <SkeletonCard className="h-10 w-10 rounded-full shrink-0" />
                    <SkeletonCard className="h-6 w-full" />
                  </div>
                ))}
              </div>
            ) : customers.length === 0 ? (
              <Empty className="border border-dashed border-border p-12 rounded-3xl bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users className="text-muted-foreground" size={24} />
                  </EmptyMedia>
                  <EmptyTitle className="font-display font-bold">No customer records yet</EmptyTitle>
                  <EmptyDescription className="font-sans">
                    No customer records yet — they'll show up here once you create list details.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold text-xs uppercase font-sans">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {customers.map((cust: any) => (
                      <motion.tr 
                        key={cust.id} 
                        variants={itemVariants}
                        className="border-b border-border hover:bg-muted/20 transition-colors text-sm"
                      >
                        <td className="py-3.5 px-4 font-bold flex items-center gap-2 font-display">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black font-sans">
                            {cust.name[0]?.toUpperCase()}
                          </div>
                          {cust.name}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground font-sans">{cust.phone || "-"}</td>
                        <td className="py-3.5 px-4 text-muted-foreground font-sans">{cust.email || "-"}</td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-muted-foreground font-sans">{cust.notes || "-"}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setLeadForm({ customerId: String(cust.id), source: "manual", notes: "" });
                              setShowLeadModal(true);
                            }}
                            className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground font-bold rounded-xl border border-secondary-border hover:shadow-raised hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 ease-out-expo cursor-pointer"
                          >
                            Create Lead
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "inquiries" && (
          <div>
            {loadingInquiries ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-muted/30 border border-border p-5 rounded-2xl flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <SkeletonCard className="h-6 w-1/3" />
                      <SkeletonCard className="h-16 w-full" />
                    </div>
                    <SkeletonCard className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : inquiries.length === 0 ? (
              <Empty className="border border-dashed border-border p-12 rounded-3xl bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HelpCircle className="text-muted-foreground" size={24} />
                  </EmptyMedia>
                  <EmptyTitle className="font-display font-bold">No public inquiries</EmptyTitle>
                  <EmptyDescription className="font-sans">
                    No storefront inquiries yet — they'll appear here once prospective clients message your shop.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {inquiries.map((inq: any) => (
                  <motion.div 
                    key={inq.id} 
                    variants={itemVariants}
                    className="bg-card border border-border p-5 rounded-2xl shadow-card hover:shadow-raised hover:scale-[1.01] transition-all duration-150 ease-out-expo flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-base text-foreground font-display">{inq.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-sans ${getStatusColor(inq.status || "new")}`}>{inq.status}</span>
                      </div>
                      {inq.message && <p className="text-sm text-muted-foreground leading-relaxed italic font-sans">"{inq.message}"</p>}
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-border/60 text-xs text-muted-foreground font-sans">
                      {inq.phone && <div className="flex items-center gap-2"><Phone size={12} /> {inq.phone}</div>}
                      {inq.email && <div className="flex items-center gap-2"><Mail size={12} /> {inq.email}</div>}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            {loadingTasks ? (
              <div className="space-y-3 max-w-3xl">
                {[1, 2, 3].map((task) => (
                  <div key={task} className="bg-muted/20 border border-border p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-2/3">
                      <SkeletonCard className="h-5 w-5 rounded shrink-0" />
                      <SkeletonCard className="h-5 w-full" />
                    </div>
                    <SkeletonCard className="h-8 w-24 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <Empty className="border border-dashed border-border p-12 rounded-3xl bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CheckSquare className="text-muted-foreground" size={24} />
                  </EmptyMedia>
                  <EmptyTitle className="font-display font-bold">No tasks scheduled</EmptyTitle>
                  <EmptyDescription className="font-sans">
                    All clear! Create reminders and checklists for your daily business operations.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3 max-w-3xl"
              >
                {tasks.map((task: any) => (
                  <motion.div 
                    key={task.id} 
                    variants={itemVariants}
                    className="bg-card border border-border p-4 rounded-xl shadow-card hover:shadow-raised hover:scale-[1.005] transition-all duration-150 ease-out-expo flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 w-2/3">
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        onChange={() => {
                          toast({ title: "Updated", description: "Task status modified" });
                        }}
                        className="mt-1 w-4.5 h-4.5 rounded text-primary focus:ring-primary border-border cursor-pointer"
                      />
                      <div>
                        <h4 className={`font-bold text-sm font-sans ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </h4>
                        {task.description && <p className="text-xs text-muted-foreground mt-0.5 font-sans">{task.description}</p>}
                      </div>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold bg-background border border-border px-2.5 py-1.5 rounded-lg font-sans">
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      {showCustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-card-border p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4">Add New Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={custForm.name}
                  onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 border border-border bg-muted/20 rounded-xl outline-none focus:border-primary text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Phone</label>
                  <input
                    type="text"
                    value={custForm.phone}
                    onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                    placeholder="+9198765..."
                    className="w-full px-3 py-2 border border-border bg-muted/20 rounded-xl outline-none focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={custForm.email}
                    onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                    placeholder="email@gmail.com"
                    className="w-full px-3 py-2 border border-border bg-muted/20 rounded-xl outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Notes</label>
                <textarea
                  value={custForm.notes}
                  onChange={(e) => setCustForm({ ...custForm, notes: e.target.value })}
                  placeholder="Preferences, addresses, etc."
                  rows={3}
                  className="w-full px-3 py-2 border border-border bg-muted/20 rounded-xl outline-none focus:border-primary text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustModal(false)}
                  className="px-4 py-2 text-sm bg-muted text-muted-foreground hover:bg-muted/80 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCustomerMutation.isPending}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl flex items-center gap-1.5"
                >
                  {createCustomerMutation.isPending && <Loader2 className="animate-spin" size={14} />}
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-card-border p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4">Create Lead</h3>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Select Customer</label>
                <select
                  required
                  value={leadForm.customerId}
                  onChange={(e) => setLeadForm({ ...leadForm, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-border bg-muted/20 rounded-xl outline-none focus:border-primary text-sm cursor-pointer"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Source</label>
                <select
                  value={leadForm.source}
                  onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                  className="w-full px-3 py-2 border border-border bg-muted/20 rounded-xl outline-none focus:border-primary text-sm cursor-pointer"
                >
                  <option value="website">Website</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="referral">Referral</option>
                  <option value="manual">Manual Entry</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Notes / Requirement</label>
                <textarea
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Bulk order inquiries, preferred timings..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border bg-muted/20 rounded-xl outline-none focus:border-primary text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 text-sm bg-muted text-muted-foreground hover:bg-muted/80 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLeadMutation.isPending}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl flex items-center gap-1.5"
                >
                  {createLeadMutation.isPending && <Loader2 className="animate-spin" size={14} />}
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-card-border p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4">Add Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Call Rajesh Kumar about payment"
                  className="w-full px-3 py-2 border border-border bg-muted/20 rounded-xl outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Add details..."
                  rows={2}
                  className="w-full px-3 py-2 border border-border bg-muted/20 rounded-xl outline-none focus:border-primary text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-border bg-muted/20 rounded-xl outline-none focus:border-primary text-sm"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-sm bg-muted text-muted-foreground hover:bg-muted/80 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl flex items-center gap-1.5"
                >
                  {createTaskMutation.isPending && <Loader2 className="animate-spin" size={14} />}
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
