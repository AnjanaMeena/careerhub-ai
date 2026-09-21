import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Briefcase, FileText, Target, MessageSquare, ShieldCheck, Rocket, ChevronRight, Award, Users, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  const features = [
    {
      icon: Briefcase,
      title: 'Opportunity Discovery',
      desc: 'Explore verified campus placements, internships, hackathons, workshops, and scholarships tailored to your branch.'
    },
    {
      icon: Sparkles,
      title: 'AI Resume Analysis',
      desc: 'Upload your PDF resume to receive instant AI scoring, ATS compatibility checks, and actionable project recommendations.'
    },
    {
      icon: Target,
      title: 'Skill Gap Roadmap',
      desc: 'Compare your current profile against target industry roles like Full Stack Developer or Cybersecurity Analyst.'
    },
    {
      icon: MessageSquare,
      title: 'AI Career Advisor',
      desc: 'Chat directly with Google Gemini AI for personalized interview guidance, study roadmaps, and portfolio ideas.'
    },
    {
      icon: FileText,
      title: 'Application Tracker',
      desc: 'Manage all your job applications in one central dashboard with visual status trackers and deadline reminders.'
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Portals',
      desc: 'Dedicated student experience paired with a powerful admin workspace for campus opportunity management.'
    }
  ];

  const testimonials = [
    {
      name: 'Rohan Sharma',
      role: 'B.Tech CSE 2026',
      company: 'Placed at Google (Intern)',
      quote: 'CareerHub AI matched my skills directly with top internship roles and highlighted missing Docker skills which I learned right before interviews!'
    },
    {
      name: 'Ananya Verma',
      role: 'Information Technology 2026',
      company: 'Placed at Microsoft',
      quote: 'The AI Resume Analysis gave me instant feedback on ATS optimization. My score jumped from 62 to 88 in 10 minutes!'
    },
    {
      name: 'Priya Nair',
      role: 'AI & Data Science 2026',
      company: 'Hackathon Winner',
      quote: 'The AI Career Advisor gave me custom project ideas that impressed my interview panel. A must-have for every final year student!'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-300" />
            <span>AI-Powered Campus Career Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight max-w-4xl mx-auto">
            Empower Your Campus Career with <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">AI Guidance</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover placements, internships, hackathons & scholarships. Get AI resume scoring, target role skill gap analysis, and 24/7 career advice powered by Google Gemini.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Explore Student Portal</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all flex items-center justify-center"
            >
              Sign In to Your Account
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
              <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">100%</h4>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Verified Opportunities</p>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
              <h4 className="text-2xl font-black text-purple-600 dark:text-purple-400">Gemini AI</h4>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Instant Resume Scoring</p>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Real-Time</h4>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Application Tracker</p>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
              <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400">Role-Based</h4>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Student & Admin Views</p>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
              Everything You Need for Campus Success
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">
              Designed specifically for university students to eliminate confusion and streamline career progression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">Loved by Campus Achievers</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">See how CareerHub AI helped students secure top placements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">"{item.quote}"</p>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.name}</h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{item.company}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Demo Callout Banner */}
      <section className="py-12 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-bold text-xs rounded-full uppercase tracking-wider">
              Admin & Faculty Portal
            </span>
            <h3 className="text-2xl font-black mt-2">Are you a Campus Administrator?</h3>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Log in with admin credentials (<code className="bg-slate-800 px-2 py-0.5 rounded text-purple-300">admin@careerhub.ai</code> / <code className="bg-slate-800 px-2 py-0.5 rounded text-purple-300">Admin@123</code>) to manage campus opportunities and student analytics.
            </p>
          </div>
          <Link
            to="/login?role=admin"
            className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm rounded-xl transition-all shadow-lg flex-shrink-0"
          >
            Admin Sign In
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
