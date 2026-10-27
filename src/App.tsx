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
  Key
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
  // Internship State
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [domainFilter, setDomainFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');

  // Application Modal State
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applicantName, setApplicantName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  
  // Validation & Submission State
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

  // Fetch Submitted Applications (Requires Admin Authorization Header)
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
        throw new Error('401 Unauthorized: Valid Admin Key required to access private applicant data.');
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

  // Open Application Modal
  const handleOpenApplyModal = (internship: Internship) => {
    setSelectedInternship(internship);
    setIsApplying(true);
    setApplicantName('');
    setEmail('');
    setCoverLetter('');
    setFormErrors({});
    setSubmissionSuccess(null);
    setSubmissionError(null);
  };

  // Validate Application Form (Client-Side)
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                InternPortal
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Secure API Integration
                </span>
              </h1>
              <p className="text-xs text-slate-400">Milestone 3 Express & SQLite REST API</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenApplicationsDrawer}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Records Portal</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition flex items-center gap-1.5"
            >
              <Code2 className="w-4 h-4" />
              <span>API Documentation</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protected Applicant Privacy & Rate Limiting</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Explore Available Internships
            </h2>
            <p className="text-sm text-slate-300">
              Find internship opportunities across full stack development, UI/UX, analytics, and security. Submit your application securely to the backend REST API.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">API ENDPOINT</span>
              <span className="text-emerald-400 font-semibold">{API_BASE_URL}/internships</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, skills, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Domains</option>
              {domains.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Locations</option>
              {locations.filter((l) => l !== 'All').map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="py-16 text-center space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-300">Loading internships from API...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-rose-200">Failed to Load Internships</h3>
            <p className="text-xs text-rose-300 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchInternships}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Fetch</span>
            </button>
          </div>
        ) : internships.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No Internships Found</h3>
            <p className="text-xs text-slate-500">Try clearing your search query or filter options.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDomainFilter('All');
                setLocationFilter('All');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship) => (
              <div
                key={internship.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
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

                <div className="pt-6 mt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenApplyModal(internship)}
                    className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 group-hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
                  >
                    <span>Apply Now</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Application Form Modal */}
      {isApplying && selectedInternship && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsApplying(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {submissionSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Application Submitted!</h3>
                <p className="text-xs text-slate-300">
                  Your application for <strong className="text-white">{selectedInternship.title}</strong> has been successfully recorded in the SQLite database.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-indigo-400">
                  Application Reference ID: {submissionSuccess.id}
                </div>
                <button
                  onClick={() => setIsApplying(false)}
                  className="w-full py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  Close Modal
                </button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{selectedInternship.id}</span>
                  <h3 className="text-xl font-bold text-white">Apply for {selectedInternship.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedInternship.domain} • {selectedInternship.location}</p>
                </div>

                {submissionError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>{submissionError}</div>
                  </div>
                )}

                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Applicant Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chiranjeevan Kumar"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      disabled={submitting}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                    {formErrors.applicantName && (
                      <p className="text-[11px] text-rose-400 mt-1">{formErrors.applicantName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. chiranjeevan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                    {formErrors.email && (
                      <p className="text-[11px] text-rose-400 mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Cover Letter *
                      </label>
                      <span className="text-[10px] text-slate-500">
                        {coverLetter.trim().length} / 2000 chars (min 20)
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      placeholder="Explain briefly why you are a great candidate for this internship position..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      disabled={submitting}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                    {formErrors.coverLetter && (
                      <p className="text-[11px] text-rose-400 mt-1">{formErrors.coverLetter}</p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsApplying(false)}
                      disabled={submitting}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
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

      {/* Submitted Applications Drawer (Admin Privacy Protected) */}
      {showApplicationsDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 max-w-xl w-full h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  Admin Applications Portal
                </h3>
                <p className="text-xs text-slate-400">Requires valid Admin API Key for PII access</p>
              </div>
              <button
                onClick={() => setShowApplicationsDrawer(false)}
                className="p-1 rounded text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Key Authentication Input */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Enter Admin Authorization API Key:
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter admin key (e.g. admin-secret-key-123)"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  onClick={() => fetchApplications(adminKey)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Authenticate
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Backend enforces 401 Unauthorized unless a valid key matching <code className="text-slate-400">ADMIN_API_KEY</code> is provided.
              </p>
            </div>

            {appsError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
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
