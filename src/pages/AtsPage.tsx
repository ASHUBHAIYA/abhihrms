import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { ModuleGuard } from '../components/common/ModuleGuard';
import { Candidate, JobRequisition } from '../types/hrms';
import { exportToCsv } from '../utils/printUtils';
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Send, 
  Mail, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Star, 
  Zap, 
  Brain, 
  Filter, 
  Clock, 
  Briefcase, 
  DollarSign, 
  Users, 
  Check, 
  Copy,
  Layers,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';

export const AtsPage: React.FC = () => {
  return (
    <ModuleGuard module="ats">
      <AtsContent />
    </ModuleGuard>
  );
};

interface SampleCandidateData {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  experienceYears: number;
  currentCompany: string;
  matchScore: number;
  matchCategory: 'Strong Match' | 'Junior Potential' | 'High Mismatch';
  matchColor: 'emerald' | 'amber' | 'rose';
  verdict: string;
  strengths: string[];
  gaps: string[];
  skills: string[];
  summary: string;
  education: string;
  fileName: string;
}

const SAMPLE_CANDIDATES: SampleCandidateData[] = [
  {
    id: 'cand-alex',
    name: 'Alex Morgan',
    email: 'alex.morgan@techdev.net',
    phone: '+1 (415) 890-2194',
    title: 'Senior Full-Stack Architect',
    experienceYears: 7,
    currentCompany: 'CloudScale Systems',
    matchScore: 92,
    matchCategory: 'Strong Match',
    matchColor: 'emerald',
    verdict: 'Exceptional senior candidate with deep React 19, TypeScript, and microservice architecture experience. Strong alignment with multi-tenant SaaS scaling and PostgreSQL RLS requirements.',
    strengths: [
      '7+ yrs modern React & TypeScript',
      'FastAPI & Microservices Architecture',
      'PostgreSQL Row-Level Security (RLS)',
      'Multi-tenant SaaS Architecture Lead',
      'High System Design & Mentorship Aptitude'
    ],
    gaps: [
      'Minor: Kubernetes hands-on is staging-focused rather than production cluster admin'
    ],
    skills: ['React 19', 'TypeScript', 'Node.js', 'FastAPI', 'PostgreSQL RLS', 'Redis', 'AWS Lambda', 'GraphQL'],
    summary: 'Senior software engineer with 7+ years building enterprise SaaS platforms. Led frontend and API architecture for a distributed FinTech platform handling $50M monthly transactions.',
    education: 'B.S. in Computer Science · UC Berkeley (2019)',
    fileName: 'Alex_Morgan_Senior_FullStack_Resume_2026.pdf'
  },
  {
    id: 'cand-jordan',
    name: 'Jordan Lee',
    email: 'jordan.lee@devmail.org',
    phone: '+1 (512) 443-8812',
    title: 'Frontend Associate Engineer',
    experienceYears: 2,
    currentCompany: 'Creative Pulse Media',
    matchScore: 64,
    matchCategory: 'Junior Potential',
    matchColor: 'amber',
    verdict: 'Motivated early-career frontend developer with solid React and UI styling fundamentals. Requires structured senior mentorship to meet full-stack and distributed architecture expectations.',
    strengths: [
      '2 yrs React, HTML5, Modern CSS & Tailwind',
      'Strong eye for UI animations & responsive polish',
      'Quick learner with modern Git workflows'
    ],
    gaps: [
      'Lacks production backend microservices experience',
      'No hands-on PostgreSQL or database schema design',
      'Needs mentoring on distributed systems & caching'
    ],
    skills: ['React', 'JavaScript (ES6+)', 'Tailwind CSS', 'Next.js', 'REST APIs', 'Git', 'Figma'],
    summary: 'Frontend developer with 2 years of experience crafting interactive client web portals. Passionate about responsive design and accessible web standards.',
    education: 'B.A. in Digital Arts & Informatics · UT Austin (2024)',
    fileName: 'Jordan_Lee_Frontend_Resume.pdf'
  },
  {
    id: 'cand-david',
    name: 'David Miller',
    email: 'david.m@retailpartners.com',
    phone: '+1 (312) 776-9011',
    title: 'Regional Retail Sales Lead',
    experienceYears: 8,
    currentCompany: 'Apex Consumer Goods',
    matchScore: 28,
    matchCategory: 'High Mismatch',
    matchColor: 'rose',
    verdict: 'Candidate possesses extensive sales and retail territory management credentials, but lacks any software engineering, coding, or cloud systems background required for this technical requisition.',
    strengths: [
      '8+ yrs B2B enterprise sales and channel expansion',
      'Excellent verbal stakeholder presentation skills',
      'High quota attainment in FMCG sector'
    ],
    gaps: [
      'Zero software engineering or programming experience',
      'No familiarity with TypeScript, React, or modern web frameworks',
      'Unrelated domain for Senior Technical Requisition'
    ],
    skills: ['B2B Sales', 'CRM (Salesforce)', 'Contract Negotiation', 'P&L Management', 'Team Leadership'],
    summary: 'Accomplished commercial sales leader driving multi-million dollar regional growth across retail and distribution networks.',
    education: 'B.B.A. in Marketing & Business Admin · DePaul University (2018)',
    fileName: 'David_Miller_Commercial_Sales_CV.pdf'
  }
];

