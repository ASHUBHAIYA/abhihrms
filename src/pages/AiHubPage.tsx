import React, { useState, useRef, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';
import { ModuleGuard } from '../components/common/ModuleGuard';
import { 
  Sparkles, 
  Brain, 
  Send, 
  Bot, 
  ShieldCheck, 
  FileText, 
  BookOpen, 
  Copy, 
  Check, 
  RefreshCw, 
  Plus, 
  X, 
  Briefcase, 
  Award, 
  Layers, 
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Database,
  Search,
  ChevronRight
} from 'lucide-react';

export const AiHubPage: React.FC = () => {
  return (
    <ModuleGuard module="ai_hub">
      <AiHubContent />
    </ModuleGuard>
  );
};

interface PolicyDocument {
  id: string;
  name: string;
  size: string;
  chunks: number;
  lastIndexed: string;
  category: string;
  status: 'indexed' | 'indexing';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  citation?: {
    documentName: string;
    section: string;
    page: number;
    clause: string;
  };
}

const INITIAL_DOCS: PolicyDocument[] = [
  {
    id: 'doc-handbook',
    name: 'Employee_Handbook_2026.pdf',
    size: '1.4 MB',
    chunks: 48,
    lastIndexed: '2026-08-15',
    category: 'General Governance & Conduct',
    status: 'indexed'
  },
  {
    id: 'doc-insurance',
    name: 'Medical_Insurance_Policy.pdf',
    size: '820 KB',
    chunks: 24,
    lastIndexed: '2026-08-20',
    category: 'Benefits & Health Care',
    status: 'indexed'
  },
  {
    id: 'doc-travel',
    name: 'Travel_Expense_SOP.pdf',
    size: '450 KB',
    chunks: 16,
    lastIndexed: '2026-09-01',
    category: 'Finance & Reimbursements',
    status: 'indexed'
  },
  {
    id: 'doc-remote',
    name: 'IT_Security_and_Remote_Work_SOP.pdf',
    size: '620 KB',
    chunks: 20,
    lastIndexed: '2026-09-10',
    category: 'IT & Hardware Security',
    status: 'indexed'
  }
];

const PROMPT_SUGGESTIONS = [
  {
    label: 'Leave Carry Forward',
    query: 'Can I carry forward unused casual leaves to next year?',
    response: `Under the **${new Date().getFullYear()} Annual Leave Policy**, employees may carry forward a maximum of **5 accrued and unused Paid Time Off (PTO) / Casual Leave days** into the subsequent calendar year.\n\nKey Guidelines:\n• **Expiry Window:** Carried-over leaves must be utilized within the first **Q1 (by March 31)** or they lapse automatically.\n• **Encashment:** Casual leaves are non-encashable; only unused privilege earned leaves upon separation qualify for encashment.\n• **Sick Leave:** Sick leave balances reset annually and do not carry over.`,
    citation: {
      documentName: 'Employee_Handbook_2026.pdf',
      section: 'Section 4.2 (Leave Accrual & Carry Forward)',
      page: 18,
      clause: 'Clause 4.2.3 — Maximum 5 days carry-over with Q1 utilization mandate'
    }
  },
  {
    label: 'Probation Notice Period',
    query: 'What is the notice period during my probation?',
    response: `During the standard **90-day probationary evaluation period**, either party may terminate employment with a **15 calendar days written notice** (or salary payout in lieu of notice).\n\nPost-Confirmation:\n• Once formal confirmation is completed, standard notice shifts to **60 calendar days** for full-time engineering and operations staff, or **90 calendar days** for Directors and Officers.`,
    citation: {
      documentName: 'Employee_Handbook_2026.pdf',
      section: 'Section 2.4 (Probationary Evaluation & Separation Terms)',
      page: 9,
      clause: 'Clause 2.4.1 — 15 days notice during probation period'
    }
  },
  {
    label: 'Dinner Reimbursement Limit',
    query: 'What is the daily dinner reimbursement limit during client travel?',
    response: `For approved business travel involving client engagements, meals are reimbursed under the **Tier-1 / Tier-2 City Travel Schedule**:\n\n• **Dinner Limit:** Up to **$75.00 USD (or equivalent local currency)** per person for evening meals.\n• **Itemized Receipts:** Itemized digital receipts must be submitted via the Expense Portal within **14 calendar days**.\n• **Alcohol Policy:** Moderate meal-accompanying beverages are reimbursable up to 25% of total dinner invoice.`,
    citation: {
      documentName: 'Travel_Expense_SOP.pdf',
      section: 'Section 3.1 (Per Diem Allowances & Business Meals)',
      page: 6,
      clause: 'Clause 3.1.4 — $75 USD dinner cap with itemized merchant tax invoice'
    }
  },
  {
    label: 'Home Office Ergonomics',
    query: 'What is the policy for home office ergonomics reimbursement?',
    response: `Full-time remote and hybrid team members are eligible for a **one-time $500 USD Home Office Setup Stipend** following successful onboarding.\n\nApproved Items Include:\n• Ergonomic desk chairs, standing desk risers, and monitor arms.\n• External 4K monitors, webcams, and noise-cancelling headsets.\n• Invoices must be submitted under "Hardware & Ergonomics" category within 60 days of purchase.`,
    citation: {
      documentName: 'IT_Security_and_Remote_Work_SOP.pdf',
      section: 'Section 5.3 (Remote Workspace Ergonomics & Equipment Allowance)',
      page: 12,
      clause: 'Clause 5.3.1 — $500 one-time setup grant for approved ergonomic gear'
    }
  },
  {
    label: 'Parental Leave Benefits',
    query: 'How do parental leave benefits apply to secondary caregivers?',
    response: `We provide comprehensive family support for all new parents (birth, adoption, or surrogacy):\n\n• **Primary Caregiver:** 16 weeks of 100% paid leave.\n• **Secondary Caregiver:** 4 weeks of 100% paid parental leave, flexible to be taken consecutively or split across the first 12 months.\n• **Return-to-Work Flexibility:** 80% reduced schedule during the first 2 weeks back with 100% compensation.`,
    citation: {
      documentName: 'Employee_Handbook_2026.pdf',
      section: 'Section 6.1 (Parental & Caregiver Support Program)',
      page: 27,
      clause: 'Clause 6.1.2 — 4 weeks 100% paid secondary caregiver leave within 12 months'
    }
  }
];

const AiHubContent: React.FC = () => {
  const { currentTenant, employees, createJobRequisition, showToast } = useTenant();

  // Top sub-tabs: Policy Chatbot vs JD Drafter vs 360 Review Drafter
  const [activeTab, setActiveTab] = useState<'policy_bot' | 'jd_gen' | 'review_gen'>('policy_bot');

  // Token attribution usage
  const [aiTokensUsed, setAiTokensUsed] = useState<number>(142500);

  // Policy Documents State
  const [policyDocs, setPolicyDocs] = useState<PolicyDocument[]>(INITIAL_DOCS);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState<boolean>(false);
  const [newDocName, setNewDocName] = useState<string>('');
  const [newDocCategory, setNewDocCategory] = useState<string>('General Governance & Conduct');

  // Policy Chatbot State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `Hello! I am your AI HR Policy Assistant for **${currentTenant.name}**. I am grounded strictly in your verified company handbooks, travel SOPs, and benefit policies. Ask me any compliance or policy question below.`,
      timestamp: 'Just now',
      citation: {
        documentName: 'Employee_Handbook_2026.pdf',
        section: 'Section 1.1 (Corporate Governance & Purpose)',
        page: 2,
        clause: 'Grounded in tenant document corpus'
      }
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle Ask Question
  const handleSendMessage = (textToSend?: string) => {
    const question = (textToSend || inputText).trim();
    if (!question) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simulate RAG vector match and Gemini 2.5 Flash stream
    setTimeout(() => {
      // Find matching preset or generate smart context response
      const matched = PROMPT_SUGGESTIONS.find(p => 
        p.query.toLowerCase() === question.toLowerCase() ||
        question.toLowerCase().includes(p.label.toLowerCase()) ||
        p.label.toLowerCase().includes(question.toLowerCase())
      );

      let botResponseText = '';
      let botCitation = {
        documentName: 'Employee_Handbook_2026.pdf',
        section: 'Section 4.1 (Standard Operating Guidelines)',
        page: 14,
        clause: 'General enterprise governance and compliance policy'
      };

      if (matched) {
        botResponseText = matched.response;
        botCitation = matched.citation;
      } else {
        botResponseText = `Based on the **${currentTenant.name} Corporate Governance & Handbook**: \n\n• For inquiries regarding **"${question}"**, requests must be submitted through your department head and HR Business Partner.\n• Requests are typically acknowledged within **2 business days** with standard SLA.\n• Please ensure compliance with our security and operational standards.`;
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citation: botCitation
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      setAiTokensUsed(prev => prev + 620);
    }, 900);
  };

  const handleCopyCitation = (msgId: string, citationText: string) => {
    navigator.clipboard.writeText(citationText);
    setCopiedCitationId(msgId);
    showToast('Citation Copied', 'Document reference copied to clipboard.', 'success');
    setTimeout(() => setCopiedCitationId(null), 2000);
  };

  const handleIndexNewDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    const formattedName = newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`;
    const newDoc: PolicyDocument = {
      id: `doc-${Date.now()}`,
      name: formattedName,
      size: '520 KB',
      chunks: 18,
      lastIndexed: new Date().toISOString().split('T')[0],
      category: newDocCategory,
      status: 'indexed'
    };

    setPolicyDocs(prev => [...prev, newDoc]);
    setIsUploadDocModalOpen(false);
    setNewDocName('');
    showToast('Document Indexed', `${formattedName} vectorized into strict policy knowledge base.`, 'success');
  };

  // ==========================================
  // TAB 2: JD GENERATOR STATE & LOGIC
  // ==========================================
  const [jdRole, setJdRole] = useState('Staff Distributed Systems Engineer');
  const [jdSeniority, setJdSeniority] = useState('Staff / Principal');
  const [jdDepartment, setJdDepartment] = useState('Engineering');
  const [jdSkills, setJdSkills] = useState('Go, Kubernetes, Distributed Consensus, High-Throughput gRPC, Postgres');
  const [isGeneratingJd, setIsGeneratingJd] = useState(false);
  const [generatedJd, setGeneratedJd] = useState<string | null>(null);
  const [copiedJd, setCopiedJd] = useState(false);

  const handleGenerateJd = () => {
    setIsGeneratingJd(true);
    setTimeout(() => {
      const output = `# ${jdRole} (${jdSeniority})
**Department:** ${jdDepartment} · **Location:** ${currentTenant.headquarters} (Hybrid / Remote Option)
**Organization:** ${currentTenant.name}

## Position Overview
We are looking for a high-caliber ${jdRole} to join our high-growth ${jdDepartment} team at ${currentTenant.name}. In this high-impact role, you will architect, scale, and maintain mission-critical infrastructure handling core enterprise workloads.

## Key Responsibilities
- Architect and execute fault-tolerant architectures utilizing ${jdSkills}.
- Partner cross-functionally with Product, Operations, and Security to define technical standards.
- Lead peer design reviews, mentor mid-level team members, and drive operational excellence.
- Ensure 99.99% system availability through automated testing, chaos engineering, and telemetry observability.

## Candidate Qualifications
- 6+ years of demonstrated excellence with ${jdSkills}.
- Proven track record designing scalable multi-tenant SaaS platforms.
- Deep commitment to inclusive team mentorship, code quality, and engineering velocity.

## Total Rewards & Benefits
- Competitive Base Salary + Significant Equity Grant
- 100% Employer-Covered Health, Vision & Dental Coverage
- Unlimited Flexible Paid Time Off & 16 Weeks Parental Leave
- $1,500 Annual Learning & Professional Development Stipend`;

      setGeneratedJd(output);
      setIsGeneratingJd(false);
      setAiTokensUsed(prev => prev + 1240);
      showToast('AI Generation Complete', 'Job Description drafted successfully.', 'success');
    }, 850);
  };

  const handlePublishToAts = () => {
    if (!generatedJd) return;
    createJobRequisition({
      title: jdRole,
      department: jdDepartment,
      location: `${currentTenant.headquarters} / Hybrid`,
      type: 'Full-Time',
      status: 'open',
      hiringManager: 'VP Talent',
      salaryRange: '$175,000 - $210,000',
      description: generatedJd
    });
    showToast('Published to ATS', `Created open requisition for "${jdRole}"`, 'success');
  };

  // ==========================================
  // TAB 3: 360 REVIEW GENERATOR STATE & LOGIC
  // ==========================================
  const [selectedEmpReview, setSelectedEmpReview] = useState(employees[0]?.id || 'EMP-1001');
  const [reviewRating, setReviewRating] = useState('Exceeds Expectations (4.8 / 5.0)');
  const [reviewWins, setReviewWins] = useState('Spearheaded multi-tenant cloud migration with zero downtime; mentored 3 junior engineers.');
  const [reviewGrowth, setReviewGrowth] = useState('Delegate operational incident escalations to tech leads to focus on 12-month architecture roadmap.');
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [generatedReview, setGeneratedReview] = useState<string | null>(null);
  const [copiedReview, setCopiedReview] = useState(false);

  const targetEmp = employees.find(e => e.id === selectedEmpReview) || employees[0];

  const handleGenerateReview = () => {
    setIsGeneratingReview(true);
    setTimeout(() => {
      const output = `### Annual Performance Appraisal: ${targetEmp?.firstName} ${targetEmp?.lastName}
**Role:** ${targetEmp?.role} · **Department:** ${targetEmp?.department}
**Evaluator:** People Operations & Direct Management · **Period:** FY 2026 Annual Cycle
**Overall Rating:** ${reviewRating}

---

#### 1. Core Competency & Key Deliverables
During this performance period, ${targetEmp?.firstName} demonstrated exceptional domain mastery and consistently delivered high-impact business outcomes. Specifically:
- ${reviewWins}
- Championed cross-functional alignment between engineering and product deliverables, ensuring on-time release milestones.

#### 2. Leadership, Culture & Mentorship
${targetEmp?.firstName} serves as an exemplary pillar for our cultural values. They cultivate psychological safety, provide thoughtful architectural reviews, and actively sponsor junior teammates to uplevel collective execution.

#### 3. Strategic Development & Growth Vectors
To continue accelerating into next-level executive leadership:
- Focus on: ${reviewGrowth}
- Standardize high-level design documents (HLDs) earlier in the discovery cycle.

#### 4. Compensation & Advancement Recommendation
Given ${targetEmp?.firstName}'s track record of sustained high velocity and organizational impact, management recommends consideration for promotional advancement and merit-tier bonus compensation.`;

      setGeneratedReview(output);
      setIsGeneratingReview(false);
      setAiTokensUsed(prev => prev + 1480);
      showToast('Review Generated', `360 Appraisal drafted for ${targetEmp?.firstName} ${targetEmp?.lastName}`, 'success');
    }, 850);
  };

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            AI HR Tools
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Policy assistant, job description generator, and performance review tools.
          </p>
        </div>

        {/* Tenant AI Usage & Cost Attribution Metric Pill */}
        <div className="flex items-center gap-3 bg-slate-50/90 border border-slate-200/80 rounded-xl px-3.5 py-2.5 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-cyan-600" />
                Monthly AI Quota:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {aiTokensUsed.toLocaleString()} / 500,000 <span className="font-normal text-slate-500">Tokens</span>
              </span>
            </div>
            <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (aiTokensUsed / 500000) * 100)}%` }}
              />
            </div>
          </div>
          <div className="pl-3 border-l border-slate-200 text-right">
            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
              $0.075 / 1M tokens
            </div>
            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
              Gemini 2.5 Flash
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('policy_bot')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'policy_bot'
              ? 'bg-white text-cyan-700 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Bot className="w-4 h-4 text-cyan-600" />
          AI HR Policy Assistant (Strict RAG)
          <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.2 rounded-full font-mono">
            RAG Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('jd_gen')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'jd_gen'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Briefcase className="w-4 h-4 text-blue-600" />
          Job Description Drafter
        </button>

        <button
          onClick={() => setActiveTab('review_gen')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'review_gen'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Award className="w-4 h-4 text-indigo-600" />
          360° Performance Appraisal Drafter
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI HR POLICY ASSISTANT (STRICT RAG)                                */}
      {/* ========================================================================= */}
      {activeTab === 'policy_bot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Indexed Policy Sources & Knowledge Base (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Context & Strict RAG Status Card */}
            <div className="p-4 bg-gradient-to-br from-cyan-50/70 to-indigo-50/70 border border-cyan-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                  Active Tenant Context
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Strict Policy RAG Active
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {currentTenant.name} Policy Copilot
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Queries are matched against the vectorized corpus of official company handbooks with verifiable clause citations.
                </p>
              </div>
            </div>

            {/* Indexed Policy Sources Card */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-700" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Uploaded Policy Sources ({policyDocs.length})
                  </h4>
                </div>
                <button
                  onClick={() => setIsUploadDocModalOpen(true)}
                  className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Index Doc
                </button>
              </div>

              <div className="space-y-2">
                {policyDocs.map((doc) => (
                  <div key={doc.id} className="p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-colors space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-900 truncate font-mono">
                          {doc.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                        {doc.chunks} Chunks
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{doc.category}</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Prompt Suggestion Chips */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
                  Quick Policy Questions:
                </span>
                <span className="text-[10px] text-slate-400">Click to ask</span>
              </div>

              <div className="space-y-1.5">
                {PROMPT_SUGGESTIONS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(item.query)}
                    className="w-full text-left p-2 bg-slate-50 hover:bg-cyan-50/70 hover:border-cyan-300 border border-slate-200 rounded-lg transition-all text-[11px] text-slate-700 hover:text-cyan-900 font-medium flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">"{item.query}"</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Chat Interface (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-[650px] overflow-hidden">
            {/* Chat Top Bar */}
            <div className="p-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{currentTenant.name} HR Policy Assistant</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Grounded RAG Pipeline · Zero Hallucination Mode
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMessages([messages[0]])}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                Clear Chat
              </button>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[90%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar Icon */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-cyan-600 text-white'
                  }`}>
                    {msg.sender === 'user' ? 'Me' : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-2">
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                    }`}>
                      <div className="whitespace-pre-line">
                        {msg.text}
                      </div>
                    </div>

                    {/* Source Citation Badge for Assistant Messages */}
                    {msg.sender === 'bot' && msg.citation && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-700 flex items-center gap-1 font-mono text-[10px]">
                            <BookOpen className="w-3 h-3 text-cyan-600" />
                            Source: {msg.citation.documentName}
                          </span>
                          <button
                            onClick={() => handleCopyCitation(msg.id, `Source: ${msg.citation?.documentName}, ${msg.citation?.section}`)}
                            className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                          >
                            {copiedCitationId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy Citation
                              </>
                            )}
                          </button>
                        </div>
                        <div className="text-slate-600 font-medium">
                          {msg.citation.section} (Page {msg.citation.page})
                        </div>
                        <div className="text-slate-500 text-[10px] italic">
                          {msg.citation.clause}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Bot Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                  <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-bounce delay-300" />
                    <span className="ml-2 font-mono text-[10px] text-cyan-800">
                      Scanning policy embeddings & verifying clauses...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3.5 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask any policy question (e.g. travel per diems, parental leave, probation notice)..."
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI JOB DESCRIPTION SPEC GENERATOR                                 */}
      {/* ========================================================================= */}
      {activeTab === 'jd_gen' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Parameters (5 cols) */}
          <div className="lg:col-span-5 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Job Specification Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Role Title</label>
                <input
                  type="text"
                  value={jdRole}
                  onChange={e => setJdRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seniority Level</label>
                  <select
                    value={jdSeniority}
                    onChange={e => setJdSeniority(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option>Junior / Associate</option>
                    <option>Mid-Level</option>
                    <option>Senior</option>
                    <option>Staff / Principal</option>
                    <option>Director / VP</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={jdDepartment}
                    onChange={e => setJdDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option>Engineering</option>
                    <option>Product & Design</option>
                    <option>People & Culture</option>
                    <option>Sales & GTM</option>
                    <option>Finance & Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Core Tech Stack / Competencies</label>
                <textarea
                  rows={3}
                  value={jdSkills}
                  onChange={e => setJdSkills(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium font-mono text-[11px]"
                />
              </div>

              <button
                onClick={handleGenerateJd}
                disabled={isGeneratingJd}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingJd ? 'Drafting Job Spec...' : 'Generate Compliant Job Spec'}
              </button>
            </div>
          </div>

          {/* Generated Specification Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Generated Requisition Spec
              </h4>
              {generatedJd && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedJd);
                      setCopiedJd(true);
                      setTimeout(() => setCopiedJd(false), 2000);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border rounded-lg flex items-center gap-1"
                  >
                    {copiedJd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedJd ? 'Copied' : 'Copy Spec'}
                  </button>
                  <button
                    onClick={handlePublishToAts}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-2xs"
                  >
                    Publish to ATS
                  </button>
                </div>
              )}
            </div>

            {generatedJd ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-[480px] overflow-y-auto">
                {generatedJd}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs space-y-2">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Configure role parameters and click Generate to produce a structured JD.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 360 PERFORMANCE REVIEW GENERATOR                                  */}
      {/* ========================================================================= */}
      {activeTab === 'review_gen' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Appraisal Inputs (5 cols) */}
          <div className="lg:col-span-5 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Appraisal Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Employee</label>
                <select
                  value={selectedEmpReview}
                  onChange={e => setSelectedEmpReview(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} — {emp.role} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Performance Tier</label>
                <select
                  value={reviewRating}
                  onChange={e => setReviewRating(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option>Exceeds Expectations (4.8 / 5.0)</option>
                  <option>Consistently Meets Expectations (4.0 / 5.0)</option>
                  <option>Needs Structured Coaching (3.0 / 5.0)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Wins & Milestones Achieved</label>
                <textarea
                  rows={3}
                  value={reviewWins}
                  onChange={e => setReviewWins(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Growth Vectors & Developmental Goals</label>
                <textarea
                  rows={2}
                  value={reviewGrowth}
                  onChange={e => setReviewGrowth(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-[11px]"
                />
              </div>

              <button
                onClick={handleGenerateReview}
                disabled={isGeneratingReview}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingReview ? 'Synthesizing Appraisal...' : 'Draft 360° Appraisal'}
              </button>
            </div>
          </div>

          {/* Generated Review Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Synthesized 360° Appraisal Preview
              </h4>
              {generatedReview && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedReview);
                    setCopiedReview(true);
                    setTimeout(() => setCopiedReview(false), 2000);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border rounded-lg flex items-center gap-1"
                >
                  {copiedReview ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedReview ? 'Copied' : 'Copy Appraisal'}
                </button>
              )}
            </div>

            {generatedReview ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-[480px] overflow-y-auto">
                {generatedReview}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs space-y-2">
                <Award className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Select employee credentials and click Draft to generate an objective performance review.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INDEX NEW POLICY DOCUMENT MODAL                                           */}
      {/* ========================================================================= */}
      {isUploadDocModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">Index New Policy Document</h3>
              </div>
              <button onClick={() => setIsUploadDocModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIndexNewDocument} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote_Work_Tax_Guidelines_2026.pdf"
                  value={newDocName}
                  onChange={e => setNewDocName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Policy Category</label>
                <select
                  value={newDocCategory}
                  onChange={e => setNewDocCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                >
                  <option>General Governance & Conduct</option>
                  <option>Benefits & Health Care</option>
                  <option>Finance & Reimbursements</option>
                  <option>IT & Hardware Security</option>
                  <option>Compliance & Workplace Safety</option>
                </select>
              </div>

              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-[11px] text-cyan-900">
                Documents will be parsed into semantic chunk vectors and strictly verified by Gemini 2.5 Flash for grounded citations.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadDocModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Vectorize & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
