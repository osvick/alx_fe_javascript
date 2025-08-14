// Quotes array
let quotes = [
    { text: "Push yourself, because no one else is going to do it for you.", category: "Motivation" },
    { text: "Great things never come from comfort zones.", category: "Motivation" },
    { text: "The only true wisdom is in knowing you know nothing.", category: "Wisdom" },
    { text: "Do not take life too seriously. You will never get out of it alive.", category: "Wisdom" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Function to show a random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.textContent = "No quotes available. Please add one.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    // Clear old content
    quoteDisplay.innerHTML = "";

    // Create quote text element
    const quoteElem = document.createElement("p");
    quoteElem.textContent = `"${randomQuote.text}"`;

    // Create category element
    const categoryElem = document.createElement("small");
    categoryElem.textContent = `Category: ${randomQuote.category}`;
    categoryElem.style.display = "block";
    categoryElem.style.marginTop = "5px";
    categoryElem.style.fontStyle = "italic";

    // Append elements to display
    quoteDisplay.appendChild(quoteElem);
    quoteDisplay.appendChild(categoryElem);
}

// Function to add a new quote
function addQuote() {
    const quoteText = document.getElementById("newQuoteText").value.trim();
    const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (!quoteText || !quoteCategory) {
        alert("Please fill in both fields before adding a quote.");
        return;
    }

    // Add new quote to array
    quotes.push({ text: quoteText, category: quoteCategory });

    // Clear form inputs
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    // Show newly added quote
    showRandomQuote();

    alert("New quote added successfully!");
}

// Function to create and insert Add Quote form dynamically
function createAddQuoteForm() {
    const formDiv = document.createElement("div");

    const quoteInput = document.createElement("input");
    quoteInput.id = "newQuoteText";
    quoteInput.type = "text";
    quoteInput.placeholder = "Enter a new quote";

    const categoryInput = document.createElement("input");
    categoryInput.id = "newQuoteCategory";
    categoryInput.type = "text";
    categoryInput.placeholder = "Enter quote category";

    const addButton = document.createElement("button");
    addButton.textContent = "Add Quote";
    addButton.addEventListener("click", addQuote);

    // Append to form container
    formDiv.appendChild(quoteInput);
    formDiv.appendChild(categoryInput);
    formDiv.appendChild(addButton);

    // Append to body
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(formDiv);
}

// Event listener for "Show New Quote" button
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize app
showRandomQuote();
createAddQuoteForm();
