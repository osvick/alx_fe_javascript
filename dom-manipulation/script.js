// Quotes array
let quotes = [
    { text: "Push yourself, because no one else is going to do it for you.", category: "Motivation" },
    { text: "Great things never come from comfort zones.", category: "Motivation" },
    { text: "The only true wisdom is in knowing you know nothing.", category: "Wisdom" },
    { text: "Do not take life too seriously. You will never get out of it alive.", category: "Wisdom" }
];

// References to HTML elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const newQuoteTextInput = document.getElementById("newQuoteText");
const newQuoteCategoryInput = document.getElementById("newQuoteCategory");

// Function: Show a random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.textContent = "No quotes available. Please add one.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    // Clear display before adding new content
    quoteDisplay.innerHTML = "";

    const quoteElem = document.createElement("p");
    quoteElem.textContent = `"${randomQuote.text}"`;

    const categoryElem = document.createElement("small");
    categoryElem.textContent = `Category: ${randomQuote.category}`;
    categoryElem.style.display = "block";
    categoryElem.style.marginTop = "5px";
    categoryElem.style.fontStyle = "italic";

    quoteDisplay.appendChild(quoteElem);
    quoteDisplay.appendChild(categoryElem);
}

// Function: Add new quote dynamically
function addQuote() {
    const quoteText = newQuoteTextInput.value.trim();
    const quoteCategory = newQuoteCategoryInput.value.trim();

    if (!quoteText || !quoteCategory) {
        alert("Please fill in both fields.");
        return;
    }

    // Add new quote to array
    quotes.push({ text: quoteText, category: quoteCategory });

    // Clear input fields
    newQuoteTextInput.value = "";
    newQuoteCategoryInput.value = "";

    // Immediately show newly added quote
    showRandomQuote();

    alert("Quote added successfully!");
}

// Event listener for showing random quotes
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initial display
showRandomQuote();
