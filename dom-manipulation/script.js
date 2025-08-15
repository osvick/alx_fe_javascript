/* =========================
   Dynamic Quote Generator
   with Server Sync & Conflicts
   ========================= */

// ----------------------------
// Storage Keys
// ----------------------------
const LS_QUOTES_KEY = 'quotesV2';
const LS_SELECTED_CATEGORY = 'selectedCategory';
const SS_LAST_VIEWED_ID = 'lastViewedQuoteId';

// ----------------------------
// Mock "Server" Endpoint (JSONPlaceholder)
// We'll treat posts as quotes:
//   - text  <- post.body
//   - category <- "Category <userId>"
//   - id <- "srv-<post.id>"
// JSONPlaceholder doesn't actually persist changes,
// but it's perfect for simulating.
// ----------------------------
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=15';
const SERVER_POST_URL = 'https://jsonplaceholder.typicode.com/posts';

// ----------------------------
// State
// ----------------------------
let quotes = [];
let manualResolve = false;

// ----------------------------
// Helpers
// ----------------------------
function nowTs() {
  return Date.now();
}

function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const raw = localStorage.getItem(LS_QUOTES_KEY);
  if (!raw) {
    // seed with defaults
    quotes = [
      { id: `loc-${nowTs()}-1`, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation", updatedAt: nowTs(), source: 'local', needsSync: false },
      { id: `loc-${nowTs()}-2`, text: "Don't let yesterday take up too much of today.", category: "Motivation", updatedAt: nowTs(), source: 'local', needsSync: false },
      { id: `loc-${nowTs()}-3`, text: "It's not whether you get knocked down, it's whether you get up.", category: "Perseverance", updatedAt: nowTs(), source: 'local', needsSync: false },
    ];
    saveQuotes();
    return;
  }

  try {
    const arr = JSON.parse(raw);
    // migrate if older version (missing fields)
    quotes = arr.map(q => ({
      id: q.id || `loc-${nowTs()}-${Math.random().toString(36).slice(2)}`,
      text: q.text,
      category: q.category,
      updatedAt: q.updatedAt || nowTs(),
      source: q.source || 'local',
      needsSync: !!q.needsSync
    }));
  } catch {
    quotes = [];
  }
}

function displaySyncMessage(msg, type = 'info') {
  const box = document.getElementById('syncStatus');
  if (!box) return;
  box.textContent = msg;
  box.style.padding = '8px 10px';
  box.style.borderRadius = '6px';
  box.style.transition = 'opacity .3s ease';
  box.style.opacity = '1';

  const colorMap = {
    info: '#e8f1ff',
    success: '#e8fff1',
    warning: '#fff7e8',
    error: '#ffe8e8'
  };
  const borderMap = {
    info: '#5b8def',
    success: '#29a36a',
    warning: '#d18900',
    error: '#d04a4a'
  };
  box.style.background = colorMap[type] || colorMap.info;
  box.style.border = `1px solid ${borderMap[type] || borderMap.info}`;
  box.style.color = '#222';

  // auto-hide after 4s
  setTimeout(() => {
    box.style.opacity = '0';
  }, 4000);
}

// ----------------------------
// UI: Quote Display
// ----------------------------
function showRandomQuote() {
  const filtered = getFilteredQuotes();
  const display = document.getElementById('quoteDisplay');
  if (!display) return;

  if (filtered.length === 0) {
    display.textContent = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];

  display.textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem(SS_LAST_VIEWED_ID, quote.id);
}

function getFilteredQuotes() {
  const categorySelect = document.getElementById('categoryFilter');
  const selected = categorySelect ? categorySelect.value : 'all';
  if (selected === 'all') return quotes;
  return quotes.filter(q => q.category.toLowerCase() === selected.toLowerCase());
}

function populateCategories() {
  const categorySelect = document.getElementById('categoryFilter');
  if (!categorySelect) return;

  const unique = [...new Set(quotes.map(q => q.category))].sort((a, b) =>
    a.localeCompare(b)
  );

  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  unique.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  const saved = localStorage.getItem(LS_SELECTED_CATEGORY);
  if (saved && (saved === 'all' || unique.includes(saved))) {
    categorySelect.value = saved;
  }
}

function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem(LS_SELECTED_CATEGORY, category);
  showRandomQuote();
}

// ----------------------------
// Add Quote (local)
// ----------------------------
function addQuote() {
  const textEl = document.getElementById('newQuoteText');
  const catEl = document.getElementById('newQuoteCategory');
  if (!textEl || !catEl) return;

  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    alert('Please enter both a quote and a category.');
    return;
  }

  const newQuote = {
    id: `loc-${nowTs()}-${Math.random().toString(36).slice(2)}`,
    text,
    category,
    updatedAt: nowTs(),
    source: 'local',
    needsSync: true
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  showRandomQuote();
  displaySyncMessage('Quote added locally. Will sync to server.', 'success');

  textEl.value = '';
  catEl.value = '';
}

// expose for inline button if needed
window.addQuote = addQuote;
window.filterQuotes = filterQuotes;

// ----------------------------
// Server Sync
// ----------------------------
async function fetchServerQuotes() {
  const res = await fetch(SERVER_URL);
  if (!res.ok) throw new Error('Failed to fetch server quotes');
  const posts = await res.json();

  // Map posts -> quotes
  // (We give them stable ids like "srv-<post.id>")
  return posts.map(p => ({
    id: `srv-${p.id}`,
    text: p.body?.trim() || `Post #${p.id}`,
    category: `Category ${p.userId}`,
    // Keep an existing updatedAt if we already have this server quote,
    // else give a timestamp so we can compare on future merges.
    updatedAt: (() => {
      const existing = quotes.find(q => q.id === `srv-${p.id}`);
      return existing?.updatedAt || nowTs();
    })(),
    source: 'server',
    needsSync: false
  }));
}

