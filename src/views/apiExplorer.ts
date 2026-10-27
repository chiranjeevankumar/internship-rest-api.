export function getApiExplorerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Internship REST API & Database Explorer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    pre, code { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen pb-12">
  <!-- Header -->
  <header class="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl">
          ⚡
        </div>
        <div>
          <h1 class="text-lg font-bold text-white flex items-center gap-2">
            Internship REST API
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Milestone 3</span>
          </h1>
          <p class="text-xs text-slate-400">Node.js + Express.js + SQLite Database Service</p>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <button onclick="testHealth()" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          GET /api/health
        </button>
        <a href="https://github.com/chiranjeevankumar/internship-rest-api" target="_blank" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1">
          <span>GitHub Repo</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
    <!-- Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
        <span class="text-xs text-slate-400 font-medium">Database System</span>
        <div class="text-lg font-bold text-white mt-1 flex items-center gap-2">
          <span>SQLite 3</span>
          <span class="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">Persistent</span>
        </div>
        <p class="text-xs text-slate-400 mt-1">better-sqlite3 driver with parameterized SQL</p>
      </div>
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
        <span class="text-xs text-slate-400 font-medium">Seed Records</span>
        <div class="text-lg font-bold text-indigo-400 mt-1">5 Initial Records</div>
        <p class="text-xs text-slate-400 mt-1">INT-101 to INT-105 auto-seeded without duplicates</p>
      </div>
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
        <span class="text-xs text-slate-400 font-medium">Supported Capabilities</span>
        <div class="text-lg font-bold text-white mt-1">Pagination & Filter</div>
        <p class="text-xs text-slate-400 mt-1">Search, domain, location, page & limit support</p>
      </div>
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
        <span class="text-xs text-slate-400 font-medium">Validation & Tests</span>
        <div class="text-lg font-bold text-emerald-400 mt-1">100% Verified</div>
        <p class="text-xs text-slate-400 mt-1">Automated test suite with Supertest + Vitest</p>
      </div>
    </div>

    <!-- Live API Tester Workbench -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: Controls & Endpoints -->
      <div class="lg:col-span-5 space-y-6">
        <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
          <h2 class="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span>🚀 Endpoint Interactive Runner</span>
            <span class="text-xs font-normal text-slate-400">Click to execute</span>
          </h2>

          <div class="space-y-3">
            <!-- Health Check -->
            <button onclick="fetchApi('/api/health')" class="w-full text-left p-3 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-700/70 hover:border-emerald-500/50 transition group flex items-center justify-between">
              <div class="flex items-center space-x-2.5">
                <span class="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">GET</span>
                <span class="text-xs font-mono text-slate-200">/api/health</span>
              </div>
              <span class="text-xs text-slate-400 group-hover:text-emerald-400 transition">Execute &rarr;</span>
            </button>

            <!-- GET Internships with Query Controls -->
            <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-700/70 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                  <span class="px-2 py-0.5 text-xs font-bold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">GET</span>
                  <span class="text-xs font-mono text-slate-200">/api/internships</span>
                </div>
                <button onclick="executeGetInternships()" class="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white transition">Run Query</button>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label class="block text-slate-400 mb-1">Search Keyword</label>
                  <input id="qSearch" type="text" placeholder="e.g. Remote, Node" class="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Domain Filter</label>
                  <input id="qDomain" type="text" placeholder="e.g. Full Stack" class="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Location Filter</label>
                  <input id="qLocation" type="text" placeholder="e.g. Remote India" class="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500">
                </div>
                <div class="grid grid-cols-2 gap-1">
                  <div>
                    <label class="block text-slate-400 mb-1">Page</label>
                    <input id="qPage" type="number" value="1" min="1" class="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500">
                  </div>
                  <div>
                    <label class="block text-slate-400 mb-1">Limit</label>
                    <input id="qLimit" type="number" value="10" min="1" max="100" class="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500">
                  </div>
                </div>
              </div>
            </div>

            <!-- GET Internship By ID -->
            <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-700/70 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                  <span class="px-2 py-0.5 text-xs font-bold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">GET</span>
                  <span class="text-xs font-mono text-slate-200">/api/internships/:id</span>
                </div>
                <button onclick="executeGetById()" class="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white transition">Fetch By ID</button>
              </div>
              <div class="flex gap-2">
                <input id="getByIdInput" type="text" value="INT-101" placeholder="INT-101" class="flex-1 text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500">
                <button onclick="document.getElementById('getByIdInput').value='INT-999'; executeGetById();" class="text-xs text-amber-400 hover:underline">Test 404</button>
              </div>
            </div>

            <!-- POST Create Internship -->
            <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-700/70 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                  <span class="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">POST</span>
                  <span class="text-xs font-mono text-slate-200">/api/internships</span>
                </div>
                <button onclick="executePostInternship()" class="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition">Create Record</button>
              </div>
              <p class="text-[11px] text-slate-400">ID is auto-generated automatically by the server.</p>
              <textarea id="postJsonBody" rows="5" class="w-full text-xs font-mono bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-indigo-500">{
  "title": "Backend Engineering Intern",
  "description": "Develop high-performance REST APIs and microservices using Express and SQLite.",
  "domain": "Cloud & Infrastructure",
  "location": "Remote India",
  "skills": ["Node.js", "Express", "SQLite"],
  "openings": 2
}</textarea>
              <div class="flex justify-between text-xs">
                <button onclick="setInvalidPostPayload()" class="text-amber-400 hover:underline">Test Validation Failure (400)</button>
                <button onclick="resetPostPayload()" class="text-slate-400 hover:underline">Reset Sample Body</button>
              </div>
            </div>

            <!-- PUT Update Internship -->
            <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-700/70 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                  <span class="px-2 py-0.5 text-xs font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">PUT</span>
                  <span class="text-xs font-mono text-slate-200">/api/internships/:id</span>
                </div>
                <button onclick="executePutInternship()" class="px-2.5 py-1 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 text-white transition">Update Record</button>
              </div>
              <div class="flex gap-2 mb-1">
                <input id="putIdInput" type="text" value="INT-101" placeholder="ID to update" class="w-28 text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500">
                <span class="text-xs text-slate-400 self-center">Target Record ID</span>
              </div>
              <textarea id="putJsonBody" rows="5" class="w-full text-xs font-mono bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-indigo-500">{
  "title": "Senior Frontend Intern",
  "description": "Lead frontend component architecture with React, TypeScript, and modern CSS tools.",
  "domain": "Full Stack Development",
  "location": "Remote India",
  "skills": ["HTML", "CSS", "JavaScript", "React"],
  "openings": 5
}</textarea>
            </div>

            <!-- DELETE Internship -->
            <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-700/70 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                  <span class="px-2 py-0.5 text-xs font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">DELETE</span>
                  <span class="text-xs font-mono text-slate-200">/api/internships/:id</span>
                </div>
                <button onclick="executeDeleteInternship()" class="px-2.5 py-1 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white transition">Delete Record</button>
              </div>
              <div class="flex gap-2">
                <input id="deleteIdInput" type="text" value="INT-105" placeholder="INT-105" class="flex-1 text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500">
                <span class="text-xs text-slate-400 self-center">Specify ID to remove</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Response Viewer & Database Table Preview -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Live Response Panel -->
        <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              <span>HTTP Response Output</span>
            </h2>
            <div id="responseBadge" class="text-xs font-mono px-2.5 py-1 rounded bg-slate-700 text-slate-300">
              Ready to send request
            </div>
          </div>
          <div class="relative">
            <pre id="responseOutput" class="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-emerald-400 overflow-x-auto min-h-[220px] max-h-[380px]">Select an endpoint action from the left panel to trigger live API response data.</pre>
          </div>
        </div>

        <!-- Seed Database Quick View -->
        <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-white">📦 Database Records Overview</h3>
              <p class="text-xs text-slate-400">Current contents stored in SQLite table <code class="text-indigo-300">internships</code></p>
            </div>
            <button onclick="refreshDatabaseTable()" class="px-3 py-1 text-xs font-medium rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition">
              Refresh Table
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th class="p-2 border-b border-slate-700">ID</th>
                  <th class="p-2 border-b border-slate-700">Title & Description</th>
                  <th class="p-2 border-b border-slate-700">Domain</th>
                  <th class="p-2 border-b border-slate-700">Location</th>
                  <th class="p-2 border-b border-slate-700">Skills Array</th>
                  <th class="p-2 border-b border-slate-700 text-right">Openings</th>
                </tr>
              </thead>
              <tbody id="dbTableBody" class="divide-y divide-slate-800">
                <tr>
                  <td colspan="6" class="p-4 text-center text-slate-500">Click 'Refresh Table' or run query to view current records.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    async function fetchApi(url, options = {}) {
      const outputEl = document.getElementById('responseOutput');
      const badgeEl = document.getElementById('responseBadge');
      outputEl.textContent = 'Executing request...';
      badgeEl.className = 'text-xs font-mono px-2.5 py-1 rounded bg-slate-700 text-slate-300';
      badgeEl.textContent = 'PENDING...';

      try {
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          ...options
        });
        const data = await res.json();
        const statusText = res.status + ' ' + res.statusText;
        
        if (res.ok) {
          badgeEl.className = 'text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
        } else if (res.status >= 400 && res.status < 500) {
          badgeEl.className = 'text-xs font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30';
        } else {
          badgeEl.className = 'text-xs font-mono px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30';
        }
        badgeEl.textContent = statusText;

        outputEl.textContent = JSON.stringify(data, null, 2);

        if (['POST', 'PUT', 'DELETE'].includes(options.method)) {
          refreshDatabaseTable();
        }
      } catch (err) {
        badgeEl.className = 'text-xs font-mono px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30';
        badgeEl.textContent = 'FETCH ERROR';
        outputEl.textContent = JSON.stringify({ error: err.message }, null, 2);
      }
    }

    function testHealth() {
      fetchApi('/api/health');
    }

    function executeGetInternships() {
      const q = document.getElementById('qSearch').value.trim();
      const domain = document.getElementById('qDomain').value.trim();
      const location = document.getElementById('qLocation').value.trim();
      const page = document.getElementById('qPage').value;
      const limit = document.getElementById('qLimit').value;

      const params = new URLSearchParams();
      if (q) params.append('search', q);
      if (domain) params.append('domain', domain);
      if (location) params.append('location', location);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);

      const url = '/api/internships' + (params.toString() ? '?' + params.toString() : '');
      fetchApi(url);
    }

    function executeGetById() {
      const id = document.getElementById('getByIdInput').value.trim();
      if (!id) return alert('Please enter an ID');
      fetchApi('/api/internships/' + encodeURIComponent(id));
    }

    function executePostInternship() {
      const bodyStr = document.getElementById('postJsonBody').value;
      try {
        const body = JSON.parse(bodyStr);
        fetchApi('/api/internships', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      } catch (e) {
        alert('Invalid JSON payload string in body editor: ' + e.message);
      }
    }

    function executePutInternship() {
      const id = document.getElementById('putIdInput').value.trim();
      if (!id) return alert('Please enter an ID to update');
      const bodyStr = document.getElementById('putJsonBody').value;
      try {
        const body = JSON.parse(bodyStr);
        fetchApi('/api/internships/' + encodeURIComponent(id), {
          method: 'PUT',
          body: JSON.stringify(body)
        });
      } catch (e) {
        alert('Invalid JSON payload string in body editor: ' + e.message);
      }
    }

    function executeDeleteInternship() {
      const id = document.getElementById('deleteIdInput').value.trim();
      if (!id) return alert('Please enter an ID to delete');
      if (confirm('Are you sure you want to delete internship record ' + id + '?')) {
        fetchApi('/api/internships/' + encodeURIComponent(id), {
          method: 'DELETE'
        });
      }
    }

    function setInvalidPostPayload() {
      document.getElementById('postJsonBody').value = JSON.stringify({
        title: "A",
        description: "Short",
        openings: 0 // invalid openings <= 0
      }, null, 2);
    }

    function resetPostPayload() {
      document.getElementById('postJsonBody').value = JSON.stringify({
        title: "Backend Engineering Intern",
        description: "Develop high-performance REST APIs and microservices using Express and SQLite.",
        domain: "Cloud & Infrastructure",
        location: "Remote India",
        skills: ["Node.js", "Express", "SQLite"],
        openings: 2
      }, null, 2);
    }

    async function refreshDatabaseTable() {
      try {
        const res = await fetch('/api/internships?limit=100');
        const json = await res.json();
        const tbody = document.getElementById('dbTableBody');
        if (json.success && json.data) {
          tbody.innerHTML = json.data.map(item => \`
            <tr class="hover:bg-slate-800/50 font-mono">
              <td class="p-2 text-indigo-400 font-bold font-mono">\${item.id}</td>
              <td class="p-2 font-sans">
                <div class="text-white font-medium">\${item.title}</div>
                <div class="text-slate-400 text-[11px] truncate max-w-[200px]">\${item.description}</div>
              </td>
              <td class="p-2 font-sans text-slate-300">\${item.domain}</td>
              <td class="p-2 font-sans text-slate-300">\${item.location}</td>
              <td class="p-2 font-sans text-emerald-400 text-[11px]">
                \${Array.isArray(item.skills) ? item.skills.join(', ') : item.skills}
              </td>
              <td class="p-2 text-right text-indigo-300 font-bold font-mono">\${item.openings}</td>
            </tr>
          \`).join('');
        }
      } catch (e) {
        console.error('Failed to update DB view table:', e);
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      fetchApi('/api/health');
      refreshDatabaseTable();
    });
  </script>
</body>
</html>`;
}
