import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Briefcase, Map, Mic, Brain, Target,
  Menu, X, ChevronRight, Star, ArrowRight, Play
} from 'lucide-react'

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/90 backdrop-blur-md border-b border-slate-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-xl font-bold gradient-text">⚡ CareerPilot</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-slate-100 text-sm transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-slate-100 text-sm transition-colors">How it Works</a>
            <a href="#pricing" className="text-slate-300 hover:text-slate-100 text-sm transition-colors">Pricing</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-sm text-slate-300 hover:text-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-300 hover:text-slate-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a1628] border-t border-slate-700/30 px-4 py-4 flex flex-col gap-4">
          <a href="#features" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-slate-100 text-sm transition-colors">Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-slate-100 text-sm transition-colors">How it Works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-slate-100 text-sm transition-colors">Pricing</a>
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-all"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050d1a] pt-16">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500 rounded-full blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-800 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm px-4 py-2 rounded-full mb-8">
          🚀 AI-Powered Career Development
        </div>

        {/* H1 */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Launch Your Dream Career
          <br />
          <span className="gradient-text">with AI Precision</span>
        </h1>

        {/* Subtext */}
        <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Your AI career copilot — analyze your resume, match to dream jobs, build personalized
          roadmaps, and ace every interview with real-time AI coaching.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-violet-900/40"
          >
            Start for Free <ArrowRight size={18} />
          </Link>
          <button className="flex items-center gap-2 border border-slate-600 text-slate-300 hover:text-slate-100 hover:border-slate-500 px-8 py-3.5 rounded-xl font-semibold text-base transition-all">
            <Play size={16} className="text-violet-400" /> Watch Demo
          </button>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { label: '10K+ Users', icon: '👥' },
            { label: '95% Success Rate', icon: '🎯' },
            { label: '500+ Companies', icon: '🏢' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 bg-[#0f1f3d] border border-slate-700/50 text-slate-300 text-sm px-4 py-2 rounded-full"
            >
              <span>{stat.icon}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FileText,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    title: 'Resume Analyzer',
    description: 'Get instant AI-powered feedback on your resume with ATS compatibility scoring, keyword analysis, and actionable improvement suggestions.',
  },
  {
    icon: Briefcase,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    title: 'Job Matcher',
    description: 'Our AI scans thousands of job listings and ranks them by match percentage based on your skills, experience, and career goals.',
  },
  {
    icon: Map,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    title: 'Career Roadmap',
    description: 'Generate a personalized step-by-step career development plan with milestones, skill gaps, and timelines tailored to your target role.',
  },
  {
    icon: Mic,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    title: 'Mock Interviews',
    description: 'Practice with AI-generated interview questions, receive real-time feedback on your answers, and build confidence before the real thing.',
  },
  {
    icon: Target,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    title: 'Skill Gap Analyzer',
    description: 'Pinpoint exact missing skills between your current profile and target roles with customized course recommendations.',
  },
  {
    icon: Brain,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    title: 'AI Career Assistant',
    description: 'Consult your 24/7 AI career copilot for instant interview guidance, resume optimization strategies, and market advice.',
  },
]

function Features() {
  return (
    <section id="features" className="py-24 bg-[#050d1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm px-4 py-1.5 rounded-full mb-4">
            ✨ Powerful Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to accelerate your career
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Six AI-powered tools designed to give you an unfair advantage in today's competitive job market.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="bg-[#0f1f3d] rounded-xl border border-slate-700/50 p-6 card-hover group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${f.bgColor} mb-4`}>
                  <Icon size={22} className={f.color} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const STEPS = [
  { number: '01', title: 'Upload Resume', description: 'Upload your existing resume or build one from scratch with our guided templates.', icon: '📄' },
  { number: '02', title: 'Get AI Analysis', description: 'Our AI analyzes your resume for ATS compatibility, keywords, and improvement areas.', icon: '🤖' },
  { number: '03', title: 'Match to Jobs', description: 'Instantly see ranked job matches with detailed compatibility scores.', icon: '🎯' },
  { number: '04', title: 'Ace Interviews', description: 'Practice with mock interviews and get the job you deserve.', icon: '🏆' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm px-4 py-1.5 rounded-full mb-4">
            🔄 Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Get from resume to offer letter in four powerful steps.
          </p>
        </div>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="relative">
          {/* Dashed connector line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] border-t-2 border-dashed border-slate-700/60 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            {STEPS.map((step, idx) => (
              <div key={step.number} className="flex flex-col items-center text-center">
                {/* Mobile connector line */}
                {idx !== 0 && (
                  <div className="lg:hidden w-0.5 h-8 border-l-2 border-dashed border-slate-700/60 mb-4 -mt-4" />
                )}
                {/* Icon circle */}
                <div className="w-14 h-14 rounded-full bg-[#0f1f3d] border-2 border-violet-500/50 flex items-center justify-center text-2xl mb-4 shadow-lg shadow-violet-900/30">
                  {step.icon}
                </div>
                <div className="text-violet-400 text-xs font-bold tracking-widest mb-1">{step.number}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    initials: 'SJ',
    name: 'Sarah J.',
    role: 'Software Engineer at Google',
    quote: 'CareerPilot helped me land my dream job at Google! The resume analyzer gave me exactly the feedback I needed, and the mock interviews built my confidence.',
    stars: 5,
    color: 'bg-violet-600',
  },
  {
    initials: 'MR',
    name: 'Marcus R.',
    role: 'Product Manager at Stripe',
    quote: 'The job matching feature saved me hours of searching. Within two weeks of using CareerPilot, I had three interviews lined up at top companies.',
    stars: 5,
    color: 'bg-cyan-600',
  },
  {
    initials: 'AL',
    name: 'Aisha L.',
    role: 'Data Scientist at Meta',
    quote: 'The career roadmap was a game-changer. It showed me exactly what skills I needed to develop and helped me transition from academia to industry seamlessly.',
    stars: 5,
    color: 'bg-emerald-600',
  },
]

function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-[#050d1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm px-4 py-1.5 rounded-full mb-4">
            💬 Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Loved by career climbers
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Thousands have launched their dream careers using CareerPilot.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-[#0f1f3d] border border-slate-700/50 rounded-xl p-6 card-hover">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              {/* Quote */}
              <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
              {/* Avatar + info */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-slate-400 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-slate-500 text-xs mt-8">
          ⭐ Demo testimonials for UI preview — representative of typical user outcomes.
        </p>
      </div>
    </section>
  )
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section id="pricing" className="py-24 bg-[#0a1628]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-[#0f1f3d] to-cyan-900/40" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl opacity-15" />

          <div className="relative z-10 text-center px-8 py-16">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm px-4 py-1.5 rounded-full mb-6">
              🎉 Free Forever Plan Available
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to pilot your career?
            </h2>
            <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of professionals who've transformed their careers with AI. Start free, upgrade when you're ready.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-violet-900/40"
              >
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold text-base transition-all"
              >
                Explore Features <ChevronRight size={18} />
              </Link>
            </div>
            <p className="text-slate-400 text-sm mt-6">No credit card required · Cancel anytime</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0a1628] border-t border-slate-700/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="text-xl font-bold gradient-text">⚡ CareerPilot</span>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              AI-powered career development platform helping professionals land their dream jobs.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Changelog', 'Roadmap'].map((item) => (
                <li key={item}><a href="#" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Press'].map((item) => (
                <li key={item}><a href="#" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}><a href="#" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-700/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 CareerPilot. All rights reserved.</p>
          <p className="text-slate-600 text-xs">Demo project — not a real product</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050d1a]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  )
}
