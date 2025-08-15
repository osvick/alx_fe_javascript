let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don't let yesterday take up too much of today.", category: "Wisdom" }
];

// Display a random quote
function showRandomQuote() {
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById("quoteDisplay").innerText = `"${random.text}" — ${random.category}`;
}

// Filter quotes by category
function filterQuotes() {
    const category = document.getElementById("categoryFilter").value;
    if (category === "all") {
        showRandomQuote();
        return;
    }
    const filtered = quotes.filter(q => q.category === category);
    if (filtered.length > 0) {
        const random = filtered[Math.floor(Math.random() * filtered.length)];
        document.getElementById("quoteDisplay").innerText = `"${random.text}" — ${random.category}`;
    } else {
        document.getElementById("quoteDisplay").innerText = "No quotes in this category.";
    }
}

// Add new quote
function addQuote() {
    const text = document.getElementById("newQuoteText").value.trim();
    const category = document.getElementById("newQuoteCategory").value.trim();
    if (text && category) {
        quotes.push({ text, category });
        localStorage.setItem("quotes", JSON.stringify(quotes));
        updateCategoryFilter();
        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";
        alert("Quote added successfully!");
    } else {
        alert("Please enter both text and category.");
    }
}

// Populate category dropdown
function updateCategoryFilter() {
    const categories = [...new Set(quotes.map(q => q.category))];
    const select = document.getElementById("categoryFilter");
    select.innerHTML = `<option value="all">All</option>` +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await res.json();

        // Simulated server format
        const serverQuotes = data.slice(0, 5).map(post => ({
            text: post.title,
            category: "Server"
        }));

        // Conflict resolution: Server takes precedence
        quotes = [...serverQuotes, ...quotes];
        localStorage.setItem("quotes", JSON.stringify(quotes));
        updateCategoryFilter();
        alert("Quotes synced from server!");
    } catch (error) {
        console.error("Error fetching quotes:", error);
        alert("Failed to fetch quotes from server.");
    }
}

// Push quotes to server
async function pushQuotesToServer() {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(quotes)
        });

        if (res.ok) {
            alert("Quotes pushed to server successfully!");
        } else {
            alert("Failed to push quotes to server.");
        }
    } catch (error) {
        console.error("Error pushing quotes:", error);
        alert("Error occurred while pushing quotes.");
    }
}

// Export quotes as JSON
function exportQuotes() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes = [...quotes, ...importedQuotes];
                localStorage.setItem("quotes", JSON.stringify(quotes));
                updateCategoryFilter();
                alert("Quotes imported successfully!");
            } else {
                alert("Invalid JSON format.");
            }
        } catch (error) {
            alert("Error reading file.");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Initial load
updateCategoryFilter();
showRandomQuote();
