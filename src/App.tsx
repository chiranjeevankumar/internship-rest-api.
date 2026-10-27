import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  Building2,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  Send,
  Loader2,
  FileText,
  RefreshCw,
  Code2,
  ShieldCheck,
  Lock,
  Key,
  Heart,
  Eye,
  Menu,
  Sparkles,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface Internship {
  id: string;
  title: string;
  description: string;
  domain: string;
  location: string;
  skills: string[];
  openings: number;
  created_at?: string;
  updated_at?: string;
}

interface Application {
  id: string;
  internshipId: string;
  applicantName: string;
  email: string;
  coverLetter: string;
  status: string;
  createdAt?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function App() {
  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Internship Data State
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Saved / Bookmarked Internships (Persisted in LocalStorage)
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('saved_internships');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [domainFilter, setDomainFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'openings'>('newest');

  // Modal States
  const [viewDetailInternship, setViewDetailInternship] = useState<Internship | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  // Application Form Input State
  const [applicantName, setApplicantName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');

  // Form Validation & Submission State
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<Application | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Admin Applications Drawer State
  const [showApplicationsDrawer, setShowApplicationsDrawer] = useState<boolean>(false);
  const [adminKey, setAdminKey] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(false);
  const [appsError, setAppsError] = useState<string | null>(null);

  const domains = ['All', 'Full Stack Development', 'UI/UX', 'Data Analytics', 'Cyber Security'];
  const locations = ['All', 'Remote India', 'Hybrid Pune', 'On-site Bengaluru'];

  // Save Bookmarks to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('saved_internships', JSON.stringify(savedIds));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [savedIds]);

  const toggleSaveInternship = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Fetch Internships
  const fetchInternships = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (domainFilter !== 'All') params.append('domain', domainFilter);
      if (locationFilter !== 'All') params.append('location', locationFilter);

      const res = await fetch(`${API_BASE_URL}/internships?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || json.details || 'Failed to fetch internships from API');
      }

      setInternships(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Network error connecting to API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [searchQuery, domainFilter, locationFilter]);

  // Fetch Applications (Admin Authorized)
  const fetchApplications = async (keyToUse?: string) => {
    const key = keyToUse !== undefined ? keyToUse : adminKey;
    setLoadingApplications(true);
    setAppsError(null);
    try {
      const headers: HeadersInit = {};
      if (key) {
        headers['x-admin-key'] = key.trim();
      }

      const res = await fetch(`${API_BASE_URL}/applications`, { headers });
      const json = await res.json();

      if (res.status === 401) {
        throw new Error('401 Unauthorized: Valid Admin API Key required to view applicant data.');
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load applications');
      }

      setApplications(json.data || []);
    } catch (e: any) {
      setAppsError(e.message || 'Failed to load applications');
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleOpenApplicationsDrawer = () => {
    setShowApplicationsDrawer(true);
    if (adminKey) {
      fetchApplications(adminKey);
    }
  };

  // Open Application Form Modal
  const handleOpenApplyModal = (internship: Internship) => {
    setSelectedInternship(internship);
    setViewDetailInternship(null); // Close details modal if open
    setIsApplying(true);
    setApplicantName('');
    setEmail('');
    setCoverLetter('');
    setFormErrors({});
    setSubmissionSuccess(null);
    setSubmissionError(null);
  };

  // Client-Side Validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!applicantName.trim()) {
      errors.applicantName = 'Full name is required.';
    } else if (applicantName.trim().length < 2) {
      errors.applicantName = 'Full name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!coverLetter.trim()) {
      errors.coverLetter = 'Cover letter is required.';
    } else if (coverLetter.trim().length < 20) {
      errors.coverLetter = `Cover letter must be at least 20 characters (current: ${coverLetter.trim().length}).`;
    } else if (coverLetter.trim().length > 2000) {
      errors.coverLetter = 'Cover letter cannot exceed 2000 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Application
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship || submitting) return;

    if (!validateForm()) return;

    setSubmitting(true);
    setSubmissionError(null);

    try {
      const payload = {
        internshipId: selectedInternship.id,
        applicantName: applicantName.trim(),
        email: email.trim(),
        coverLetter: coverLetter.trim()
      };

      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || json.details?.join(', ') || 'Failed to submit application.');
      }

      setSubmissionSuccess(json.data);
    } catch (err: any) {
      setSubmissionError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter internships for active tab and sort
  const displayedInternships = internships
    .filter((item) => (activeTab === 'saved' ? savedIds.includes(item.id) : true))
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'openings') return b.openings - a.openings;
      return 0; // Default newest / natural order
    });

  const totalOpeningsCount = internships.reduce((sum, item) => sum + item.openings, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                InternPortal
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Consolidated Tasks 1–5
                </span>
              </h1>
              <p className="text-xs text-slate-400">Responsive Internship Board & REST API</p>
            </div>
          </div>

          {/* Desktop Tab Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Internships ({internships.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Saved ({savedIds.length})</span>
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={handleOpenApplicationsDrawer}
              aria-label="Open Admin Applications Portal"
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition flex items-center gap-2 min-h-[40px]"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Portal</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition flex items-center gap-1.5 min-h-[40px]"
            >
              <Code2 className="w-4 h-4" />
              <span>API Explorer</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 px-4 py-3 space-y-2 bg-slate-900">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab('all');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                All ({internships.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('saved');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 ${
                  activeTab === 'saved' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Saved ({savedIds.length})</span>
              </button>
            </div>
            <button
              onClick={() => {
                handleOpenApplicationsDrawer();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Records Portal</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tasks 1–5 Consolidated Application</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Responsive Internship Board
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Find, save, and apply for top internship positions across software development, design, data analytics, and cyber security with SQLite persistent backend.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950/70 p-4 rounded-xl border border-slate-800 w-full md:w-auto">
            <div className="text-center p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-sans">TOTAL OPENINGS</span>
              <span className="text-emerald-400 font-bold text-base">{totalOpeningsCount}</span>
            </div>
            <div className="text-center p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-sans">POSITIONS</span>
              <span className="text-indigo-400 font-bold text-base">{internships.length}</span>
            </div>
          </div>
        </div>

        {/* Filter, Search & Sort Control Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center shadow-lg">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <label htmlFor="searchInput" className="sr-only">Search internships</label>
            <input
              id="searchInput"
              type="text"
              placeholder="Search by title, description, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Domain Filter */}
          <div className="md:col-span-3">
            <label htmlFor="domainFilterSelect" className="sr-only">Filter by domain</label>
            <select
              id="domainFilterSelect"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All">All Domains</option>
              {domains.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="md:col-span-2">
            <label htmlFor="locationFilterSelect" className="sr-only">Filter by location</label>
            <select
              id="locationFilterSelect"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All">All Locations</option>
              {locations.filter((l) => l !== 'All').map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <label htmlFor="sortSelect" className="sr-only">Sort internships</label>
            <select
              id="sortSelect"
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="title">Sort: Title A-Z</option>
              <option value="openings">Sort: Openings High</option>
            </select>
          </div>
        </div>

        {/* Tab Title Indicator */}
        {activeTab === 'saved' && (
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
              <h3 className="text-sm font-bold text-white">Your Saved Internships ({displayedInternships.length})</h3>
            </div>
            <button
              onClick={() => setActiveTab('all')}
              className="text-xs text-indigo-400 hover:underline"
            >
              Back to All Internships &rarr;
            </button>
          </div>
        )}

        {/* Content States */}
        {loading ? (
          <div className="py-16 text-center space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-300">Fetching internship positions...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-rose-200">Failed to Load Internships</h3>
            <p className="text-xs text-rose-300 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchInternships}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white focus:ring-2 focus:ring-rose-400 focus:outline-none transition inline-flex items-center gap-1.5 min-h-[40px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Fetch</span>
            </button>
          </div>
        ) : displayedInternships.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">
              {activeTab === 'saved' ? 'No Saved Internships Yet' : 'No Internships Match Your Criteria'}
            </h3>
            <p className="text-xs text-slate-500">
              {activeTab === 'saved'
                ? 'Click the heart icon on any internship card to save it here.'
                : 'Try clearing your search query or reset filter options.'}
            </p>
            {activeTab === 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDomainFilter('All');
                  setLocationFilter('All');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition min-h-[40px]"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('all')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-2 focus:ring-indigo-400 focus:outline-none transition min-h-[40px]"
              >
                Browse All Internships
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedInternships.map((internship) => {
              const isSaved = savedIds.includes(internship.id);
              return (
                <div
                  key={internship.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl group relative"
                >
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => toggleSaveInternship(internship.id, e)}
                    aria-label={isSaved ? `Unsave ${internship.title}` : `Save ${internship.title}`}
                    className="absolute top-5 right-5 p-2 rounded-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-rose-400 transition focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <Heart
                      className={`w-4 h-4 transition ${
                        isSaved ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-400'
                      }`}
                    />
                  </button>

                  <div className="space-y-4">
                    <div className="flex items-start gap-2 pr-8">
                      <span className="text-xs font-mono font-bold text-indigo-400 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                        {internship.id}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <Users className="w-3 h-3" />
                        {internship.openings} {internship.openings === 1 ? 'opening' : 'openings'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                        {internship.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {internship.domain}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {internship.location}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {internship.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {internship.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => setViewDetailInternship(internship)}
                      aria-label={`View details for ${internship.title}`}
                      className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center justify-center gap-1.5 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => handleOpenApplyModal(internship)}
                      aria-label={`Apply for ${internship.title}`}
                      className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-lg shadow-indigo-600/20 min-h-[44px]"
                    >
                      <span>Apply</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Expanded Internship Details View Modal */}
      {viewDetailInternship && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detailTitle"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setViewDetailInternship(null)}
              aria-label="Close details modal"
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                  {viewDetailInternship.id}
                </span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <Users className="w-3 h-3" />
                  {viewDetailInternship.openings} {viewDetailInternship.openings === 1 ? 'opening' : 'openings'}
                </span>
              </div>

              <div>
                <h3 id="detailTitle" className="text-xl sm:text-2xl font-bold text-white">
                  {viewDetailInternship.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    {viewDetailInternship.domain}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    {viewDetailInternship.location}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Role Overview</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {viewDetailInternship.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Required Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {viewDetailInternship.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  onClick={() => toggleSaveInternship(viewDetailInternship.id)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-2 min-h-[44px]"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      savedIds.includes(viewDetailInternship.id) ? 'text-rose-500 fill-rose-500' : 'text-slate-400'
                    }`}
                  />
                  <span>
                    {savedIds.includes(viewDetailInternship.id) ? 'Saved' : 'Save Position'}
                  </span>
                </button>
                <button
                  onClick={() => handleOpenApplyModal(viewDetailInternship)}
                  className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 min-h-[44px]"
                >
                  <span>Apply Now</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {isApplying && selectedInternship && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsApplying(false)}
              aria-label="Close application modal"
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {submissionSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 id="modalTitle" className="text-xl font-bold text-white">
                  Application Submitted Successfully!
                </h3>
                <p className="text-xs text-slate-300">
                  Your application for <strong className="text-white">{selectedInternship.title}</strong> has been securely recorded in the SQLite database.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-indigo-400">
                  Application Reference ID: {submissionSuccess.id}
                </div>
                <button
                  onClick={() => setIsApplying(false)}
                  className="w-full py-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition min-h-[44px]"
                >
                  Close Modal
                </button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{selectedInternship.id}</span>
                  <h3 id="modalTitle" className="text-xl font-bold text-white">
                    Apply for {selectedInternship.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedInternship.domain} • {selectedInternship.location}</p>
                </div>

                {submissionError && (
                  <div role="alert" className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>{submissionError}</div>
                  </div>
                )}

                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="applicantNameInput" className="block text-xs font-semibold text-slate-300 mb-1">
                      Applicant Full Name *
                    </label>
                    <input
                      id="applicantNameInput"
                      type="text"
                      placeholder="e.g. Chiranjeevan Kumar"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      disabled={submitting}
                      aria-required="true"
                      aria-invalid={Boolean(formErrors.applicantName)}
                      aria-describedby={formErrors.applicantName ? "nameError" : undefined}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
                    />
                    {formErrors.applicantName && (
                      <p id="nameError" className="text-[11px] text-rose-400 mt-1 font-medium">{formErrors.applicantName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="applicantEmailInput" className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      id="applicantEmailInput"
                      type="email"
                      placeholder="e.g. chiranjeevan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                      aria-required="true"
                      aria-invalid={Boolean(formErrors.email)}
                      aria-describedby={formErrors.email ? "emailError" : undefined}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
                    />
                    {formErrors.email && (
                      <p id="emailError" className="text-[11px] text-rose-400 mt-1 font-medium">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="coverLetterTextarea" className="text-xs font-semibold text-slate-300">
                        Cover Letter *
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {coverLetter.trim().length} / 2000 chars (min 20)
                      </span>
                    </div>
                    <textarea
                      id="coverLetterTextarea"
                      rows={5}
                      placeholder="Explain briefly why you are a great candidate for this internship position..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      disabled={submitting}
                      aria-required="true"
                      aria-invalid={Boolean(formErrors.coverLetter)}
                      aria-describedby={formErrors.coverLetter ? "letterError" : undefined}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
                    />
                    {formErrors.coverLetter && (
                      <p id="letterError" className="text-[11px] text-rose-400 mt-1 font-medium">{formErrors.coverLetter}</p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsApplying(false)}
                      disabled={submitting}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition focus:ring-2 focus:ring-slate-500 focus:outline-none rounded-lg min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 disabled:opacity-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-lg shadow-indigo-600/20 min-h-[44px]"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Submitted Applications Drawer */}
      {showApplicationsDrawer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawerTitle"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end"
        >
          <div className="bg-slate-900 border-l border-slate-800 max-w-xl w-full h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 id="drawerTitle" className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  Admin Applications Portal
                </h3>
                <p className="text-xs text-slate-400">Requires valid Admin API Key for applicant privacy access</p>
              </div>
              <button
                onClick={() => setShowApplicationsDrawer(false)}
                aria-label="Close admin drawer"
                className="p-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Key Authentication Input */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label htmlFor="adminKeyInput" className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Enter Admin Authorization API Key:
              </label>
              <div className="flex gap-2">
                <input
                  id="adminKeyInput"
                  type="password"
                  placeholder="Enter admin key (e.g. YOUR_SECURE_ADMIN_API_KEY)"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
                <button
                  onClick={() => fetchApplications(adminKey)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-2 focus:ring-indigo-400 focus:outline-none transition min-h-[38px]"
                >
                  Authenticate
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Backend enforces 401 Unauthorized unless a valid key matching <code className="text-slate-400">ADMIN_API_KEY</code> is provided.
              </p>
            </div>

            {appsError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{appsError}</div>
              </div>
            )}

            {loadingApplications ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                <p>Authenticating and loading applications...</p>
              </div>
            ) : applications.length === 0 && !appsError ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Enter valid admin key above to view applicant records.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-400">{app.id}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold uppercase">
                        {app.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Target Internship: </span>
                      <span className="font-semibold text-slate-200">{app.internshipId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Applicant Name: </span>
                      <span className="text-slate-200 font-medium">{app.applicantName}</span> ({app.email})
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] italic">
                      "{app.coverLetter}"
                    </div>
                    {app.createdAt && (
                      <div className="text-[10px] text-slate-500 text-right">
                        Submitted: {new Date(app.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
