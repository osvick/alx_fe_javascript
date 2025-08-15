// Load quotes from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Motivation" },
  { text: "It's not whether you get knocked down, it's whether you get up.", category: "Perseverance" }
];

// Show a random quote from current filter
function showRandomQuote() {
  let filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').textContent = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById('quoteDisplay').textContent = `"${quote.text}" — ${quote.category}`;
}

// Get quotes based on current filter selection
function getFilteredQuotes() {
  const category = document.getElementById('categoryFilter').value;
  if (category === "all") {
    return quotes;
  }
  return quotes.filter(q => q.category.toLowerCase() === category.toLowerCase());
}

// Add a new quote and update dropdown if category is new
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    alert("Quote added successfully!");
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate category dropdown dynamically
function populateCategories() {
  const categorySelect = document.getElementById('categoryFilter');
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  
  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Restore last selected filter if it exists
  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter) {
    categorySelect.value = savedFilter;
  }
}

// Filter quotes when category changes
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selectedCategory);
  showRandomQuote();
}

// Export quotes as JSON file
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

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
      } else {
        alert("Invalid file format. Please upload a valid JSON array.");
      }
    } catch {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Initial load
populateCategories();
showRandomQuote();
