let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Happiness" }
];

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function displayQuote(quote) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
}

function newQuote() {
  if (quotes.length === 0) {
    alert("No quotes available.");
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  displayQuote(quotes[randomIndex]);
  sessionStorage.setItem('lastQuote', JSON.stringify(quotes[randomIndex]));
}

function createAddQuoteForm() {
  const formDiv = document.getElementById("addQuoteForm");
  formDiv.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    alert("Quote added successfully!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
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
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem('lastCategory', selectedCategory);
  let filteredQuotes = quotes;
  if (selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }
  if (filteredQuotes.length > 0) {
    displayQuote(filteredQuotes[0]);
  } else {
    document.getElementById("quoteDisplay").textContent = "No quotes in this category.";
  }
}

function fetchQuotesFromServer() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(data => {
      console.log("Fetched from server:", data);
      alert("Fetched quotes from server (simulation)");
    })
    .catch(error => console.error("Error fetching from server:", error));
}

function syncQuotes() {
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(quotes)
  })
  .then(response => response.json())
  .then(data => {
    console.log("Sync response:", data);
    alert("Quotes synced with server (simulation)");
  })
  .catch(error => console.error("Error syncing quotes:", error));
}

document.getElementById("newQuote").addEventListener("click", newQuote);
document.getElementById("exportQuotes").addEventListener("click", exportQuotes);

createAddQuoteForm();
populateCategories();

// Restore last category filter
const lastCategory = localStorage.getItem('lastCategory');
if (lastCategory) {
  document.getElementById("categoryFilter").value = lastCategory;
  filterQuotes();
}
