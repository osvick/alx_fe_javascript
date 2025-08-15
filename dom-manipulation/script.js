// ======================
// Dynamic Quote Generator
// ======================

// Quotes array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// ----------------------
// Save quotes to localStorage
// ----------------------
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ----------------------
// Show a random quote
// ----------------------
function showNewQuote() {
    let filteredQuotes = getFilteredQuotes();
    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" - (${filteredQuotes[randomIndex].category})`;
    sessionStorage.setItem("lastViewedQuote", JSON.stringify(filteredQuotes[randomIndex]));
}

// ----------------------
// Add a new quote
// ----------------------
function addQuote() {
    const text = document.getElementById("newQuoteText").value.trim();
    const category = document.getElementById("newQuoteCategory").value.trim();

    if (text && category) {
        quotes.push({ text, category });
        saveQuotes();
        populateCategories();
        alert("Quote added successfully!");
        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";
    } else {
        alert("Please enter both a quote and a category.");
    }
}

// ----------------------
// Populate category dropdown
// ----------------------
function populateCategories() {
    if (!categoryFilter) return;
    const categories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    // Restore last selected category
    const lastCategory = localStorage.getItem("lastSelectedCategory");
    if (lastCategory) {
        categoryFilter.value = lastCategory;
    }
}

// ----------------------
// Filter quotes
// ----------------------
function filterQuotes() {
    localStorage.setItem("lastSelectedCategory", categoryFilter.value);
    showNewQuote();
}

function getFilteredQuotes() {
    if (!categoryFilter) return quotes;
    const selectedCategory = categoryFilter.value;
    return selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
}

// ----------------------
// Export quotes as JSON
// ----------------------
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
}

// ----------------------
// Import quotes from JSON
// ----------------------
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories();
            alert("Quotes imported successfully!");
        } catch (error) {
            alert("Invalid JSON file.");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// ----------------------
// Fetch quotes from server (Sync simulation)
// ----------------------
async function fetchQuotesFromServer() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
        const serverData = await response.json();

        // Simulate converting server data to quotes
        const serverQuotes = serverData.map(item => ({
            text: item.title,
            category: "Server"
        }));

        // Conflict resolution: Server data overrides duplicates
        const uniqueQuotes = serverQuotes.filter(sq => !quotes.some(lq => lq.text === sq.text));
        quotes.push(...uniqueQuotes);

        saveQuotes();
        populateCategories();
        alert("Quotes synced from server!");
    } catch (error) {
        console.error("Error fetching quotes from server:", error);
    }
}

// ----------------------
// Event listeners
// ----------------------
if (newQuoteBtn) newQuoteBtn.addEventListener("click", showNewQuote);

// Initialize
populateCategories();
showNewQuote();
