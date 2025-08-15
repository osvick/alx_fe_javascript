let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

// Display a random quote
function showNewQuote() {
  if (quotes.length === 0) {
    document.getElementById('quoteDisplay').innerText = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  document.getElementById('quoteDisplay').innerText = `"${quotes[randomIndex].text}" - [${quotes[randomIndex].category}]`;
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  populateCategories();
}

// Add new quote
document.getElementById('addQuoteForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const text = document.getElementById('quoteText').value.trim();
  const category = document.getElementById('quoteCategory').value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    document.getElementById('quoteText').value = '';
    document.getElementById('quoteCategory').value = '';
    showNewQuote();
  }
});

// Populate categories
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = ['all', ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Filter quotes
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastCategory', selectedCategory);

  if (selectedCategory === 'all') {
    showNewQuote();
  } else {
    const filtered = quotes.filter(q => q.category === selectedCategory);
    if (filtered.length > 0) {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      document.getElementById('quoteDisplay').innerText = `"${filtered[randomIndex].text}" - [${filtered[randomIndex].category}]`;
    } else {
      document.getElementById('quoteDisplay').innerText = "No quotes available for this category.";
    }
  }
}

// Export quotes to JSON file
document.getElementById('exportQuotes').addEventListener('click', function () {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import quotes from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await res.json();
    console.log("Fetched from server:", data);
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
  }
}

// Sync quotes with server
async function syncQuotes() {
  try {
    document.getElementById('syncStatus').innerText = "Syncing...";
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotes)
    });
    document.getElementById('syncStatus').innerText = "Quotes synced with server!";
  } catch (error) {
    document.getElementById('syncStatus').innerText = "Sync failed!";
    console.error("Sync error:", error);
  }
}

// Load quotes on start
window.onload = function () {
  populateCategories();
  showNewQuote();

  const lastCategory = localStorage.getItem('lastCategory');
  if (lastCategory) {
    document.getElementById('categoryFilter').value = lastCategory;
    filterQuotes();
  }

  // Auto sync every 60 seconds
  setInterval(syncQuotes, 60000);
};

// Event listener for new quote button
document.getElementById('newQuote').addEventListener('click', showNewQuote);