async function pushLocalChanges() {
  const dirty = quotes.filter(q => q.needsSync);
  if (dirty.length === 0) return 0;

  let pushed = 0;
  for (const q of dirty) {
    try {
      const res = await fetch(SERVER_POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // JSONPlaceholder echoes back a created id, but won't persist.
        body: JSON.stringify({
          title: q.category,
          body: q.text,
          userId: 1
        })
      });
      if (!res.ok) throw new Error('POST failed');
      // Mark as synced locally (optimistic)
      q.needsSync = false;
      q.updatedAt = nowTs();
      pushed++;
    } catch (e) {
      // leave needsSync = true for retry in next cycle
      console.warn('Push failed for', q, e);
    }
  }
  if (pushed > 0) saveQuotes();
  return pushed;
}

function mergeLists(localArr, serverArr) {
  const byId = new Map(localArr.map(q => [q.id, q]));
  const conflicts = [];

  // Upsert server items
  for (const srv of serverArr) {
    const existing = byId.get(srv.id);
    if (!existing) {
      byId.set(srv.id, srv);
      continue;
    }
    // Compare fields
    const differs =
      existing.text !== srv.text || existing.category !== srv.category;

    if (differs) {
      // Conflict: same id, different data
      const conflict = { id: srv.id, server: srv, local: existing };
      conflicts.push(conflict);

      if (manualResolve) {
        const keepServer = confirm(
          `Conflict on ${srv.id}:\n\n` +
          `SERVER:\n"${srv.text}" — ${srv.category}\n\n` +
          `LOCAL:\n"${existing.text}" — ${existing.category}\n\n` +
          `Click OK to keep SERVER, Cancel to keep LOCAL.`
        );
        if (keepServer) {
          byId.set(srv.id, { ...srv, updatedAt: nowTs() });
        } else {
          // Keep local; mark as needsSync so it tries to push again
          byId.set(srv.id, { ...existing, needsSync: true, updatedAt: nowTs() });
        }
      } else {
        // Default policy: server wins
        byId.set(srv.id, { ...srv, updatedAt: nowTs() });
      }
    } else {
      // No difference; prefer the newer updatedAt if any
      const newer = existing.updatedAt > srv.updatedAt ? existing : srv;
      byId.set(srv.id, newer);
    }
  }

  // Return merged array + conflicts list
  return { merged: Array.from(byId.values()), conflicts };
}

async function syncWithServer() {
  try {
    displaySyncMessage('Syncing…', 'info');

    // 1) Pull from server
    const serverQuotes = await fetchServerQuotes();

    // 2) Merge with local + resolve conflicts
    const { merged, conflicts } = mergeLists(quotes, serverQuotes);
    quotes = merged;

    // 3) Push unsynced local changes
    const pushed = await pushLocalChanges();

    // 4) Persist + refresh UI
    saveQuotes();
    populateCategories();
    // keep current category view
    showRandomQuote();

    if (conflicts.length > 0) {
      displaySyncMessage(
        `Sync complete with ${conflicts.length} conflict(s). ` +
        (manualResolve ? 'Resolved via prompts.' : 'Server version kept.'),
        'warning'
      );
    } else if (pushed > 0) {
      displaySyncMessage(`Sync complete. Pushed ${pushed} local change(s).`, 'success');
    } else {
      displaySyncMessage('Sync complete. Everything is up to date.', 'success');
    }
  } catch (e) {
    console.error(e);
    displaySyncMessage('Sync failed. Will retry later.', 'error');
  }
}

// ----------------------------
// Import/Export (from previous tasks)
// ----------------------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        alert('Invalid JSON: expected an array.');
        return;
      }
      // ensure shape + mark for sync
      const cleaned = imported.map(q => ({
        id: q.id || `loc-${nowTs()}-${Math.random().toString(36).slice(2)}`,
        text: q.text || '',
        category: q.category || 'General',
        updatedAt: q.updatedAt || nowTs(),
        source: q.source || 'local',
        needsSync: true
      }));
      quotes.push(...cleaned);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      displaySyncMessage('Quotes imported. Will sync to server.', 'success');
    } catch {
      alert('Could not parse JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Expose import/export if your HTML uses inline handlers
window.importFromJsonFile = importFromJsonFile;
window.exportToJsonFile = exportToJsonFile;

// ----------------------------
// Auto Sync
// ----------------------------
let syncTimer = null;
function startAutoSync() {
  if (syncTimer) clearInterval(syncTimer);
  // Sync every 30 seconds
  syncTimer = setInterval(syncWithServer, 30000);
}

// ----------------------------
// Init
// ----------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  showRandomQuote();

  // "Show New Quote" button
  const btn = document.getElementById('newQuote');
  if (btn) btn.addEventListener('click', showRandomQuote);

  // Manual resolve checkbox
  const chk = document.getElementById('manualResolve');
  if (chk) {
    chk.addEventListener('change', () => {
      manualResolve = chk.checked;
      displaySyncMessage(
        manualResolve
          ? 'Manual conflict resolve enabled.'
          : 'Server-wins conflict resolve enabled.',
        'info'
      );
    });
  }

  // Sync Now button
  const syncBtn = document.getElementById('syncNow');
  if (syncBtn) syncBtn.addEventListener('click', syncWithServer);

  // Kick off auto sync
  startAutoSync();
  // Initial sync shortly after load
  setTimeout(syncWithServer, 1000);
});
