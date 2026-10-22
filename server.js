const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Allow the server to receive JSON data.

app.use(express.json());

// Serve the PayPath website files.

app.use(express.static(__dirname));

// Set up the file where loans will be saved.

const dataFolder = path.join(__dirname, "data");
const dataFile = path.join(dataFolder, "loans.json");

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]");
}

// Read saved loans. 

function readLoans() {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

// Save loans to the JSON file.

function saveLoans(loans) {
    fs.writeFileSync(dataFile, JSON.stringify(loans, null, 2));
}

// GET: Retrieve all loans.

app.get("/api/loans", (req, res) => {
    res.json(readLoans());
});

// POST: Add a new loan.

app.post("/api/loans", (req, res) => {
    const { lender, amount, dueAmount, dueDate } = req.body;

    if (
        typeof lender !== "string" ||
        !lender.trim() ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !Number.isFinite(dueAmount) ||
        dueAmount <= 0 ||
        typeof dueDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
        Number.isNaN(Date.parse(dueDate))
    ) {
        return res.status(400).json({
            error: "Please provide valid loan details."
        });
    }

    const loans = readLoans();

    const newLoan = {
        id: Date.now().toString(),
        lender: lender.trim(),
        amount,
        dueAmount,
        dueDate
    };

    loans.push(newLoan);
    saveLoans(loans);

    res.status(201).json(newLoan);
});

// DELETE: Remove a loan by its ID.

app.delete("/api/loans/:id", (req, res) => {
    const loans = readLoans();
    const updatedLoans = loans.filter(
        loan => loan.id !== req.params.id
    );

    if (updatedLoans.length === loans.length) {
        return res.status(404).json({
            error: "Loan not found."
        });
    }

    saveLoans(updatedLoans);

    res.json({ message: "Loan deleted successfully." });
});

// Start the API server.

app.listen(PORT, () => {
    console.log(`PayPath is running at http://localhost:${PORT}`);
});