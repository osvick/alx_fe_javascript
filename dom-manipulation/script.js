/* =========================================================
   Dynamic Quote Generator — Storage + JSON Import/Export
   Features:
   - Persist quotes with localStorage
   - Remember last viewed quote in sessionStorage (per tab)
   - Export quotes to a JSON file
   - Import quotes from a JSON file
   - Create the Add Quote form dynamically
   ========================================================= */

// ---- Default sample quotes (used if localStorage is empty) ----
const DEFAULT_QUOTES = [
  { text: "Push yourself, because no one else is going to do it for you.", category: "Motivation" },
  { text: "Great things never come from comfort zones.", category: "Motivation" },
  { text: "The only true wisdom is in knowing you know nothing.", category: "Wisdom" },
  { text: "Do not take life too seriously. You will never get out of it alive.", category: "Humor" },
];

// ---- Keys for Web Storage ----
const LS_KEY = "dqg_quotes";
const SS_LAST_QUOTE_KEY = "dqg_last_quote";

// ---- State ----
let quotes = [];

// ---- DOM refs from your HTML ----
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn  = document.getElementById("newQuote");

// -------------------- Storage Helpers --------------------
function saveQuotes() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error("Failed to save quotes to localStorage:", e);
  }
}

function loadQuotes() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Basic validation
      if (Array.isArray(parsed)) {
        quotes = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
      }
    }
  } catch (e) {
    console.warn("Failed to parse quotes from localStorage, using defaults.", e);
  }
  if (!Array.isArray(quotes) || quotes.length === 0) {
    quotes = [...DEFAULT_QUOTES];
    saveQuotes();
  }
}

function saveLastViewedQuote(quoteObj) {
  try {
    sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quoteObj));
  } catch (e) {
    console.warn("Failed to save last viewed quote in sessionStorage:", e);
  }
}

function loadLastViewedQuote() {
  try {
    const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    if (!raw) return null;
    const q = JSON.parse(raw);
    if (q && typeof q.text === "string" && typeof q.category === "string") return q;
  } catch (e) {
    console.warn("Failed to parse last viewed quote from sessionStorage:", e);
  }
  return null;
}

// -------------------- Rendering --------------------
function renderQuote(quoteObj) {
  quoteDisplay.innerHTML = "";

  const quoteElem = document.createElement("p");
  quoteElem.textContent = `"${quoteObj.text}"`;

  const categoryElem = document.createElement("small");
  categoryElem.textContent = `Category: ${quoteObj.category}`;
  categoryElem.style.display = "block";
  categoryElem.style.marginTop = "5px";
  categoryElem.style.fontStyle = "italic";

  quoteDisplay.appendChild(quoteElem);
  quoteDisplay.appendChild(categoryElem);

  // Remember for this tab (session only)
  saveLastViewedQuote(quoteObj);
}

function showRandomQuote() {
  if (!quotes.length) {
    quoteDisplay.textContent = "No quotes available. Please add one.";
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  renderQuote(quotes[idx]);
}

// -------------------- Add Quote --------------------
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const catInput  = document.getElementById("newQuoteCategory");
  if (!textInput || !catInput) return;

  const text = textInput.value.trim();
  const category = catInput.value.trim();

  if (!text || !category) {
    alert("Please fill in both the quote and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();

  // Clear inputs and show the newly added quote
  textInput.value = "";
  catInput.value = "";
  renderQuote(newQuote);
  alert("New quote added successfully!");
}

// -------------------- JSON Import / Export --------------------
function exportToJsonFile() {
  try {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Export failed:", e);
    alert("Export failed. See console for details.");
  }
}

function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("Invalid file format: expected an array of quotes.");
        return;
      }

      const valid = imported.filter(
        q => q && typeof q.text === "string" && typeof q.category === "string"
      );

      if (!valid.length) {
        alert("No valid quotes found in file.");
        return;
      }

      quotes.push(...valid);
      saveQuotes();
      showRandomQuote();
      alert(`Imported ${valid.length} quote(s) successfully!`);
    } catch (err) {
      console.error("Import failed:", err);
      alert("Import failed. Please ensure the JSON is valid.");
    } finally {
      // Reset the input so the same file can be chosen again later
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// -------------------- UI Builders (dynamic) --------------------
function createAddQuoteForm() {
  // Avoid duplicates if the HTML already contains these elements
  if (document.getElementById("newQuoteText") && document.getElementById("newQuoteCategory")) return;

  const formWrap = document.createElement("div");
  formWrap.style.marginTop = "16px";
  formWrap.style.display = "flex";
  formWrap.style.gap = "8px";
  formWrap.style.flexWrap = "wrap";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  textInput.style.flex = "1 1 260px";

  const catInput = document.createElement("input");
  catInput.id = "newQuoteCategory";
  catInput.type = "text";
  catInput.placeholder = "Enter quote category";
  catInput.style.flex = "1 1 180px";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  formWrap.append(textInput, catInput, addBtn);
  document.body.appendChild(formWrap);
}

function createImportExportControls() {
  // Avoid duplicates
  if (document.getElementById("importFile") || document.getElementById("exportBtn")) return;

  const ctrlWrap = document.createElement("div");
  ctrlWrap.style.marginTop = "12px";
  ctrlWrap.style.display = "flex";
  ctrlWrap.style.gap = "10px";
  ctrlWrap.style.flexWrap = "wrap";

  const exportBtn = document.createElement("button");
  exportBtn.id = "exportBtn";
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.addEventListener("click", exportToJsonFile);

  const importLabel = document.createElement("label");
  importLabel.textContent = "Import JSON: ";
  importLabel.style.display = "inline-flex";
  importLabel.style.alignItems = "center";
  importLabel.style.gap = "6px";

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.id = "importFile";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);

  importLabel.appendChild(importInput);
  ctrlWrap.append(exportBtn, importLabel);
  document.body.appendChild(ctrlWrap);
}

// -------------------- Init --------------------
function init() {
  loadQuotes();

  // If there’s a last-quote saved for this tab, show it; otherwise show random
  const last = loadLastViewedQuote();
  if (last) {
    renderQuote(last);
  } else {
    showRandomQuote();
  }

  // Wire up the "Show New Quote" button
  newQuoteBtn.addEventListener("click", showRandomQuote);

  // Build dynamic UI parts
  createAddQuoteForm();
  createImportExportControls();
}

// Kick things off
init();
