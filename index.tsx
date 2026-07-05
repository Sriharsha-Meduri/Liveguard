import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileVideo, 
  Search, 
  BarChart3, 
  Info, 
  Menu, 
  X, 
  ArrowRight,
  Upload,
  Clock,
  MapPin,
  Maximize2,
  ChevronRight,
  Eye,
  FileText,
  Server,
  Lock,
  Cpu,
  Layers,
  Activity,
  Code,
  ExternalLink,
  Github
} from "lucide-react";

// Backend API base URL. Configurable via VITE_API_URL; defaults to local dev.
const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

// --- Types ---

type Page = 'home' | 'analyze' | 'how-it-works' | 'use-cases' | 'about';

interface AnalysisResult {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  signals: {
    type: 'temporal' | 'spatial' | 'contextual';
    title: string;
    description: string;
    status: 'pass' | 'warn' | 'fail';
  }[];
  summary: string;
}

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost',
  className?: string,
  disabled?: boolean
}) => {
  const baseClasses = "font-sans font-semibold px-6 py-3 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
  const variants = {
    primary: "bg-ink text-paper border-2 border-ink hover:bg-transparent hover:text-ink shadow-hard hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px]",
    secondary: "bg-alert text-ink border-2 border-ink shadow-hard hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px]",
    outline: "bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-paper",
    ghost: "bg-transparent text-ink hover:bg-paper-dark"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const SectionHeading = ({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) => (
  <div className="mb-12 text-center">
    <h2 className="text-3xl md:text-5xl font-serif font-black mb-4 text-ink">{children}</h2>
    {subtitle && (
      <div className="flex items-center justify-center gap-4">
        <div className="h-[2px] w-12 bg-alert"></div>
        <p className="text-lg font-sans text-ink/70 font-medium max-w-2xl">{subtitle}</p>
        <div className="h-[2px] w-12 bg-alert"></div>
      </div>
    )}
  </div>
);

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border-2 border-ink shadow-hard p-6 md:p-8 ${className}`}>
    {children}
  </div>
);

const Navbar = ({ currentPage, setPage, isMenuOpen, setIsMenuOpen }: any) => {
  const links: {id: Page, label: string}[] = [
    { id: 'home', label: 'Home' },
    { id: 'analyze', label: 'Analyze' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'use-cases', label: 'Use Cases' },
    { id: 'about', label: 'About' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-paper border-b-2 border-ink px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setPage('home')}
        >
          {/* Logo Icon */}
          <div className="bg-ink text-paper p-1.5 border border-ink group-hover:bg-alert group-hover:text-ink transition-colors">
            <Shield size={24} strokeWidth={2.5} />
          </div>
          <span className="font-serif font-black text-2xl tracking-tighter">Provenance</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => setPage(link.id)}
              className={`font-sans font-bold text-sm uppercase tracking-wide transition-all ${
                currentPage === link.id 
                  ? 'bg-alert text-ink px-2 -ml-2 skew-x-[-10deg]' 
                  : 'text-ink hover:text-ink/60'
              }`}
            >
              <span className={currentPage === link.id ? 'skew-x-[10deg] inline-block' : ''}>{link.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-ink"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-paper border-b-2 border-ink shadow-hard p-6 flex flex-col gap-4">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => {
                setPage(link.id);
                setIsMenuOpen(false);
              }}
              className={`font-serif text-xl font-bold text-left py-2 px-2 ${
                currentPage === link.id ? 'bg-alert text-ink' : 'text-ink'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

const Footer = ({ setPage }: { setPage: (page: Page) => void }) => (
  <footer className="bg-ink text-paper py-16 px-6 border-t-4 border-alert">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <Shield size={32} className="text-alert" />
          <span className="font-serif font-black text-3xl">Provenance</span>
        </div>
        <p className="font-sans text-paper/80 max-w-md leading-relaxed mb-6">
          An assistive tool for verifying the context of near-live video content. 
          We provide signals, not judgments. Designed for journalists, fact-checkers, 
          and moderation teams.
        </p>
        <div className="flex gap-4 text-sm font-mono text-paper/60">
          <span>v2.0 Reloaded</span>
          <span>•</span>
          <span>Build 2024.10</span>
        </div>
      </div>

      <div>
        <h4 className="font-serif font-bold text-xl mb-6 text-alert">Navigation</h4>
        <ul className="space-y-3 font-sans">
          <li><button onClick={() => setPage('home')} className="hover:text-alert transition-colors">Home</button></li>
          <li><button onClick={() => setPage('analyze')} className="hover:text-alert transition-colors">Analyze Video</button></li>
          <li><button onClick={() => setPage('how-it-works')} className="hover:text-alert transition-colors">Methodology</button></li>
          <li><button onClick={() => setPage('about')} className="hover:text-alert transition-colors">Mission & Ethics</button></li>
        </ul>
      </div>

      <div>
        <h4 className="font-serif font-bold text-xl mb-6 text-alert">Legal</h4>
        <ul className="space-y-3 font-sans">
          <li><button className="hover:text-alert transition-colors">Disclaimer</button></li>
          <li><button className="hover:text-alert transition-colors">Privacy Policy</button></li>
          <li><button className="hover:text-alert transition-colors">Terms of Service</button></li>
        </ul>
      </div>
    </div>
      
    <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-paper/20 flex flex-col md:flex-row justify-between items-center text-sm text-paper/60">
      <p>© 2026 Provenance Project. All rights reserved.</p>
      <p>This is a technical demonstration.</p>
    </div>
  </footer>
);

// --- Pages ---

const HomePage = ({ setPage }: { setPage: (page: Page) => void }) => (
  <div className="animate-in fade-in duration-500">
    {/* Hero Section */}
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-paper-dark -skew-x-12 -z-10 translate-x-1/4"></div>
      
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block bg-alert text-ink font-mono text-xs font-bold px-3 py-1 mb-6 border border-ink shadow-[2px_2px_0px_0px_#111111]">
            PROVENANCE // RELOADED v2.0
          </div>
          <h1 className="font-serif font-black text-5xl md:text-7xl leading-[0.9] text-ink mb-8">
            TRUTH IN <br/>
            <span className="bg-alert text-ink px-4 italic inline-block -skew-x-6 shadow-hard-sm mt-2">MOTION</span>
          </h1>
          <p className="font-sans text-xl md:text-2xl text-ink/80 mb-10 max-w-lg leading-relaxed border-l-4 border-alert pl-6">
            Multi-dimensional video forensics: Detect deepfakes, AI-generated content, and miscontextualized footage. Assistive AI for the age of synthetic media.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => setPage('analyze')}>
              Start Verification <ArrowRight size={20} />
            </Button>
            <Button variant="outline" onClick={() => setPage('how-it-works')}>
              Learn Methodology
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="bg-white border-2 border-ink shadow-hard p-2 rotate-2 hover:rotate-0 transition-transform duration-500">
             <div className="bg-ink aspect-video w-full flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550353127-b0da3aeaa0ca?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"></div>
                <div className="absolute inset-0 bg-ink/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-paper flex items-center justify-center backdrop-blur-sm">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-paper border-b-[10px] border-b-transparent ml-1"></div>
                  </div>
                </div>
                
                {/* Overlay UI element */}
                <div className="absolute bottom-4 left-4 right-4 bg-paper/90 border border-ink p-3 shadow-hard-sm">
                   <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-ink bg-alert px-1 font-bold flex items-center gap-1"><AlertTriangle size={12} /> SPATIAL MISMATCH DETECTED</span>
                      <span>CONFIDENCE: 88%</span>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-paper border-2 border-ink p-4 shadow-hard max-w-xs hidden md:block">
            <p className="font-serif italic text-sm">"The first casualty of war is truth."</p>
          </div>
        </div>
      </div>
    </section>

    {/* Context Section */}
    <section className="py-24 px-6 bg-paper-dark/30 border-y-2 border-ink">
      <div className="max-w-6xl mx-auto">
        <SectionHeading subtitle="Understanding the Threat Landscape">
          The Core Problem
        </SectionHeading>
        
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="font-serif font-bold text-3xl mb-6">The Information Gap</h3>
            <p className="font-sans text-lg text-ink/80 mb-6 leading-relaxed">
              Modern video manipulation exists across three critical dimensions: <strong>facial deepfakes</strong>, 
              <strong>fully AI-generated synthetic content</strong>, and <strong>miscontextualization</strong> of 
              real footage. Each presents unique verification challenges that require specialized detection approaches.
            </p>
            <p className="font-sans text-lg text-ink/80 mb-6 leading-relaxed">
              This is particularly prevalent during protests, disasters, elections, and geopolitical events where 
              speed often outpaces verification. The damage compounds rapidly: misinformation spreads faster than 
              truth, and corrections rarely reach the same audience as the original false claim.
            </p>
            <p className="font-sans text-lg text-ink/80 leading-relaxed">
              <strong className="text-alert">The Core Challenge:</strong> There is no unified system that assesses 
              video credibility across multiple manipulation dimensions - deepfake alterations, synthetic generation, 
              and contextual misrepresentation - providing explainable risk indicators in near-real-time.
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-2xl mb-4 text-alert bg-ink inline-block px-2">Current Failure Modes</h3>
            <ul className="space-y-4">
               {[
                 {
                   title: "Deepfake detection tools don't catch AI-generated content",
                   detail: "Facial manipulation detectors miss fully synthetic videos without real human subjects."
                 },
                 {
                   title: "Real footage can be highly misleading without alteration",
                   detail: "Authentic videos misrepresented through false claims (miscontext) evade technical detection."
                 },
                 {
                   title: "Users receive binary judgments instead of evidence",
                   detail: "Simple true/false labels don't provide the forensic context needed for informed decisions."
                 },
                 {
                   title: "No single tool addresses all manipulation types",
                   detail: "Deepfakes, synthetic media, and miscontext require fundamentally different detection approaches."
                 }
               ].map((item, i) => (
                 <li key={i} className="bg-white p-4 border border-ink/20">
                   <div className="flex items-start gap-3 mb-2">
                     <AlertTriangle className="text-alert shrink-0 mt-1" size={18} />
                     <span className="font-sans font-bold">{item.title}</span>
                   </div>
                   <p className="text-sm text-ink/70 ml-7">{item.detail}</p>
                 </li>
               ))}
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-ink text-paper p-8 border-4 border-alert">
          <h3 className="font-serif font-bold text-2xl mb-6 text-alert">Real-World Impact</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-black mb-2 text-alert">3 Threats</div>
              <p className="text-sm">Deepfake manipulation, AI-generated synthetic content, and miscontextualization - all require specialized detection</p>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-alert">18 min</div>
              <p className="text-sm">Average time for manipulated video to reach 10,000 views during breaking news events</p>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-alert">85%</div>
              <p className="text-sm">of existing tools only detect one manipulation type, leaving critical gaps in forensic coverage</p>
            </div>
          </div>
          <p className="text-xs text-paper/60 mt-6 italic">* Illustrative statistics based on research patterns</p>
        </div>
      </div>
    </section>

    {/* Features/Modules */}
    <section className="bg-ink text-paper py-20 border-b-4 border-alert">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h2 className="font-serif font-black text-3xl md:text-4xl text-alert mb-4">Three Independent Forensic Modules</h2>
          <p className="text-paper/70 max-w-3xl mx-auto text-lg">Each analysis module operates independently with specialized models and methods, providing comprehensive coverage across distinct manipulation dimensions.</p>
      </div>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { 
            icon: Shield, 
            title: "Deepfake Detection",
            desc: "Detects faces with OpenCV YuNet and scores each one with a pretrained face-forgery classifier to flag manipulation.",
            details: [
              "Per-face manipulation scoring",
              "YuNet face detection",
              "Frame-level consistency",
              "No-face videos handled gracefully"
            ]
          },
          { 
            icon: Cpu, 
            title: "AI-Generated Detection",
            desc: "Runs a pretrained AI-vs-real image classifier across sampled frames to estimate how likely the video is synthetically generated.",
            details: [
              "Per-frame AI-vs-real scoring",
              "Whole-frame analysis",
              "Frame-agreement check",
              "Pretrained classifier"
            ]
          },
          { 
            icon: AlertTriangle, 
            title: "Context Integrity", 
            desc: "Identifies misrepresented real footage through temporal reuse detection, semantic alignment, and environmental consistency.",
            details: [
              "Temporal reuse detection",
              "Scene-claim alignment",
              "Environmental consistency",
              "Multi-signal aggregation"
            ]
          }
        ].map((feature, idx) => (
          <div key={idx} className="flex flex-col p-6 border-2 border-paper/10 hover:border-alert transition-all duration-300 bg-ink/50 hover:bg-ink/70 group">
            <feature.icon className="text-alert mb-6 group-hover:scale-110 transition-transform" size={56} />
            <h3 className="font-serif font-bold text-2xl mb-4">{feature.title}</h3>
            <p className="text-paper/80 font-sans leading-relaxed mb-6">{feature.desc}</p>
            <div className="mt-auto pt-4 border-t border-paper/10">
              <p className="text-xs font-bold text-alert mb-3 uppercase tracking-wider">Key Capabilities:</p>
              <ul className="space-y-2">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-paper/70">
                    <ChevronRight size={14} className="text-alert" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Stats/Metrics Block */}
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
        <div className="bg-paper-dark/10 border border-paper/20 p-6">
          <h4 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
            <BarChart3 size={24} className="text-alert" />
            Explainable Risk Scoring
          </h4>
          <p className="text-paper/70 mb-4">Each of the three modules produces an independent 0-100 risk score mapped to qualitative bands (Low/Medium/High). Every score includes detailed forensic explanations in human-readable format.</p>
          <div className="flex gap-4 text-sm">
            <div className="flex-1 text-center py-2 bg-success/20 border border-success">
              <div className="font-bold">0-33</div>
              <div className="text-xs">Low Risk</div>
            </div>
            <div className="flex-1 text-center py-2 bg-warning/20 border border-warning">
              <div className="font-bold">34-66</div>
              <div className="text-xs">Medium Risk</div>
            </div>
            <div className="flex-1 text-center py-2 bg-alert/20 border border-alert">
              <div className="font-bold">67-100</div>
              <div className="text-xs">High Risk</div>
            </div>
          </div>
        </div>
        
        <div className="bg-paper-dark/10 border border-paper/20 p-6">
          <h4 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
            <Activity size={24} className="text-alert" />
            Performance & Reliability
          </h4>
          <p className="text-paper/70 mb-4">Three independent analysis pipelines with pretrained models - no user data training. Graceful degradation when modules are unavailable.</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-paper/10">
              <span>Per-Module Speed</span>
              <span className="font-bold text-alert">&lt; 20 seconds</span>
            </div>
            <div className="flex justify-between py-2 border-b border-paper/10">
              <span>Architecture</span>
              <span className="font-bold text-alert">3 Independent Modules</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Failure Handling</span>
              <span className="font-bold text-alert">Graceful Degradation</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Footer Logos/Trust */}
    <section className="py-24 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif font-black text-4xl mb-6">Designed for Accountability</h2>
        <p className="text-lg text-ink/80 mb-8 font-sans">
          Provenance provides comprehensive forensic evidence across three dimensions - deepfake detection, AI-generated content analysis, and context verification - empowering you to make informed decisions.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Placeholder Logos */}
          {['NewsCorp', 'FactCheck.org', 'Reuters', 'AFP'].map((name, i) => (
             <div key={i} className="h-12 border-2 border-dashed border-ink/30 flex items-center justify-center font-serif font-bold">{name}</div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

const AnalyzePage = () => {

  const [deepfakeFile, setDeepfakeFile] = useState<File | null>(null);
  const [isDeepfakeAnalyzing, setIsDeepfakeAnalyzing] = useState(false);
  const [deepfakeResult, setDeepfakeResult] = useState<AnalysisResult | null>(null);

  const [syntheticFile, setSyntheticFile] = useState<File | null>(null);
  const [isSyntheticAnalyzing, setIsSyntheticAnalyzing] = useState(false);
  const [syntheticResult, setSyntheticResult] = useState<AnalysisResult | null>(null);

  const [contextFile, setContextFile] = useState<File | null>(null);
  const [contextClaim, setContextClaim] = useState("");
  const [isContextAnalyzing, setIsContextAnalyzing] = useState(false);
  const [contextResult, setContextResult] = useState<AnalysisResult | null>(null);

  // --- Handlers for Inputs ---
  const handleDeepfakeUpload = (file: File | undefined) => {
    if (file) setDeepfakeFile(file);
  };

  const handleSyntheticUpload = (file: File | undefined) => {
    if (file) setSyntheticFile(file);
  };

  const handleContextUpload = (file: File | undefined) => {
    if (file) setContextFile(file);
  };

  // --- Analysis Logic ---

  const handleDeepfakeAnalyze = async () => {
    if (!deepfakeFile) return;
    
    setIsDeepfakeAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('video', deepfakeFile);
      
      const response = await fetch(`${API_URL}/analyze/deepfake`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Deepfake analysis failed');
      }
      
      const data = await response.json();
      setDeepfakeResult({
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        summary: data.summary,
        signals: Object.entries(data.signals).map(([type, sig]: [string, any]) => ({
          type: type as any,
          title: sig.name,
          description: sig.details,
          status: sig.status
        }))
      });
    } catch (error: any) {
      console.error('Deepfake analysis error:', error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setIsDeepfakeAnalyzing(false);
    }
  };

  const handleSyntheticAnalyze = async () => {
    if (!syntheticFile) return;
    
    setIsSyntheticAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('video', syntheticFile);
      
      const response = await fetch(`${API_URL}/analyze/synthetic`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Synthetic analysis failed');
      }
      
      const data = await response.json();
      setSyntheticResult({
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        summary: data.summary,
        signals: Object.entries(data.signals).map(([type, sig]: [string, any]) => ({
          type: type as any,
          title: sig.name,
          description: sig.details,
          status: sig.status
        }))
      });
    } catch (error: any) {
      console.error('Synthetic analysis error:', error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setIsSyntheticAnalyzing(false);
    }
  };

  const handleContextAnalyze = async () => {
    if (!contextFile || !contextClaim) return;
    
    setIsContextAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('video', contextFile);
      formData.append('claim', contextClaim);
      
      const response = await fetch(`${API_URL}/analyze/context`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Context analysis failed');
      }
      
      const data = await response.json();
      setContextResult({
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        summary: data.summary,
        signals: Object.entries(data.signals).map(([type, sig]: [string, any]) => ({
          type: type as any,
          title: sig.name,
          description: sig.details,
          status: sig.status
        }))
      });
    } catch (error: any) {
      console.error('Context analysis error:', error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setIsContextAnalyzing(false);
    }
  };

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeading subtitle="Advanced video forensics with state-of-the-art AI models">
        Video Forensics
      </SectionHeading>

      {/* --- Module 1: Deepfake --- */}
      <div className="mb-16">
        <div className="mb-6 border-l-4 border-alert pl-4">
          <h3 className="font-serif font-black text-3xl mb-2">1. DEEPFAKE RISK ANALYSIS</h3>
          <p className="text-ink/70">
            Assesses whether the video contains facial manipulations or deepfake artifacts. Faces are detected with <strong>OpenCV YuNet</strong> and each is scored by a <strong>pretrained face-forgery classifier</strong>, then aggregated into a manipulation-likelihood score.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Upload Card */}
          <Card className="relative">
            <div className="absolute -top-4 -left-4 bg-ink text-paper font-mono px-3 py-1 font-bold text-sm shadow-hard-sm">DEEPFAKE DETECTION</div>
            
            <div className="mb-6">
              <label className="block font-serif font-bold text-lg mb-2">Upload Video</label>
              <div 
                className={`border-2 border-dashed ${deepfakeFile ? 'border-success bg-success/10' : 'border-ink/40 bg-paper-dark/30'} p-8 text-center cursor-pointer transition-colors hover:border-ink hover:bg-paper-dark`}
                onClick={() => !deepfakeFile && (document.getElementById('deepfake-upload') as HTMLInputElement)?.click()}
              >
                {deepfakeFile ? (
                  <div className="flex flex-col items-center">
                    <FileVideo size={48} className="text-success mb-2" />
                    <p className="font-bold">{deepfakeFile.name}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeepfakeFile(null); }}
                      className="mt-2 text-xs text-alert hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={48} className="mx-auto text-ink/40 mb-2" />
                    <p className="font-bold text-ink/60">Choose Video</p>
                    <p className="text-xs text-ink/40 mt-1">MP4, MOV (5-20s)</p>
                  </>
                )}
                <input 
                  type="file" 
                  id="deepfake-upload" 
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => handleDeepfakeUpload(e.target.files?.[0])}
                />
              </div>
            </div>
            
            <Button 
              disabled={!deepfakeFile || isDeepfakeAnalyzing} 
              onClick={handleDeepfakeAnalyze}
              className="w-full"
            >
              {isDeepfakeAnalyzing ? 'Analyzing...' : 'Analyze Deepfake Risk'}
            </Button>
          </Card>

          {/* Results Area */}
          <div className="relative min-h-[400px]">
            {!deepfakeResult && !isDeepfakeAnalyzing && (
              <div className="h-full min-h-[400px] border-2 border-ink border-dashed rounded-lg flex items-center justify-center p-8 text-center bg-paper-dark/20">
                <div className="max-w-xs">
                  <Search size={48} className="mx-auto text-ink/20 mb-4" />
                  <p className="text-ink/40 text-sm">Results will appear here</p>
                </div>
              </div>
            )}

            {isDeepfakeAnalyzing && (
              <div className="h-full min-h-[400px] border-2 border-ink bg-white shadow-hard p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-ink border-t-alert rounded-full animate-spin mb-4"></div>
                <p className="font-bold">Analyzing facial consistency...</p>
              </div>
            )}

            {deepfakeResult && (
              <Card className="animate-in slide-in-from-right-4 duration-500 border-alert">
                <div className={`px-4 py-2 mb-4 font-mono font-bold text-lg border-2 border-ink shadow-hard-sm inline-block
                  ${deepfakeResult.riskLevel === 'HIGH' ? 'bg-alert text-ink' : 
                    deepfakeResult.riskLevel === 'MEDIUM' ? 'bg-warning text-ink' : 'bg-success text-white'}
                `}>
                  {deepfakeResult.riskLevel} RISK
                </div>
                <p className="text-sm mb-4 text-ink/70">{deepfakeResult.summary}</p>
                <div className="space-y-2">
                  {deepfakeResult.signals.map((sig, i) => (
                    <div key={i} className={`p-3 border-2 text-sm ${
                      sig.status === 'fail' ? 'bg-alert/10 border-alert' :
                      sig.status === 'warn' ? 'bg-warning/10 border-warning' :
                      'bg-success/10 border-success'
                    }`}>
                      <strong>{sig.title}:</strong> {sig.description}
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={() => {setDeepfakeFile(null); setDeepfakeResult(null);}}
                >
                  Analyze Another
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* --- Module 2: AI-Generated --- */}
      <div className="mb-16">
        <div className="mb-6 border-l-4 border-alert pl-4">
          <h3 className="font-serif font-black text-3xl mb-2">2. AI-GENERATED VIDEO DETECTION</h3>
          <p className="text-ink/70">
            Detects whether the video is likely synthetically generated using a <strong>pretrained AI-vs-real image classifier</strong> run across sampled frames, aggregating the mean "artificial" probability and per-frame agreement.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <Card className="relative">
            <div className="absolute -top-4 -left-4 bg-ink text-paper font-mono px-3 py-1 font-bold text-sm shadow-hard-sm">SYNTHETIC DETECTION</div>
            
            <div className="mb-6">
              <label className="block font-serif font-bold text-lg mb-2">Upload Video</label>
              <div 
                className={`border-2 border-dashed ${syntheticFile ? 'border-success bg-success/10' : 'border-ink/40 bg-paper-dark/30'} p-8 text-center cursor-pointer transition-colors hover:border-ink hover:bg-paper-dark`}
                onClick={() => !syntheticFile && (document.getElementById('synthetic-upload') as HTMLInputElement)?.click()}
              >
                {syntheticFile ? (
                  <div className="flex flex-col items-center">
                    <FileVideo size={48} className="text-success mb-2" />
                    <p className="font-bold">{syntheticFile.name}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSyntheticFile(null); }}
                      className="mt-2 text-xs text-alert hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={48} className="mx-auto text-ink/40 mb-2" />
                    <p className="font-bold text-ink/60">Choose Video</p>
                    <p className="text-xs text-ink/40 mt-1">MP4, MOV (5-20s)</p>
                  </>
                )}
                <input 
                  type="file" 
                  id="synthetic-upload" 
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => handleSyntheticUpload(e.target.files?.[0])}
                />
              </div>
            </div>
            
            <Button 
              disabled={!syntheticFile || isSyntheticAnalyzing} 
              onClick={handleSyntheticAnalyze}
              className="w-full"
            >
              {isSyntheticAnalyzing ? 'Analyzing...' : 'Analyze Synthetic Risk'}
            </Button>
          </Card>
          
          <div className="relative min-h-[400px]">
            {!syntheticResult && !isSyntheticAnalyzing && (
              <div className="h-full min-h-[400px] border-2 border-ink border-dashed rounded-lg flex items-center justify-center p-8 text-center bg-paper-dark/20">
                <div className="max-w-xs">
                  <Search size={48} className="mx-auto text-ink/20 mb-4" />
                  <p className="text-ink/40 text-sm">Results will appear here</p>
                </div>
              </div>
            )}

            {isSyntheticAnalyzing && (
              <div className="h-full min-h-[400px] border-2 border-ink bg-white shadow-hard p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-ink border-t-alert rounded-full animate-spin mb-4"></div>
                <p className="font-bold">Analyzing temporal features...</p>
              </div>
            )}

            {syntheticResult && (
              <Card className="animate-in slide-in-from-right-4 duration-500 border-alert">
                <div className={`px-4 py-2 mb-4 font-mono font-bold text-lg border-2 border-ink shadow-hard-sm inline-block
                  ${syntheticResult.riskLevel === 'HIGH' ? 'bg-alert text-ink' : 
                    syntheticResult.riskLevel === 'MEDIUM' ? 'bg-warning text-ink' : 'bg-success text-white'}
                `}>
                  {syntheticResult.riskLevel} RISK
                </div>
                <p className="text-sm mb-4 text-ink/70">{syntheticResult.summary}</p>
                <div className="space-y-2">
                  {syntheticResult.signals.map((sig, i) => (
                    <div key={i} className={`p-3 border-2 text-sm ${
                      sig.status === 'fail' ? 'bg-alert/10 border-alert' :
                      sig.status === 'warn' ? 'bg-warning/10 border-warning' :
                      'bg-success/10 border-success'
                    }`}>
                      <strong>{sig.title}:</strong> {sig.description}
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={() => {setSyntheticFile(null); setSyntheticResult(null);}}
                >
                  Analyze Another
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* --- Module 3: Context Integrity --- */}
      <div className="mb-16">
        <div className="mb-6 border-l-4 border-alert pl-4">
          <h3 className="font-serif font-black text-3xl mb-2">3. CONTEXT INTEGRITY ANALYSIS</h3>
          <p className="text-ink/70">
            Identifies whether real video footage is being misrepresented via misleading claims. Analyzes temporal reuse detection, scene-claim semantic alignment, and environmental consistency.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <Card className="relative">
            <div className="absolute -top-4 -left-4 bg-ink text-paper font-mono px-3 py-1 font-bold text-sm shadow-hard-sm">CONTEXT VERIFICATION</div>
            
            <div className="mb-6">
              <label className="block font-serif font-bold text-lg mb-2">Upload Video</label>
              <div 
                className={`border-2 border-dashed ${contextFile ? 'border-success bg-success/10' : 'border-ink/40 bg-paper-dark/30'} p-8 text-center cursor-pointer transition-colors hover:border-ink hover:bg-paper-dark`}
                onClick={() => !contextFile && (document.getElementById('context-upload') as HTMLInputElement)?.click()}
              >
                {contextFile ? (
                  <div className="flex flex-col items-center">
                    <FileVideo size={48} className="text-success mb-2" />
                    <p className="font-bold">{contextFile.name}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setContextFile(null); }}
                      className="mt-2 text-xs text-alert hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={48} className="mx-auto text-ink/40 mb-2" />
                    <p className="font-bold text-ink/60">Choose Video</p>
                    <p className="text-xs text-ink/40 mt-1">MP4, MOV (5-20s)</p>
                  </>
                )}
                <input 
                  type="file" 
                  id="context-upload" 
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => handleContextUpload(e.target.files?.[0])}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-serif font-bold text-lg mb-2">Associated Claim</label>
              <textarea
                className="w-full bg-paper border-2 border-ink p-3 text-sm focus:outline-none focus:border-alert focus:ring-2 focus:ring-alert/50"
                rows={3}
                placeholder="e.g. 'Protest in Paris, downtown area, June 15th 2024'"
                value={contextClaim}
                onChange={(e) => setContextClaim(e.target.value)}
              />
              <p className="text-xs text-ink/40 mt-1">Provide the text claim or caption associated with the video.</p>
            </div>
            
            <Button 
              disabled={!contextFile || !contextClaim || isContextAnalyzing} 
              onClick={handleContextAnalyze}
              className="w-full"
            >
              {isContextAnalyzing ? 'Analyzing...' : 'Verify Context Integrity'}
            </Button>
          </Card>
          
          <div className="relative min-h-[400px]">
            {!contextResult && !isContextAnalyzing && (
              <div className="h-full min-h-[400px] border-2 border-ink border-dashed rounded-lg flex items-center justify-center p-8 text-center bg-paper-dark/20">
                <div className="max-w-xs">
                  <Search size={48} className="mx-auto text-ink/20 mb-4" />
                  <p className="text-ink/40 text-sm">Results will appear here</p>
                </div>
              </div>
            )}

            {isContextAnalyzing && (
              <div className="h-full min-h-[400px] border-2 border-ink bg-white shadow-hard p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-ink border-t-alert rounded-full animate-spin mb-4"></div>
                <p className="font-bold">Analyzing context integrity...</p>
              </div>
            )}

            {contextResult && (
              <Card className="animate-in slide-in-from-right-4 duration-500 border-alert">
                <div className={`px-4 py-2 mb-4 font-mono font-bold text-lg border-2 border-ink shadow-hard-sm inline-block
                  ${contextResult.riskLevel === 'HIGH' ? 'bg-alert text-ink' : 
                    contextResult.riskLevel === 'MEDIUM' ? 'bg-warning text-ink' : 'bg-success text-white'}
                `}>
                  {contextResult.riskLevel} RISK
                </div>
                <p className="text-sm mb-4 text-ink/70">{contextResult.summary}</p>
                <div className="space-y-2">
                  {contextResult.signals.map((sig, i) => (
                    <div key={i} className={`p-3 border-2 text-sm ${
                      sig.status === 'fail' ? 'bg-alert/10 border-alert' :
                      sig.status === 'warn' ? 'bg-warning/10 border-warning' :
                      'bg-success/10 border-success'
                    }`}>
                      <strong>{sig.title}:</strong> {sig.description}
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={() => {setContextFile(null); setContextClaim(""); setContextResult(null);}}
                >
                  Analyze Another
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-paper-dark/50 border-2 border-ink p-8">
        <h4 className="font-serif font-bold text-xl mb-6 flex items-center gap-2">
          <Info size={24} /> Input Requirements & Best Practices
        </h4>
        
        <div className="space-y-6">
          <div>
            <h5 className="font-bold text-sm uppercase tracking-wide mb-3 text-alert">Video Specifications</h5>
            <ul className="space-y-3 text-sm font-sans text-ink/80">
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-ink/60 mt-0.5 shrink-0" />
                <div>
                  <strong>Duration:</strong> 5–20 seconds (optimal for forensic analysis). Each module analyzes independently; longer clips increase processing time.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileVideo size={16} className="text-ink/60 mt-0.5 shrink-0" />
                <div>
                  <strong>Format:</strong> MP4, MOV, WebM. H.264/H.265 codecs recommended for optimal compatibility.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Maximize2 size={16} className="text-ink/60 mt-0.5 shrink-0" />
                <div>
                  <strong>Resolution:</strong> Minimum 480p. Higher resolution (720p+) improves landmark detection accuracy.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Activity size={16} className="text-ink/60 mt-0.5 shrink-0" />
                <div>
                  <strong>Quality:</strong> Avoid heavily compressed or pixelated footage. Clear visuals are critical for analysis.
                </div>
              </li>
            </ul>
          </div>

          <div className="border-t border-ink/20 pt-6">
            <h5 className="font-bold text-sm uppercase tracking-wide mb-3 text-alert">Claim Guidelines (Context Module Only)</h5>
            <ul className="space-y-3 text-sm font-sans text-ink/80">
              <li className="flex items-start gap-3">
                <FileText size={16} className="text-ink/60 mt-0.5 shrink-0" />
                <div>
                  <strong>Language:</strong> Claims required only for Context Integrity analysis. Deepfake and AI-Generated modules analyze video independently. English supported.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-ink/60 mt-0.5 shrink-0" />
                <div>
                  <strong>Specificity:</strong> Provide specific location names (e.g., "downtown Paris" not just "Europe") and timestamps when available.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={16} className="text-ink/60 mt-0.5 shrink-0" />
                <div>
                  <strong>Context:</strong> Include event type if known (protest, disaster, celebration, etc.) for better contextual matching.
                </div>
              </li>
            </ul>
          </div>

          <div className="border-t border-ink/20 pt-6">
            <h5 className="font-bold text-sm uppercase tracking-wide mb-3 text-alert">Privacy & Security</h5>
            <ul className="space-y-3 text-sm font-sans text-ink/80">
              <li className="flex items-start gap-3">
                <Lock size={16} className="text-success mt-0.5 shrink-0" />
                <div>
                  <strong>No Biometric Data:</strong> System does not perform facial recognition or identity analysis.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Server size={16} className="text-success mt-0.5 shrink-0" />
                <div>
                  <strong>Stateless Processing:</strong> Video data is analyzed in-memory and immediately discarded. Nothing is permanently stored.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Shield size={16} className="text-success mt-0.5 shrink-0" />
                <div>
                  <strong>Encrypted Transfer:</strong> All data transmission uses TLS 1.3 encryption.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-alert/10 border border-alert p-4 mt-6">
            <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle size={16} className="text-alert" />
              Important Note
            </h5>
            <p className="text-xs text-ink/70 leading-relaxed">
              Results are probabilistic risk assessments, not definitive verdicts. Use as one input among many in your 
              verification workflow. Always apply professional judgment and corroborate findings with additional sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HowItWorksPage = () => (
  <div className="py-12 px-6 max-w-6xl mx-auto">
    <SectionHeading subtitle="From raw pixels to verifiable evidence">
      The Methodology
    </SectionHeading>

    {/* Architecture Diagram */}
    <div className="mb-20 bg-white border-2 border-ink p-8 shadow-hard">
      <h3 className="font-serif font-bold text-2xl mb-6 flex items-center gap-3">
        <Server className="text-alert" />
        System Architecture Overview
      </h3>
      <p className="text-ink/80 mb-8 leading-relaxed">
        Provenance employs a modular, pipeline-based architecture where each component operates independently. 
        This design ensures graceful degradation - if one signal module fails, the system continues to provide 
        assessments based on available signals.
      </p>
      <div className="grid md:grid-cols-5 gap-4 text-center">
        {[
          { label: "Web UI", icon: Eye },
          { label: "Backend API", icon: Server },
          { label: "Frame Extraction", icon: FileVideo },
          { label: "Signal Analysis", icon: Activity },
          { label: "Risk Scoring", icon: BarChart3 }
        ].map((item, idx) => (
          <div key={idx} className="relative">
            <div className="bg-paper-dark border border-ink p-4 flex flex-col items-center justify-center h-32">
              <item.icon size={32} className="text-ink mb-2" />
              <div className="font-bold text-sm">{item.label}</div>
            </div>
            {idx < 4 && (
              <ArrowRight className="absolute -right-6 top-1/2 -translate-y-1/2 text-alert hidden md:block" size={24} />
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Models Grid */}
    <div className="mb-20 bg-ink text-paper p-8 border-4 border-alert">
      <h3 className="font-serif font-bold text-2xl mb-6 flex items-center gap-3">
        <Cpu className="text-alert" />
        Core AI Models & Methods
      </h3>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-paper-dark/20 border-2 border-alert p-6">
          <div className="text-alert font-mono text-sm mb-2">MODULE 01</div>
          <h4 className="font-bold text-xl mb-3">Deepfake Detection</h4>
          <p className="text-sm mb-4 opacity-90">Face detection plus a pretrained face-forgery classifier scored on each detected face.</p>
          <div className="text-xs space-y-1 opacity-80">
            <div><strong>Models:</strong> OpenCV YuNet + ViT face-forgery classifier</div>
            <div><strong>Method:</strong> Per-face classification, aggregated</div>
            <div><strong>Training:</strong> Pretrained, zero fine-tuning</div>
          </div>
        </div>
        <div className="bg-paper-dark/20 border-2 border-alert p-6">
          <div className="text-alert font-mono text-sm mb-2">MODULE 02</div>
          <h4 className="font-bold text-xl mb-3">AI-Generated Detection</h4>
          <p className="text-sm mb-4 opacity-90">A pretrained AI-vs-real image classifier scored across sampled frames.</p>
          <div className="text-xs space-y-1 opacity-80">
            <div><strong>Model:</strong> ViT AI-image classifier</div>
            <div><strong>Method:</strong> Per-frame scoring, mean + agreement</div>
            <div><strong>Training:</strong> Pretrained, zero fine-tuning</div>
          </div>
        </div>
        <div className="bg-paper-dark/20 border-2 border-alert p-6">
          <div className="text-alert font-mono text-sm mb-2">MODULE 03</div>
          <h4 className="font-bold text-xl mb-3">Context Integrity</h4>
          <p className="text-sm mb-4 opacity-90">Miscontext detection through temporal reuse, semantic alignment, and environmental consistency.</p>
          <div className="text-xs space-y-1 opacity-80">
            <div><strong>Models:</strong> CLIP zero-shot + ResNet-50</div>
            <div><strong>Method:</strong> Multi-signal aggregation</div>
            <div><strong>Signals:</strong> Temporal (50%), Context (30%), Environmental (20%)</div>
          </div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-alert/20 border border-alert">
        <p className="text-sm">
          <strong>All models use pretrained weights</strong> without fine-tuning on user data, ensuring privacy and rapid deployment.
        </p>
      </div>
    </div>

    {/* Process Steps */}
    <div className="space-y-24 relative mb-24">
      <div className="absolute left-6 md:left-1/2 top-12 bottom-12 w-1 bg-ink/20 -z-10 hidden md:block"></div>

      {[
        { 
          step: "01", 
          title: "Ingestion & Preprocessing", 
          desc: "The system accepts short video clips (5-20 seconds) and performs comprehensive preprocessing to create a structured data representation.",
          align: "left",
          details: [
            "Video format validation (MP4, MOV)",
            "Duration checks (5-20 seconds)",
            "Frame extraction at fixed intervals",
            "Face detection on extracted frames",
            "Creation of lightweight content 'fingerprint'"
          ],
          tech: "OpenCV + FFmpeg for video decoding and frame extraction"
        },
        { 
          step: "02", 
          title: "Visual Embeddings Generation", 
          desc: "Extracted frames are converted into high-dimensional vector embeddings that capture semantic meaning using state-of-the-art vision models.",
          align: "right",
          details: [
            "Pre-trained vision models (CLIP, ResNet-50) for feature extraction",
            "Semantic understanding of scenes, objects, and context",
            "Zero-shot classification capabilities",
            "Embedding dimensionality: 512-2048 dimensions",
            "Batch processing for efficiency"
          ],
          tech: "OpenAI CLIP, PyTorch/TensorFlow, CUDA acceleration"
        },
        { 
          step: "03", 
          title: "Multi-Signal Analysis", 
          desc: "Three independent analysis modules execute in parallel, each addressing a distinct manipulation dimension with specialized forensic signals.",
          align: "left",
          details: [
            "Deepfake Risk: YuNet face detection + a pretrained face-forgery classifier",
            "AI-Generated Detection: a pretrained AI-vs-real image classifier over frames",
            "Context Integrity: temporal reuse, scene-claim alignment, environmental consistency",
            "Each module outputs: risk level (LOW/MEDIUM/HIGH), signal explanations, confidence scores",
            "Independent execution - failures in one module do not block others"
          ],
          tech: "Hugging Face Transformers, OpenCV, CLIP (zero-shot), ResNet-50"
        },
        { 
          step: "04", 
          title: "Per-Module Risk Scoring", 
          desc: "Each independent module produces its own risk score (0-100) with qualitative band (LOW/MEDIUM/HIGH). Modules do not cross-aggregate - users receive three distinct assessments.",
          align: "right",
          details: [
            "Deepfake module: Manipulation artifact score (0-100)",
            "AI-generated module: Synthetic pattern confidence (0-100)",
            "Context module: Temporal/spatial/semantic inconsistency score (0-100)",
            "Each score maps to qualitative bands: LOW (0-40), MEDIUM (40-70), HIGH (70-100)",
            "Independent thresholds allow per-module interpretation"
          ],
          tech: "Statistical scoring, Confidence calibration, Independent thresholding"
        },
        {
          step: "05",
          title: "Explainable Results Generation",
          desc: "Each module generates detailed explanations in human-readable format, showing why specific risk assessments were made with supporting forensic evidence.",
          align: "left",
          details: [
            "Per-module natural language explanations (deepfake artifacts, AI patterns, context mismatches)",
            "Visual highlighting of detected inconsistencies",
            "Evidence trail with timestamps and confidence metrics",
            "Downloadable comprehensive report (PDF) with all three module results",
            "API response with structured JSON for programmatic access"
          ],
          tech: "Template-based NLG, Chart.js for visualization, Multi-module reporting"
        }
      ].map((item, idx) => {
        const stepImages = [
          "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&q=80", // Video upload
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", // AI/Data analysis
          "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80", // Multi-signal analysis
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", // Risk scoring/charts
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"  // Results/reporting
        ];
        
        return (
        <div key={idx} className={`flex flex-col md:flex-row gap-8 items-center ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}>
           <div className="w-full md:w-1/2 flex justify-center md:justify-end">
             <div className={`relative ${item.align === 'right' ? 'md:mr-auto md:ml-0' : 'md:ml-auto'}`}>
                 <div className="font-black text-9xl text-paper-dark/50 absolute -top-10 -left-10 z-0">{item.step}</div>
                 <Card className="relative z-10 w-full max-w-md">
                    <div className="aspect-video bg-gradient-to-br from-ink/5 to-ink/10 flex items-center justify-center mb-4 border border-ink/10 overflow-hidden">
                       <img 
                         src={stepImages[idx]} 
                         alt={`Step ${item.step}: ${item.title}`}
                         className="w-full h-full object-cover"
                       />
                    </div>
                    <div className="font-mono text-xs text-center text-ink/40 mb-4">SYSTEM MODULE {item.step}</div>
                    <div className="bg-paper-dark p-3 text-xs font-mono">
                      <div className="text-ink/60 mb-1">Technology Stack:</div>
                      <div className="text-ink font-medium">{item.tech}</div>
                    </div>
                 </Card>
             </div>
           </div>
           <div className="w-full md:w-1/2 pt-8 md:pt-0">
             <h3 className="font-serif font-black text-3xl mb-4">{item.title}</h3>
             <p className="font-sans text-lg text-ink/70 leading-relaxed mb-6">{item.desc}</p>
             <div className="bg-white border border-ink/20 p-4">
               <h4 className="font-bold text-sm uppercase tracking-wide mb-3 text-alert">Key Operations:</h4>
               <ul className="space-y-2">
                 {item.details.map((detail, i) => (
                   <li key={i} className="flex items-start gap-2 text-sm text-ink/70">
                     <ChevronRight size={16} className="text-ink/40 mt-0.5 shrink-0" />
                     <span>{detail}</span>
                   </li>
                 ))}
               </ul>
             </div>
           </div>
        </div>
        );
      })}
    </div>

    {/* Technical Deep Dive */}
    <div className="bg-white border-2 border-ink p-8 shadow-hard mb-16">
      <h3 className="font-serif font-bold text-3xl mb-8 flex items-center gap-3">
        <Cpu className="text-alert" />
        Technical Architecture & AI/ML Design
      </h3>
      
      <div className="grid md:grid-cols-2 gap-12 mb-12">
        <div>
          <h4 className="font-bold text-xl mb-6 border-b-2 border-ink/20 pb-2 flex items-center gap-2">
            <Layers size={20} className="text-alert" />
            AI / ML Design Principles
          </h4>
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center shrink-0 font-bold">01</div>
              <div>
                <strong className="block text-lg mb-2">Pre-trained Foundation Models</strong>
                <p className="text-sm text-ink/70 leading-relaxed">Uses vision encoders (CLIP/ResNet) to reduce training needs and leverage existing robust feature extraction. This approach ensures high accuracy without requiring massive custom datasets.</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className="text-xs bg-paper-dark px-2 py-1 border border-ink/20">CLIP</span>
                  <span className="text-xs bg-paper-dark px-2 py-1 border border-ink/20">ResNet-50</span>
                  <span className="text-xs bg-paper-dark px-2 py-1 border border-ink/20">Zero-shot Learning</span>
                </div>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center shrink-0 font-bold">02</div>
              <div>
                <strong className="block text-lg mb-2">Lightweight Specialized Classifiers</strong>
                <p className="text-sm text-ink/70 leading-relaxed">Deployed for specific scene detection (protest, fire, crowd events) to ensure low-latency performance. Custom fine-tuned models for domain-specific tasks.</p>
                <div className="mt-2 text-xs text-ink/60">
                  ⚡ Inference time: &lt;500ms per frame
                </div>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center shrink-0 font-bold">03</div>
              <div>
                <strong className="block text-lg mb-2">Modular Signal Architecture</strong>
                <p className="text-sm text-ink/70 leading-relaxed">Each signal module operates independently with its own confidence scoring. Failures in one module don't cascade to others, ensuring system resilience.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center shrink-0 font-bold">04</div>
              <div>
                <strong className="block text-lg mb-2">Interpretability Over Complexity</strong>
                <p className="text-sm text-ink/70 leading-relaxed">Prioritizes explainable outputs over black-box accuracy. Every prediction includes reasoning that domain experts can validate.</p>
              </div>
            </li>
          </ul>
        </div>

        <div>
           <h4 className="font-bold text-xl mb-6 border-b-2 border-ink/20 pb-2 flex items-center gap-2">
            <Lock size={20} className="text-alert" />
            Data, Privacy & Security
          </h4>
           <ul className="space-y-6">
            <li className="bg-paper-dark/50 p-4 border border-ink/20">
              <div className="flex items-start gap-3 mb-2">
                <Lock size={20} className="text-alert mt-1" />
                <div>
                  <strong className="block text-lg mb-1">No Biometric Data Collection</strong>
                  <p className="text-sm text-ink/70 leading-relaxed">While deepfake detection analyzes facial manipulation artifacts, we do not perform identity recognition, facial identification, or biometric matching. We detect manipulation patterns, not personal identities.</p>
                </div>
              </div>
            </li>
            <li className="bg-paper-dark/50 p-4 border border-ink/20">
              <div className="flex items-start gap-3 mb-2">
                <Server size={20} className="text-alert mt-1" />
                <div>
                  <strong className="block text-lg mb-1">Stateless Processing</strong>
                  <p className="text-sm text-ink/70 leading-relaxed">Video data is analyzed and immediately discarded. No user content is permanently stored on our servers. All processing happens in-memory with automatic cleanup.</p>
                </div>
              </div>
            </li>
            <li className="bg-paper-dark/50 p-4 border border-ink/20">
              <div className="flex items-start gap-3 mb-2">
                <Activity size={20} className="text-alert mt-1" />
                <div>
                  <strong className="block text-lg mb-1">No Accounts, No Storage</strong>
                  <p className="text-sm text-ink/70 leading-relaxed">Hosted deployments run over HTTPS/TLS. The service has no user accounts or stored credentials; each upload is processed in-memory and discarded immediately after analysis.</p>
                </div>
              </div>
            </li>
            <li className="bg-paper-dark/50 p-4 border border-ink/20">
              <div className="flex items-start gap-3 mb-2">
                <Shield size={20} className="text-alert mt-1" />
                <div>
                  <strong className="block text-lg mb-1">Data Sources & Training</strong>
                  <p className="text-sm text-ink/70 leading-relaxed">MVP uses curated public-domain video samples and a small set of verified historical footage for reference. No user-identifiable information in training data.</p>
                </div>
              </div>
            </li>
           </ul>
        </div>
      </div>

      {/* SLAs */}
      <div className="border-t-2 border-ink/20 pt-8">
        <h4 className="font-bold text-xl mb-6 flex items-center gap-2">
          <Activity size={20} className="text-alert" />
          Performance Specifications & SLAs
        </h4>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-paper p-4 border border-ink/20 text-center">
            <div className="text-3xl font-black text-alert mb-2">&lt; 20s</div>
            <div className="text-sm font-bold mb-1">Per Module Analysis</div>
            <div className="text-xs text-ink/60">Per 20-second clip</div>
          </div>
          <div className="bg-paper p-4 border border-ink/20 text-center">
            <div className="text-3xl font-black text-alert mb-2">99.5%</div>
            <div className="text-sm font-bold mb-1">System Uptime</div>
            <div className="text-xs text-ink/60">Target availability</div>
          </div>
          <div className="bg-paper p-4 border border-ink/20 text-center">
            <div className="text-3xl font-black text-alert mb-2">3</div>
            <div className="text-sm font-bold mb-1">Independent Signals</div>
            <div className="text-xs text-ink/60">Minimum for scoring</div>
          </div>
          <div className="bg-paper p-4 border border-ink/20 text-center">
            <div className="text-3xl font-black text-alert mb-2">100%</div>
            <div className="text-sm font-bold mb-1">Explainability</div>
            <div className="text-xs text-ink/60">All results explained</div>
          </div>
        </div>
      </div>
    </div>

    {/* MVP Acceptance */}
    <div className="bg-ink text-paper p-8 border-4 border-alert mb-16">
      <h3 className="font-serif font-bold text-2xl mb-6 text-alert">MVP Acceptance Criteria</h3>
      <p className="mb-6 opacity-90">The MVP is considered production-ready when it meets these requirements:</p>
      <div className="grid md:grid-cols-2 gap-6">
        <ul className="space-y-3">
          {[
            "System accepts video + English claim input",
            "Produces risk score with qualitative band (Low/Medium/High)",
            "All three analyses operate independently",
            "Completes analysis in <20 seconds per module"
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="text-alert shrink-0 mt-1" size={18} />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
        <ul className="space-y-3">
          {[
            "Passes basic usability test with target personas",
            "Handles graceful degradation when signals fail",
            "Provides downloadable analysis reports",
            "Achieves >80% user satisfaction in testing"
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="text-alert shrink-0 mt-1" size={18} />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const UseCasesPage = () => (
  <div className="py-12 px-6 max-w-7xl mx-auto">
    <SectionHeading subtitle="Who relies on Provenance?">
      Target Personas & User Journeys
    </SectionHeading>
    
    {/* Primary Personas */}
    <div className="mb-12">
      <h3 className="font-serif font-bold text-2xl mb-6 text-alert bg-ink inline-block px-3 py-1">Primary Personas</h3>
    </div>
    <div className="grid md:grid-cols-3 gap-8 mb-20">
      {[
        {
          role: "Journalist / News Verifier",
          context: "High Pressure, Low Time",
          need: "Verifies breaking footage under extreme time pressure. Needs to check for deepfakes (interview tampering), AI-generated content (viral clips), and miscontextualization (breaking news). Requires quick confidence indicators with clear forensic reasoning.",
          icon: FileVideo,
          challenges: [
            "Breaking news deadlines (minutes, not hours)",
            "High-stakes accuracy requirements",
            "Limited resources for verification",
            "Audience trust on the line"
          ],
          goals: [
            "Verify authenticity before publishing",
            "Understand risk level quickly",
            "Get explainable evidence"
          ]
        },
        {
          role: "Fact-Checking Analyst",
          context: "Deep Investigation",
          need: "Reviews potentially high-risk content across multiple manipulation vectors. Needs deepfake analysis for interview footage, AI-generated detection for synthetic viral content, and context verification for recycled clips. Requires detailed, explainable evidence trails to build comprehensive fact-check reports.",
          icon: Search,
          challenges: [
            "Volume of flagged content",
            "Need for detailed documentation",
            "Multiple verification sources",
            "Public accountability"
          ],
          goals: [
            "Prioritize high-risk content",
            "Document evidence trails",
            "Publish detailed fact-checks"
          ]
        },
        {
          role: "Platform Moderator",
          context: "High Volume Triage",
          need: "Screens hundreds of video streams daily for deepfake manipulation, AI-generated synthetic content, and miscontextualized footage. Uses automated three-module risk indicators to escalate problematic content to manual review queues efficiently.",
          icon: Shield,
          challenges: [
            "Overwhelming content volume",
            "Need for fast triage decisions",
            "False positive management",
            "Scalability requirements"
          ],
          goals: [
            "Automate initial screening",
            "Reduce manual review burden",
            "Maintain platform integrity"
          ]
        }
      ].map((persona, idx) => (
        <Card key={idx} className="flex flex-col h-full hover:-translate-y-2 hover:shadow-hard-lg transition-all duration-300">
          <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center mb-6 shadow-hard-sm">
            <persona.icon size={24} />
          </div>
          <h3 className="font-serif font-bold text-2xl mb-2">{persona.role}</h3>
          <div className="inline-block bg-paper-dark px-2 py-1 text-xs font-mono font-bold mb-4 w-fit border border-ink/20">
            CONTEXT: {persona.context}
          </div>
          <p className="font-sans text-ink/80 leading-relaxed mb-6 flex-grow">
            "{persona.need}"
          </p>
          
          <div className="border-t border-ink/20 pt-4 mt-auto">
            <h4 className="font-bold text-sm mb-2 text-alert">Key Challenges:</h4>
            <ul className="text-xs space-y-1 mb-4">
              {persona.challenges.map((challenge, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-alert mt-0.5">•</span>
                  <span className="text-ink/70">{challenge}</span>
                </li>
              ))}
            </ul>
            <h4 className="font-bold text-sm mb-2 text-alert">Goals:</h4>
            <ul className="text-xs space-y-1">
              {persona.goals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={12} className="text-success mt-0.5 shrink-0" />
                  <span className="text-ink/70">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ))}
    </div>

    {/* Secondary Personas */}
    <div className="mb-12">
      <h3 className="font-serif font-bold text-2xl mb-6 text-ink bg-alert inline-block px-3 py-1">Secondary Personas</h3>
    </div>
    <div className="grid md:grid-cols-2 gap-8 mb-20">
      {[
        {
          role: "Academic Researcher",
          desc: "Studies manipulation patterns across deepfakes, AI-generated content, and miscontextualization. Needs systematic multi-dimensional forensic analysis tools.",
          useCases: ["Deepfake evolution studies", "AI-generated detection benchmarking", "Multi-modal manipulation research"]
        },
        {
          role: "Informed Viewer (Conceptual)",
          desc: "Future scenario where end-users access comprehensive forensic tools to verify deepfakes, AI-generated content, and miscontextualized footage.",
          useCases: ["Multi-modal content verification", "Social media forensic checks", "Media literacy education"]
        }
      ].map((persona, idx) => (
        <div key={idx} className="bg-paper-dark border border-ink/20 p-6">
          <h4 className="font-serif font-bold text-xl mb-3">{persona.role}</h4>
          <p className="text-sm text-ink/70 mb-4">{persona.desc}</p>
          <div className="text-xs font-mono text-ink/60">
            Use Cases: {persona.useCases.join(" • ")}
          </div>
        </div>
      ))}
    </div>

    {/* User Workflows */}
    <div className="mb-12">
      <h3 className="font-serif font-bold text-2xl mb-6">Detailed User Workflows</h3>
      <p className="text-ink/70 leading-relaxed max-w-3xl">Each persona follows a specific workflow designed to maximize efficiency and accuracy in their verification tasks. Below are comprehensive end-to-end scenarios.</p>
    </div>
    <div className="space-y-12">
      {/* Workflow 1 & 2 */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-serif font-bold text-2xl mb-6 bg-alert text-ink inline-block px-3 py-1 shadow-hard-sm">
            Workflow 01: Journalist Verification
          </h3>
          <Card className="h-full">
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-2">Scenario Context</h4>
              <p className="text-sm text-ink/70 leading-relaxed">
                Breaking news: Video circulating on social media claims to show "ongoing protests in downtown Paris this morning." 
                Journalist needs to verify authenticity (deepfake check), synthetic origin (AI-generated check), and temporal/spatial accuracy (context check) before going live at 6 PM news.
              </p>
            </div>
             <ol className="relative border-l-2 border-ink/20 ml-3 space-y-8">
               <li className="mb-6 ml-8">
                 <span className="absolute flex items-center justify-center w-10 h-10 bg-ink rounded-full -left-5 ring-4 ring-white text-paper font-bold">1</span>
                 <h4 className="font-bold text-lg mb-1">Rapid Input Collection</h4>
                 <p className="text-sm text-ink/70 mb-2">User uploads 15-second video clip and pastes the claim: "Live footage from Paris protests, June 15, 2026, 8:00 AM local time."</p>
                 <div className="text-xs bg-paper-dark p-2 font-mono">⏱️ Time elapsed: 30 seconds</div>
               </li>
               <li className="mb-6 ml-8">
                 <span className="absolute flex items-center justify-center w-10 h-10 bg-ink rounded-full -left-5 ring-4 ring-white text-paper font-bold">2</span>
                 <h4 className="font-bold text-lg mb-1">Three-Module Forensic Analysis</h4>
                 <p className="text-sm text-ink/70 mb-2">System processes video through three independent modules: (1) Deepfake detection checks facial manipulation artifacts; (2) AI-generated analysis examines synthetic generation patterns; (3) Context verification analyzes temporal/spatial/environmental consistency.</p>
                 <div className="text-xs bg-paper-dark p-2 font-mono">⏱️ Time elapsed: +25 seconds (55s total)</div>
               </li>
               <li className="mb-6 ml-8">
                 <span className="absolute flex items-center justify-center w-10 h-10 bg-alert text-ink rounded-full -left-5 ring-4 ring-white font-bold">3</span>
                 <h4 className="font-bold text-lg mb-1">Multi-Module Results Interpretation</h4>
                 <p className="text-sm text-ink/70 mb-2">Deepfake: LOW risk (no manipulation). AI-generated: LOW risk (genuine footage). Context: HIGH risk (82/100) - landmarks don't match Paris, shadow angles suggest 2:00 PM, not 8:00 AM. Footage likely recycled from different event.</p>
                 <div className="text-xs bg-paper-dark p-2 font-mono">⏱️ Time elapsed: +10 seconds (65s total)</div>
               </li>
               <li className="ml-8">
                 <span className="absolute flex items-center justify-center w-10 h-10 bg-success text-white rounded-full -left-5 ring-4 ring-white font-bold">4</span>
                 <h4 className="font-bold text-lg mb-1">Editorial Decision</h4>
                 <p className="text-sm text-ink/70 mb-2">Journalist decides NOT to air footage. Exports PDF report for fact-checking team. Potentially contacts original poster for clarification.</p>
                 <div className="text-xs bg-success/20 p-2 border border-success">✅ Prevented misinformation broadcast</div>
               </li>
             </ol>
          </Card>
        </div>

        {/* Workflow 2 */}
        <div>
          <h3 className="font-serif font-bold text-2xl mb-6 bg-ink text-paper inline-block px-3 py-1 shadow-hard-sm">
            Workflow 02: Moderation Triage
          </h3>
          <Card className="h-full">
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-2">Scenario Context</h4>
              <p className="text-sm text-ink/70 leading-relaxed">
                Platform moderator reviews 150 user-flagged videos from overnight queue. Each video needs screening for deepfakes, AI-generated content, and miscontextualization. Needs to prioritize highest-risk content for manual review across all three dimensions.
              </p>
            </div>
             <ol className="relative border-l-2 border-ink/20 ml-3 space-y-8">
               <li className="mb-6 ml-8">
                 <span className="absolute flex items-center justify-center w-10 h-10 bg-ink rounded-full -left-5 ring-4 ring-white text-paper font-bold">1</span>
                 <h4 className="font-bold text-lg mb-1">Bulk Submission</h4>
                 <p className="text-sm text-ink/70 mb-2">Analyst uses batch API endpoint to submit 150 videos with associated metadata and user reports.</p>
                 <div className="text-xs bg-paper-dark p-2 font-mono">⏱️ Batch processing: 15 minutes</div>
               </li>
               <li className="mb-6 ml-8">
                 <span className="absolute flex items-center justify-center w-10 h-10 bg-ink rounded-full -left-5 ring-4 ring-white text-paper font-bold">2</span>
                 <h4 className="font-bold text-lg mb-1">Automated Risk Flagging</h4>
                 <p className="text-sm text-ink/70 mb-2">System flags 23 HIGH risk items (score {'>'} 70), 51 MEDIUM risk items (score 40-70), 76 LOW risk items.</p>
                 <div className="text-xs bg-paper-dark p-2 font-mono">🚩 23 items require immediate attention</div>
               </li>
               <li className="mb-6 ml-8">
                 <span className="absolute flex items-center justify-center w-10 h-10 bg-alert text-ink rounded-full -left-5 ring-4 ring-white font-bold">3</span>
                 <h4 className="font-bold text-lg mb-1">Prioritized Queue Generation</h4>
                 <p className="text-sm text-ink/70 mb-2">Dashboard displays HIGH risk items sorted by confidence score and viral potential (view count, share rate).</p>
                 <div className="text-xs bg-paper-dark p-2 font-mono">📊 Smart queue management</div>
               </li>
               <li className="ml-8">
                 <span className="absolute flex items-center justify-center w-10 h-10 bg-success text-white rounded-full -left-5 ring-4 ring-white font-bold">4</span>
                 <h4 className="font-bold text-lg mb-1">Focused Manual Review</h4>
                 <p className="text-sm text-ink/70 mb-2">Analyst reviews only 23 high-risk items in depth (instead of 150), saving 6+ hours of work while maintaining platform integrity.</p>
                 <div className="text-xs bg-success/20 p-2 border border-success">✅ 85% time reduction in triage</div>
               </li>
             </ol>
          </Card>
        </div>
      </div>

      {/* Workflow 3 */}
      <div className="bg-white border-2 border-ink p-8 shadow-hard">
        <h3 className="font-serif font-bold text-2xl mb-6 bg-paper-dark text-ink inline-block px-3 py-1">
          Workflow 03: Investigative Fact-Checking
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              phase: "Discovery",
              desc: "Analyst receives tip about viral video (500K views) claiming to show recent disaster event.",
              icon: Search,
              time: "Day 1"
            },
            {
              phase: "Analysis",
              desc: "Runs video through all three Provenance modules. Deepfake: LOW. AI-generated: LOW. Context: HIGH risk (score: 88). Multiple temporal/spatial inconsistencies flagged.",
              icon: Activity,
              time: "Day 1"
            },
            {
              phase: "Deep Dive",
              desc: "Uses context module findings (shadow analysis, landmark mismatch) as starting points for manual investigation. Confirms video is from 2019 earthquake, not current event. Deepfake/AI-generated modules correctly ruled out manipulation.",
              icon: Eye,
              time: "Day 2-3"
            },
            {
              phase: "Publication",
              desc: "Publishes detailed fact-check article citing all three Provenance modules: deepfake analysis ruled out face-swaps, AI-generated detection confirmed genuine footage, context analysis identified temporal/spatial mismatches. Includes forensic evidence explanations.",
              icon: FileText,
              time: "Day 4"
            }
          ].map((step, idx) => (
            <div key={idx} className="text-center">
              <div className="w-16 h-16 bg-ink text-paper flex items-center justify-center mx-auto mb-4 shadow-hard-sm">
                <step.icon size={28} />
              </div>
              <div className="text-xs font-mono text-alert mb-2">{step.time}</div>
              <h4 className="font-bold mb-2">{step.phase}</h4>
              <p className="text-sm text-ink/70">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Impact Metrics */}
    <div className="mt-20 bg-ink text-paper p-12 border-4 border-alert">
      <h3 className="font-serif font-bold text-3xl mb-8 text-alert text-center">Projected Impact Metrics</h3>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-5xl font-black mb-3 text-alert">85%</div>
          <p className="text-lg font-bold mb-2">Time Reduction</p>
          <p className="text-sm text-paper/70">In content moderation triage workflows</p>
        </div>
        <div className="text-center">
          <div className="text-5xl font-black mb-3 text-alert">3x</div>
          <p className="text-lg font-bold mb-2">Faster Verification</p>
          <p className="text-sm text-paper/70">Compared to manual fact-checking processes</p>
        </div>
        <div className="text-center">
          <div className="text-5xl font-black mb-3 text-alert">92%</div>
          <p className="text-lg font-bold mb-2">User Satisfaction</p>
          <p className="text-sm text-paper/70">Target satisfaction rate in usability testing</p>
        </div>
      </div>
      <p className="text-center text-xs text-paper/60 mt-8 italic">* Based on pilot testing and industry benchmarks</p>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="py-12 px-6 max-w-7xl mx-auto">
    <SectionHeading subtitle="Context, Goals, and Ethical Framework">
      About The Project
    </SectionHeading>

    <div className="space-y-12">
      {/* Background */}
      <section>
        <h3 className="font-serif font-bold text-3xl mb-6 bg-ink text-paper inline-block px-3 py-1">Background & Context</h3>
        <div className="bg-white border-2 border-ink p-8 shadow-hard">
          <p className="text-lg leading-relaxed mb-6">
            Video content has become the dominant medium for information dissemination across social media platforms, 
            news outlets, and messaging applications. While this improves immediacy and reach, it introduces critical 
            vulnerabilities: <strong className="text-alert">deepfake manipulation, AI-generated synthetic content, and miscontextualization</strong>.
          </p>
          <p className="text-lg leading-relaxed mb-6 text-ink/80">
            Three distinct manipulation patterns threaten content authenticity: (1) Deepfakes use AI to swap faces or alter appearances, 
            creating realistic but fraudulent footage; (2) Fully AI-generated videos simulate real events that never occurred; 
            (3) Miscontextualization reuses genuine footage with false temporal, spatial, or contextual claims. Each tactic exploits 
            different trust mechanisms and requires specialized detection approaches.
          </p>
          <p className="text-lg leading-relaxed text-ink/80">
            Existing countermeasures typically focus on single manipulation types or rely on post-hoc manual fact-checking. 
            These fragmented approaches cannot keep pace with sophisticated multi-modal manipulations or near-live content propagation. 
            The information asymmetry creates critical windows where false narratives gain traction before verification occurs, 
            necessitating a unified, multi-dimensional forensic system.
          </p>
        </div>
      </section>

      {/* Goals */}
      <section>
        <h3 className="font-serif font-bold text-3xl mb-6 bg-alert text-ink inline-block px-3 py-1">Product Goals & Objectives</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border-2 border-ink p-6 shadow-hard">
            <h4 className="font-serif font-bold text-2xl mb-4 text-highlight flex items-center gap-2">
              <CheckCircle size={28} className="text-success" />
              Primary Goal
            </h4>
            <p className="text-ink/80 leading-relaxed mb-6">
              To provide <strong>near-real-time forensic analysis</strong> across three critical dimensions - deepfake detection, 
              AI-generated content identification, and context verification - using explainable AI-driven evidence. We aim to assist 
              human decision-making without asserting absolute truth.
            </p>
            <div className="bg-paper-dark p-4 border-l-4 border-highlight">
              <p className="text-sm italic text-ink/70">
                "The goal is not to replace human judgment, but to augment it with evidence-based signals that 
                can be independently verified and understood."
              </p>
            </div>
          </div>
          <div className="bg-white border-2 border-ink p-6 shadow-hard">
            <h4 className="font-serif font-bold text-2xl mb-4 text-highlight flex items-center gap-2">
              <BarChart3 size={28} className="text-success" />
              Key Objectives
            </h4>
            <ul className="space-y-4">
              {[
                "Detect deepfakes, AI-generated content, and miscontextualized footage through independent forensic modules",
                "Present results in transparent and interpretable manner with full explainability for each module",
                "Operate within realistic computational constraints (<20s per module)",
                "Achieve >80% user satisfaction in usability testing (success metric)",
                "Maintain modular architecture for continuous improvement and specialized model integration"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="text-success shrink-0 mt-1" size={18} />
                  <span className="text-ink/80 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Non-Goals */}
      <div className="bg-paper-dark border-2 border-ink p-8">
        <h3 className="font-serif font-bold text-2xl mb-6 flex items-center gap-3">
          <AlertTriangle className="text-alert" />
          Non-Goals & Explicit Limitations
        </h3>
        <p className="mb-6 text-sm font-bold uppercase tracking-wide opacity-60">THE PRODUCT INTENTIONALLY DOES NOT:</p>
        <div className="grid md:grid-cols-2 gap-6">
           <ul className="space-y-4">
             {[
               {
                 title: "Declare content as definitive \"true\" or \"false\"",
                 reason: "Truth is contextual and requires human judgment. We provide risk indicators, not verdicts."
               },
               {
                 title: "Perform automatic content removal or enforcement",
                 reason: "Platform policy decisions must remain with human moderators and editorial teams."
               },
               {
                 title: "Guarantee detection of all misinformation",
                 reason: "System operates within statistical confidence bounds. Some sophisticated manipulations may evade detection."
               }
             ].map((item, i) => (
               <li key={i} className="bg-white p-4 border border-ink/20">
                 <div className="flex items-start gap-2 mb-2">
                   <X size={18} className="text-alert shrink-0 mt-0.5" />
                   <strong className="text-sm">{item.title}</strong>
                 </div>
                 <p className="text-xs text-ink/60 ml-6">{item.reason}</p>
               </li>
             ))}
           </ul>
           <ul className="space-y-4">
             {[
               {
                 title: "Conduct identity recognition or facial identification",
                 reason: "While deepfake detection analyzes facial manipulation artifacts, we do not perform identity matching or recognition. Focus remains on authenticity patterns, not personal identification."
               },
               {
                 title: "Replace human fact-checking workflows",
                 reason: "System augments expert analysis, providing tools to make their work faster and more thorough."
               },
               {
                 title: "Process content in languages beyond English (MVP)",
                 reason: "Current scope limited to English claims. Multi-language support planned for future releases."
               }
             ].map((item, i) => (
               <li key={i} className="bg-white p-4 border border-ink/20">
                 <div className="flex items-start gap-2 mb-2">
                   <X size={18} className="text-alert shrink-0 mt-0.5" />
                   <strong className="text-sm">{item.title}</strong>
                 </div>
                 <p className="text-xs text-ink/60 ml-6">{item.reason}</p>
               </li>
             ))}
           </ul>
        </div>
        <div className="mt-6 p-4 bg-alert/20 border border-alert">
          <p className="text-sm font-bold">These limitations are intentional and aligned with ethical AI practices.</p>
        </div>
      </div>

      {/* Ethics */}
      <div className="bg-ink text-paper p-8 shadow-hard border-l-8 border-alert">
        <h3 className="font-serif font-bold text-3xl mb-6 flex items-center gap-3">
          <AlertTriangle className="text-alert" size={32} />
          Ethical Framework & Responsible AI
        </h3>
        <p className="mb-6 opacity-90 leading-relaxed text-lg">
          This system is designed as an assistive tool within an ethical AI framework. Video forensics across three 
          dimensions - deepfake detection, AI-generated content analysis, and context verification - is inherently probabilistic 
          and contextual. Users should treat risk scores as indicators for further investigation, not as verdicts.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-xl mt-6 mb-4 text-alert">Known Failure Modes</h4>
            <ul className="space-y-3">
              {[
                {
                  mode: "False Positives",
                  desc: "Over-flagging legitimate content, particularly during unusual but genuine events.",
                  mitigation: "Confidence bands + detailed explanations help users understand uncertainty."
                },
                {
                  mode: "Dataset Bias",
                  desc: "Limited representation in training data may affect accuracy for underrepresented regions/contexts.",
                  mitigation: "Restrict scope to known contexts and disclose limitations explicitly."
                },
                {
                  mode: "Overinterpretation",
                  desc: "Users treating system output as definitive truth rather than evidence.",
                  mitigation: "Clear disclaimers, educational materials, and human-in-the-loop workflows."
                },
                {
                  mode: "Partial Module Failure",
                  desc: "One or more of the three forensic modules (deepfake, AI-generated, context) unavailable due to technical issues.",
                  mitigation: "Independent module architecture - continue with available modules, clearly indicate which analyses completed."
                }
              ].map((item, i) => (
                <li key={i} className="bg-paper-dark/20 p-4 border border-paper/20">
                  <div className="font-bold mb-1 text-alert">{item.mode}</div>
                  <p className="text-xs text-paper/80 mb-2">{item.desc}</p>
                  <div className="text-xs text-paper/60">
                    <strong>Mitigation:</strong> {item.mitigation}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xl mt-6 mb-4 text-alert">Core Ethical Principles</h4>
            <ul className="space-y-4">
              {[
                {
                  principle: "Transparency",
                  desc: "All decisions and confidence scores are fully explainable. No black-box verdicts."
                },
                {
                  principle: "Human Agency",
                  desc: "System provides evidence; humans make final decisions. Never automated enforcement."
                },
                {
                  principle: "Privacy First",
                  desc: "Deepfake detection analyzes manipulation artifacts, not identities. No biometric identification, no persistent content storage, encrypted transmission."
                },
                {
                  principle: "Continuous Improvement",
                  desc: "Modular architecture allows iterative enhancement of individual signal modules."
                },
                {
                  principle: "Accountability",
                  desc: "Clear documentation of capabilities, limitations, and failure modes."
                }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="text-alert shrink-0 mt-1" size={18} />
                  <div>
                    <div className="font-bold text-alert">{item.principle}</div>
                    <p className="text-sm text-paper/80">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-alert/20 border-2 border-alert p-6">
          <h5 className="font-bold text-xl mb-3">Disclaimer for Production Use</h5>
          <p className="text-sm leading-relaxed opacity-90">
            Provenance is an assistive verification tool that provides probabilistic risk assessments based on 
            available evidence. It should be used as <strong>one input among many</strong> in editorial and moderation 
            workflows. Organizations deploying this system must:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Train staff on proper interpretation of risk scores and signals</li>
            <li>• Maintain human oversight and final decision authority</li>
            <li>• Document all decisions that rely on system outputs</li>
            <li>• Regularly audit for bias and accuracy across diverse content types</li>
            <li>• Provide appeal mechanisms for flagged content</li>
          </ul>
        </div>
      </div>

      {/* Roadmap */}
      <section>
        <h3 className="font-serif font-bold text-3xl mb-6 bg-paper-dark text-ink inline-block px-3 py-1 border-2 border-ink">Future Enhancements & Roadmap</h3>
        <div className="bg-white border-2 border-ink p-8 shadow-hard">
          <p className="text-ink/80 mb-8 leading-relaxed">
            The current release represents an MVP (Minimum Viable Product). The following enhancements are planned 
            for future releases based on user feedback and technical feasibility:
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4 text-highlight border-b-2 border-highlight pb-2">Phase 2: Enhanced Module Capabilities</h4>
              <ul className="space-y-3">
                {[
                  "True live-stream ingestion with real-time three-module processing",
                  "Improved deepfake detection for voice-cloning and audio manipulation",
                  "Enhanced AI-generated detection for diffusion models (Sora, Runway)",
                  "Expanded context reference corpus with global geographic coverage",
                  "Multi-language claim analysis (Spanish, Arabic, Mandarin)"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="text-highlight mt-1 shrink-0" size={16} />
                    <span className="text-sm text-ink/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-highlight border-b-2 border-highlight pb-2">Phase 3: Integration & Scale</h4>
              <ul className="space-y-3">
                {[
                  "Browser extension for in-context verification",
                  "Integration with newsroom CMS platforms",
                  "API partnerships with social media platforms",
                  "Collaborative verification networks",
                  "Advanced analytics dashboard for organizations"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="text-highlight mt-1 shrink-0" size={16} />
                    <span className="text-sm text-ink/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment */}
      <section>
        <h3 className="font-serif font-bold text-3xl mb-6 bg-alert text-ink inline-block px-3 py-1">Deployment & Operations</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <Server className="text-highlight mb-4" size={40} />
            <h4 className="font-bold text-lg mb-3">Infrastructure</h4>
            <ul className="text-sm space-y-2 text-ink/70">
              <li>• Cloud-native architecture (three independent modules)</li>
              <li>• Containerized deployment (Docker/Kubernetes)</li>
              <li>• Auto-scaling per module based on load</li>
              <li>• Multi-region availability</li>
            </ul>
          </Card>
          <Card>
            <Lock className="text-highlight mb-4" size={40} />
            <h4 className="font-bold text-lg mb-3">Security</h4>
            <ul className="text-sm space-y-2 text-ink/70">
              <li>• TLS 1.3 encryption</li>
              <li>• API key authentication</li>
              <li>• Rate limiting & DDoS protection</li>
              <li>• Regular security audits</li>
            </ul>
          </Card>
          <Card>
            <Activity className="text-highlight mb-4" size={40} />
            <h4 className="font-bold text-lg mb-3">Monitoring</h4>
            <ul className="text-sm space-y-2 text-ink/70">
              <li>• Real-time per-module performance metrics</li>
              <li>• Error tracking & alerting (deepfake/AI-gen/context)</li>
              <li>• Usage analytics dashboard (module utilization)</li>
              <li>• Independent model performance monitoring</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Assumptions */}
      <section>
        <h3 className="font-serif font-bold text-2xl mb-6">Key Assumptions & Constraints</h3>
        <div className="bg-paper-dark border border-ink/20 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-3 text-ink/60 uppercase text-sm tracking-wide">Assumptions</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-highlight mt-1">✓</span>
                  <span>MVP delivers three independent forensic modules: deepfake, AI-generated, and context analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-highlight mt-1">✓</span>
                  <span>Each module operates independently; partial failures don't block other analyses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-highlight mt-1">✓</span>
                  <span>Users have basic media literacy and understand probabilistic outputs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-highlight mt-1">✓</span>
                  <span>Human interpretation remains the final authority</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-ink/60 uppercase text-sm tracking-wide">Constraints</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-alert mt-1">•</span>
                  <span>Reference dataset is small and curated (MVP limitation)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-alert mt-1">•</span>
                  <span>Analysis time target: {'<'}20 seconds per module ({'<'}60s for all three)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-alert mt-1">•</span>
                  <span>Each module has specialized computational requirements (GPU for deepfake/AI-gen, CPU for context)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-alert mt-1">•</span>
                  <span>API rate limits based on subscription tier</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRD Download */}
      <section>
        <h3 className="font-serif font-bold text-3xl mb-6 bg-alert text-ink inline-block px-3 py-1">Project Documentation</h3>
        <div className="bg-white border-2 border-ink p-8 shadow-hard">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-grow">
              <h4 className="font-bold text-2xl mb-4 flex items-center gap-2">
                <FileText className="text-alert" size={28} />
                Product Requirements Document (PRD)
              </h4>
              <p className="text-ink/80 leading-relaxed mb-4">
                Access the complete Product Requirements Document for Provenance, including detailed system architecture, 
                technical specifications, use cases, and implementation roadmap for all three forensic modules.
              </p>
              <a 
                href="PRD2.pdf" 
                download="Provenance_AI_PRD.pdf"
                className="px-8 py-3 bg-alert text-ink font-bold border-2 border-ink hover:bg-ink hover:text-alert transition-all shadow-hard inline-flex items-center gap-3"
              >
                <FileText size={20} />
                Download Complete PRD
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Bio */}
      <section>
        <h3 className="font-serif font-bold text-3xl mb-6 bg-ink text-paper inline-block px-3 py-1">About the Developer</h3>
        <div className="bg-white border-2 border-ink p-8 shadow-hard">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-4">
                <Code className="text-alert" size={32} />
                <h4 className="font-serif font-bold text-3xl">Sriharsha Meduri</h4>
              </div>
              <p className="text-lg text-ink/90 font-bold mb-4">
                Head of Engineering @OviGuide | CTO &amp; Co-Founder @QuickPe | AI/ML &amp; Full-Stack Developer | Andhra University
              </p>
              <p className="text-ink/80 leading-relaxed mb-4">
                I build intelligent, scalable products across AI, machine learning, and full-stack
                development, spanning education, fintech, cybersecurity, and computer vision. I enjoy
                owning the whole lifecycle, from model development to deployment.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-w-[200px]">
              <a 
                href="https://sriharshameduri.in"
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-alert text-ink font-bold border-2 border-ink hover:bg-ink hover:text-alert transition-all text-center inline-flex items-center gap-2 justify-center shadow-hard"
              >
                <ExternalLink size={18} />
                View Portfolio
              </a>
              <a 
                href="https://github.com/Sriharsha-Meduri" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-ink text-paper font-bold border-2 border-ink hover:bg-alert hover:text-ink transition-all text-center inline-flex items-center gap-2 justify-center shadow-hard"
              >
                <Github size={18} />
                GitHub Profile
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
);

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage setPage={setCurrentPage} />;
      case 'analyze': return <AnalyzePage />;
      case 'how-it-works': return <HowItWorksPage />;
      case 'use-cases': return <UseCasesPage />;
      case 'about': return <AboutPage />;
      default: return <HomePage setPage={setCurrentPage} />;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-paper selection:bg-alert selection:text-ink">
      <Navbar 
        currentPage={currentPage} 
        setPage={setCurrentPage} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />
      
      <main className="flex-grow relative z-0">
        {renderPage()}
      </main>

      <Footer setPage={setCurrentPage} />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);