const AtsContent: React.FC = () => {
  const { currentTenant, jobRequisitions, candidates, updateCandidateStage, addCandidate, createJobRequisition, showToast } = useTenant();

  // Active View Tab: AI Screener vs Pipeline Kanban vs Requisitions
  const [activeTab, setActiveTab] = useState<'ai_matcher' | 'kanban' | 'requisitions'>('ai_matcher');

  // Active Selected Job Requisition
  const [selectedJobId, setSelectedJobId] = useState<string>(jobRequisitions[0]?.id || 'JOB-301');

  // AI Screener State
  const [activeCandidate, setActiveCandidate] = useState<SampleCandidateData>(SAMPLE_CANDIDATES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzedSuccess, setAnalyzedSuccess] = useState<boolean>(true);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [customFileUploaded, setCustomFileUploaded] = useState<string | null>(null);

  // Invite & Rejection Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState<boolean>(false);
  const [inviteNotes, setInviteNotes] = useState<string>('Technical architecture assessment and live system design (60 mins with VP of Engineering).');
  const [rejectionNotes, setRejectionNotes] = useState<string>('Thank you for taking the time to share your credentials with us. While your background is impressive, we have chosen to proceed with candidates possessing deeper multi-tenant backend architecture depth.');
  const [aiTokensUsed, setAiTokensUsed] = useState<number>(142500);

  // Kanban Modals
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Candidate | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState<boolean>(false);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState<boolean>(false);

  // New Job State
  const [newJobData, setNewJobData] = useState({
    title: '',
    department: 'Engineering',
    location: `${currentTenant.headquarters} / Hybrid`,
    type: 'Full-Time' as const,
    hiringManager: 'Sarah Chen',
    salaryRange: '$160,000 - $190,000',
    description: ''
  });

  // New Candidate State
  const [newCandData, setNewCandData] = useState<{
    name: string;
    email: string;
    phone: string;
    jobId: string;
    stage: Candidate['stage'];
    experienceYears: number;
    currentCompany: string;
    matchScore: number;
    skills: string;
    notes: string;
  }>({
    name: '',
    email: '',
    phone: '+1 (555) 234-9988',
    jobId: selectedJobId,
    stage: 'screening',
    experienceYears: 5,
    currentCompany: 'FinTech Cloud',
    matchScore: 92,
    skills: 'React, TypeScript, Cloud Architecture',
    notes: 'Strong candidate profile.'
  });

  const handleExportCandidatesCsv = () => {
    const data = filteredCandidates.map(c => ({
      'Candidate ID': c.id,
      'Name': c.name,
      'Email': c.email,
      'Phone': c.phone,
      'Job Title': c.jobTitle,
      'Stage': c.stage,
      'Experience (Years)': c.experienceYears,
      'Current Employer': c.currentCompany,
      'AI Match Score (%)': c.matchScore,
      'Key Skills': c.skills.join(', '),
      'Applied Date': c.appliedDate
    }));
    exportToCsv(data, `Candidate_Pipeline_${currentTenant.slug}_${currentJob.title.replace(/\s+/g, '_')}.csv`);
    showToast('Export Complete', 'Candidate pipeline exported to CSV.', 'success');
  };

  const stages: { id: Candidate['stage']; label: string }[] = [
    { id: 'sourced', label: 'Sourced' },
    { id: 'screening', label: 'Screening' },
    { id: 'interview', label: 'Technical Interview' },
    { id: 'offer', label: 'Offer Extended' },
    { id: 'hired', label: 'Hired & Onboarded' },
  ];

  const currentJob = jobRequisitions.find(j => j.id === selectedJobId) || jobRequisitions[0] || {
    id: 'JOB-301',
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: `${currentTenant.headquarters} / Hybrid`,
    salaryRange: '$160k - $190k'
  };

  const filteredCandidates = candidates.filter(c => {
    if (selectedJobId === 'All') return true;
    return c.jobId === selectedJobId;
  });

  const handleSelectCandidateSample = (cand: SampleCandidateData) => {
    setActiveCandidate(cand);
    setCustomFileUploaded(null);
    setAnalyzedSuccess(false);
  };

  const handleTriggerAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStep('Gemini 2.5 Flash parsing skills and extracting entity graph...');

    setTimeout(() => {
      setAnalysisStep('Correlating candidate competencies against job criteria & RLS taxonomy...');
    }, 600);

    setTimeout(() => {
      setAnalysisStep('Finalizing multi-factor match score and executive fit verdict...');
    }, 1200);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzedSuccess(true);
      setAiTokensUsed(prev => prev + 1850);
      showToast('Gemini Analysis Complete', `Scored ${activeCandidate.name}: ${activeCandidate.matchScore}/100 Match`, 'success');
    }, 1800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFileUploaded(file.name);
      setActiveCandidate({
        id: 'cand-custom',
        name: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
        email: 'uploaded.candidate@talentpool.io',
        phone: '+1 (555) 309-8819',
        title: 'Software Developer',
        experienceYears: 4,
        currentCompany: 'Independent Enterprise Consultant',
        matchScore: 84,
        matchCategory: 'Strong Match',
        matchColor: 'emerald',
        verdict: `Automated parsing of ${file.name} demonstrates solid engineering capabilities with high adaptability to ${currentJob.title}.`,
        strengths: ['Relevant full-stack background', 'Clean documentation & modular code patterns', 'Proactive communication'],
        gaps: ['Requires verification of high-concurrency database benchmarks'],
        skills: ['TypeScript', 'React', 'Node.js', 'SQL', 'RESTful Services', 'Cloud DevOps'],
        summary: `Resume parsed from ${file.name} (${Math.round(file.size / 1024)} KB). Comprehensive developer background across modern tech stacks.`,
        education: 'B.S. in Computer Science / Information Systems',
        fileName: file.name
      });
      setAnalyzedSuccess(false);
      showToast('Resume Uploaded', `Parsed file: ${file.name}`, 'info');
    }
  };

  const handleSendInterviewInvite = () => {
    // Add or advance candidate in database
    const existing = candidates.find(c => c.email === activeCandidate.email);
    if (existing) {
      updateCandidateStage(existing.id, 'interview');
    } else {
      addCandidate({
        jobId: currentJob.id,
        jobTitle: currentJob.title,
        name: activeCandidate.name,
        email: activeCandidate.email,
        phone: activeCandidate.phone,
        stage: 'interview',
        experienceYears: activeCandidate.experienceYears,
        currentCompany: activeCandidate.currentCompany,
        matchScore: activeCandidate.matchScore,
        interviewerRating: 4.8,
        notes: `AI Shortlisted from Resume Matcher. ${activeCandidate.verdict}`,
        skills: activeCandidate.skills
      });
    }

    setIsInviteModalOpen(false);
    showToast('Interview Invite Dispatched', `Invited ${activeCandidate.name} to Technical Interview round. Added to pipeline.`, 'success');
  };

  const handleSendRejection = () => {
    setIsRejectionModalOpen(false);
    showToast('AI Rejection Dispatched', `Polite rejection email delivered to ${activeCandidate.name}.`, 'info');
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    createJobRequisition({
      title: newJobData.title,
      department: newJobData.department,
      location: newJobData.location,
      type: newJobData.type,
      status: 'open',
      hiringManager: newJobData.hiringManager,
      salaryRange: newJobData.salaryRange,
      description: newJobData.description || 'Enterprise role responsible for high impact roadmap delivery.'
    });
    setIsPostJobModalOpen(false);
    setNewJobData({
      title: '',
      department: 'Engineering',
      location: `${currentTenant.headquarters} / Hybrid`,
      type: 'Full-Time',
      hiringManager: 'Sarah Chen',
      salaryRange: '$160,000 - $190,000',
      description: ''
    });
    showToast('Job Requisition Posted', 'New role is now live in the candidate portal.', 'success');
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const job = jobRequisitions.find(j => j.id === newCandData.jobId);
    addCandidate({
      jobId: newCandData.jobId,
      jobTitle: job?.title || 'Open Requisition',
      name: newCandData.name,
      email: newCandData.email,
      phone: newCandData.phone,
      stage: newCandData.stage,
      experienceYears: Number(newCandData.experienceYears),
      currentCompany: newCandData.currentCompany,
      matchScore: Number(newCandData.matchScore),
      interviewerRating: 4.5,
      notes: newCandData.notes,
      skills: newCandData.skills.split(',').map(s => s.trim())
    });
    setIsAddCandidateModalOpen(false);
    showToast('Candidate Added', `${newCandData.name} added to pipeline.`, 'success');
  };

  const advanceStage = (candidate: Candidate, forward: boolean) => {
    const stageOrder: Candidate['stage'][] = ['sourced', 'screening', 'interview', 'offer', 'hired'];
    const currentIndex = stageOrder.indexOf(candidate.stage);
    const newIndex = forward ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < stageOrder.length) {
      updateCandidateStage(candidate.id, stageOrder[newIndex]);
      if (selectedCandidateDetail?.id === candidate.id) {
        setSelectedCandidateDetail({ ...selectedCandidateDetail, stage: stageOrder[newIndex] });
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600" />
            Recruitment & ATS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Candidate pipeline and job requisitions for {currentTenant.name}.
          </p>
        </div>

        {/* Tenant AI Usage & Cost Attribution Metric Pill */}
        <div className="flex items-center gap-3 bg-slate-50/90 border border-slate-200/80 rounded-xl px-3.5 py-2.5 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-rose-600" />
                Monthly AI Quota:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {aiTokensUsed.toLocaleString()} / 500,000 <span className="font-normal text-slate-500">Tokens</span>
              </span>
            </div>
            <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-rose-500 to-indigo-600 h-full rounded-full transition-all duration-500"
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

      {/* Navigation Sub-Tabs & Active Job Opening Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ai_matcher')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'ai_matcher'
                ? 'bg-white text-rose-700 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            AI Resume Matcher & Screener
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'kanban'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Candidate Pipeline (Kanban)
            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full border border-slate-200 font-mono">
              {filteredCandidates.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('requisitions')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'requisitions'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            Active Requisitions
            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full border border-slate-200 font-mono">
              {jobRequisitions.length}
            </span>
          </button>
        </div>

        {/* Active Job Requisition Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:inline">Active Job Opening:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-900 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-500 shadow-2xs w-full sm:w-auto"
          >
            {jobRequisitions.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.department} ({job.location})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI RESUME MATCHER & SCREENER                                      */}
      {/* ========================================================================= */}
      {activeTab === 'ai_matcher' && (
        <div className="space-y-6">
          {/* Active Job Context Card */}
          <div className="p-4 bg-gradient-to-r from-rose-50/60 via-slate-50 to-indigo-50/60 border border-rose-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">
                  Target Requisition
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">{currentJob.id}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{currentJob.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span><strong>Department:</strong> {currentJob.department}</span>
                <span>•</span>
                <span><strong>Location:</strong> {currentJob.location}</span>
                <span>•</span>
                <span><strong>Comp Band:</strong> {currentJob.salaryRange}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPostJobModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
              >
                + Post New Role
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Upload Dropzone & Sample Candidate Selector (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Dropzone Card */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    Resume Dropzone
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">PDF, DOCX up to 10MB</span>
                </div>

                <label className="border-2 border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50/30 transition-all rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-11 h-11 rounded-full bg-slate-100 group-hover:bg-rose-100 text-slate-600 group-hover:text-rose-600 flex items-center justify-center transition-colors mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-rose-700">
                    {customFileUploaded ? customFileUploaded : 'Drop candidate resume PDF/DOCX'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {customFileUploaded ? 'Click to replace with another resume file' : 'or click to browse from device storage'}
                  </p>
                </label>

                {/* Quick-Load Sample Candidate Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Pre-Loaded Candidate Profiles:</span>
                    <span className="text-[10px] text-slate-500">Instant test cases</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {SAMPLE_CANDIDATES.map((cand) => {
                      const isSelected = activeCandidate.id === cand.id && !customFileUploaded;
                      return (
                        <button
                          key={cand.id}
                          onClick={() => handleSelectCandidateSample(cand)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200/50'
                              : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 truncate">{cand.name}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                                cand.matchColor === 'emerald'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : cand.matchColor === 'amber'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {cand.matchScore}% Match
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {cand.title} · {cand.experienceYears}y exp
                            </div>
                          </div>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 ${
                            cand.matchCategory === 'Strong Match'
                              ? 'text-emerald-700 bg-emerald-100/70'
                              : cand.matchCategory === 'Junior Potential'
                              ? 'text-amber-700 bg-amber-100/70'
                              : 'text-rose-700 bg-rose-100/70'
                          }`}>
                            {cand.matchCategory}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trigger Analysis Button */}
                <button
                  onClick={handleTriggerAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 via-rose-700 to-indigo-700 hover:from-rose-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Analyzing with Gemini 2.5 Flash...' : `Analyze ${activeCandidate.name} with Gemini`}
                </button>
              </div>

              {/* Parsed Candidate Credentials Card */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Parsed Document Metadata
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[180px]">
                    {activeCandidate.fileName}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">Candidate Bio & Experience:</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
                      {activeCandidate.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Education:</span>
                    <span className="font-medium text-slate-800">{activeCandidate.education}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Recent Employer:</span>
                    <span className="font-medium text-slate-800">{activeCandidate.currentCompany}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Extracted Skills Taxonomy:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeCandidate.skills.map((s, idx) => (
                        <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Structured Output Card & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Live Loading Pulse Animation State */}
              {isAnalyzing && (
                <div className="p-8 bg-white border border-rose-200 rounded-2xl shadow-sm text-center space-y-4 animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <Brain className="w-7 h-7 animate-bounce" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900">Gemini 2.5 Flash Inference in Progress</h4>
                    <p className="text-xs text-rose-700 font-medium font-mono">{analysisStep}</p>
                  </div>
                  <div className="w-64 bg-slate-100 h-2 rounded-full mx-auto overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full animate-indeterminate w-1/2" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Evaluating semantic context, syntax depth, tenure continuity, and company culture fit.
                  </p>
                </div>
              )}

              {/* AI Structured Output Card */}
              {!isAnalyzing && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  {/* Top Verdict Banner */}
                  <div className={`p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    activeCandidate.matchColor === 'emerald'
                      ? 'bg-emerald-50/60 border-emerald-100'
                      : activeCandidate.matchColor === 'amber'
                      ? 'bg-amber-50/60 border-amber-100'
                      : 'bg-rose-50/60 border-rose-100'
                  }`}>
                    <div className="flex items-center gap-4">
                      {/* Circular Gauge / Score Display */}
                      <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2 shadow-xs ${
                        activeCandidate.matchColor === 'emerald'
                          ? 'bg-white border-emerald-400 text-emerald-700'
                          : activeCandidate.matchColor === 'amber'
                          ? 'bg-white border-amber-400 text-amber-700'
                          : 'bg-white border-rose-400 text-rose-700'
                      }`}>
                        <span className="text-2xl font-black tracking-tight leading-none">
                          {activeCandidate.matchScore}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                          / 100
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            activeCandidate.matchColor === 'emerald'
                              ? 'bg-emerald-100 text-emerald-800'
                              : activeCandidate.matchColor === 'amber'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {activeCandidate.matchCategory}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            Confidence: 98.4%
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                          {activeCandidate.name}
                        </h3>
                        <p className="text-xs text-slate-600">
                          Evaluated against <strong>{currentJob.title}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">Model Engine</span>
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-rose-500" />
                        Gemini 2.5 Flash
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Executive Fit Verdict */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-slate-700" />
                        Executive Fit Verdict
                      </h4>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {activeCandidate.verdict}
                      </p>
                    </div>

                    {/* Key Strengths & Positives */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Key Competency Strengths ({activeCandidate.strengths.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeCandidate.strengths.map((str, idx) => (
                          <div key={idx} className="p-2.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl flex items-start gap-2 text-xs text-emerald-900">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="font-medium leading-tight">{str}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skill Gaps / Red Flags */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Skill Gaps & Red Flags ({activeCandidate.gaps.length})
                      </h4>
                      <div className="space-y-1.5">
                        {activeCandidate.gaps.map((gap, idx) => (
                          <div key={idx} className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="font-medium leading-tight">{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Automated Next Action Bar */}
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Automated Next Actions:</span>
                        <span className="text-[11px] text-slate-500 font-mono">1-Click ATS Dispatch</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                          onClick={() => setIsInviteModalOpen(true)}
                          className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Shortlist & Send Interview Invite
                        </button>
                        <button
                          onClick={() => setIsRejectionModalOpen(true)}
                          className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
                          Send Polite AI Rejection
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTERACTIVE KANBAN PIPELINE                                       */}
      {/* ========================================================================= */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter Stage Candidates:</span>
              <span className="text-xs text-slate-500">
                Showing {filteredCandidates.length} applicants for <strong>{currentJob.title}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCandidatesCsv}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Download CSV of the candidate pipeline"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Export Pipeline CSV
              </button>

              <button
                onClick={() => setIsAddCandidateModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Candidate Manually
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
            {stages.map(stage => {
              const stageCandidates = filteredCandidates.filter(c => c.stage === stage.id);

              return (
                <div 
                  key={stage.id} 
                  className="bg-slate-100/80 border border-slate-200 rounded-xl p-3 space-y-3 min-h-[480px] flex flex-col shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="text-xs font-bold text-slate-900 tracking-tight truncate">
                      {stage.label}
                    </div>
                    <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2.5 overflow-y-auto">
                    {stageCandidates.length === 0 ? (
                      <div className="text-center py-12 text-[11px] text-slate-400 italic">
                        No candidates in this stage
                      </div>
                    ) : (
                      stageCandidates.map(cand => (
                        <div
                          key={cand.id}
                          onClick={() => setSelectedCandidateDetail(cand)}
                          className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-lg cursor-pointer transition-all space-y-2 group shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {cand.name}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                                {cand.jobTitle}
                              </div>
                            </div>

                            <div className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                              <span>{cand.matchScore}%</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-600">
                            {cand.experienceYears}y exp · {cand.currentCompany}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {cand.skills.slice(0, 2).map((sk, i) => (
                              <span key={i} className="text-[9px] text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-medium">
                                {sk}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                advanceStage(cand, false);
                              }}
                              disabled={cand.stage === 'sourced'}
                              className="text-slate-400 hover:text-slate-700 disabled:opacity-30 p-1"
                              title="Move Back"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[9px] font-mono text-slate-400">
                              Rating: {cand.interviewerRating || 'N/A'}/5
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                advanceStage(cand, true);
                              }}
                              disabled={cand.stage === 'hired'}
                              className="text-slate-400 hover:text-blue-600 disabled:opacity-30 p-1"
                              title="Advance Stage"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACTIVE REQUISITIONS MANAGER                                       */}
      {/* ========================================================================= */}
      {activeTab === 'requisitions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Active Job Requisitions for {currentTenant.name} ({jobRequisitions.length})
            </h3>
            <button
              onClick={() => setIsPostJobModalOpen(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Post New Requisition
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobRequisitions.map(job => (
              <div key={job.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {job.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{job.title}</h4>
                    <p className="text-xs text-slate-500">{job.department} · {job.location}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Comp Range:</span>
                    <span className="font-semibold text-slate-800">{job.salaryRange}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Hiring Manager:</span>
                    <span className="font-semibold text-slate-800">{job.hiringManager}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {job.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setActiveTab('ai_matcher');
                    }}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    Match Resumes for this Role <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERVIEW INVITATION MODAL                                               */}
      {/* ========================================================================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-emerald-950">
                  Dispatch AI Interview Invitation
                </h3>
              </div>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">To Candidate:</span>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-900">{activeCandidate.name}</span>
                  <span className="text-slate-500 font-mono">{activeCandidate.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Requisition & Match Score:</span>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{currentJob.title}</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {activeCandidate.matchScore}% Match
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Personalized Interview Agenda / Email Body:</span>
                <textarea
                  value={inviteNotes}
                  onChange={(e) => setInviteNotes(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Confirming this action will automatically advance <strong>{activeCandidate.name}</strong> to the <strong>Technical Interview</strong> stage in your ATS pipeline.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInterviewInvite}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Send Invite & Add to Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REJECTION MODAL                                                          */}
      {/* ========================================================================= */}
      {isRejectionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Send Polite AI Rejection Notice
                </h3>
              </div>
              <button 
                onClick={() => setIsRejectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">To Candidate:</span>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900">{activeCandidate.name}</span> ({activeCandidate.email})
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Constructive Feedback & Message:</span>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>

              <p className="text-[11px] text-slate-500 italic">
                A constructive, professional rejection preserves employer brand reputation while respecting candidate time.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsRejectionModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRejection}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Polite Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POST REQUISITION MODAL                                                    */}
      {/* ========================================================================= */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Post New Job Requisition</h3>
              <button onClick={() => setIsPostJobModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  value={newJobData.title}
                  onChange={e => setNewJobData({ ...newJobData, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Department</label>
                  <select
                    value={newJobData.department}
                    onChange={e => setNewJobData({ ...newJobData, department: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  >
                    <option>Engineering</option>
                    <option>Product</option>
                    <option>People & Culture</option>
                    <option>Sales & Marketing</option>
                    <option>Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={newJobData.salaryRange}
                    onChange={e => setNewJobData({ ...newJobData, salaryRange: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Hiring Manager</label>
                <input
                  type="text"
                  value={newJobData.hiringManager}
                  onChange={e => setNewJobData({ ...newJobData, hiringManager: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
                >
                  Publish Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD CANDIDATE MODAL                                                      */}
      {/* ========================================================================= */}
      {isAddCandidateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add Candidate to Pipeline</h3>
              <button onClick={() => setIsAddCandidateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCandidate} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newCandData.name}
                    onChange={e => setNewCandData({ ...newCandData, name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newCandData.email}
                    onChange={e => setNewCandData({ ...newCandData, email: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Requisition</label>
                  <select
                    value={newCandData.jobId}
                    onChange={e => setNewCandData({ ...newCandData, jobId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    {jobRequisitions.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Stage</label>
                  <select
                    value={newCandData.stage}
                    onChange={e => setNewCandData({ ...newCandData, stage: e.target.value as Candidate['stage'] })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    {stages.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={newCandData.skills}
                  onChange={e => setNewCandData({ ...newCandData, skills: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCandidateModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Detail Drawer/Modal */}
      {selectedCandidateDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden p-5 space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedCandidateDetail.name}</h3>
                <p className="text-xs text-slate-500">{selectedCandidateDetail.jobTitle} · {selectedCandidateDetail.currentCompany}</p>
              </div>
              <button onClick={() => setSelectedCandidateDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-500">Match Score:</span>
                <span className="font-bold text-emerald-700">{selectedCandidateDetail.matchScore}%</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-500">Stage:</span>
                <span className="font-bold uppercase text-blue-700">{selectedCandidateDetail.stage}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg">
                <span className="text-slate-500 block mb-1">Interviewer Notes:</span>
                <p className="text-slate-800">{selectedCandidateDetail.notes}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCandidateDetail(null)}
                className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
