// PayPath browser storage

const STORAGE_KEY = "paypath_loans";

function getLoansFromStorage() {
    const savedLoans = localStorage.getItem(STORAGE_KEY);

    if (savedLoans === null) {
        return [];
    }

    return JSON.parse(savedLoans);
}

function saveLoansToStorage(loans) {
    const loansText = JSON.stringify(loans);
    localStorage.setItem(STORAGE_KEY, loansText);
}

// Store loans loaded from browser storage

let loans = [];


// Keep monthly income in this browser for now.

const savedIncome = localStorage.getItem("paypathIncome");

let monthlyIncome = 30000;

if (savedIncome !== null) {
    const incomeValue = Number(savedIncome);

    if (Number.isFinite(incomeValue) && incomeValue > 0) {
        monthlyIncome = incomeValue;
    }
}

// Find an element by its ID.

function getElement(id) {
    return document.getElementById(id);
}

// Format amounts as Kenyan shillings.

function formatMoney(amount) {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 2
    }).format(amount);
}

// Show a message to the user.

function showMessage(message, type = "success") {
    const box = getElement("appMessage");
    box.textContent = message;
    box.className = `alert alert-${type}`;
}

// Display one screen and hide the others.

function showView(viewName) {
    const selectedView = getElement(viewName);

    if (!selectedView) return;

    document.querySelectorAll(".view-section").forEach(section => {
        section.classList.add("d-none");
    });

    selectedView.classList.remove("d-none");

    document.querySelectorAll("[data-view]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === viewName
        );
    });

    const titles = {
        dashboard: "Dashboard",
        loans: "My Loans",
        planner: "Payment Planner",
        affordability: "Affordability Checker",
        settings: "Settings"
    };

    getElement("pageTitle").textContent = titles[viewName] || "Dashboard";

    getElement("appMessage").classList.add("d-none");

    if (viewName === "loans") {
        displayAllLoans();
    }

    if (viewName === "settings") {
        getElement("settingsIncome").value = monthlyIncome;
    }

    if (viewName === "planner") {
        getElement("plannerIncome").value = monthlyIncome;
    }

    if (viewName === "affordability") {
        getElement("affordIncome").value = monthlyIncome;
    }
}

// Get the total outstanding amount.

function calculateTotalOutstanding() {
    return loans.reduce((total, loan) => total + loan.dueAmount, 0);
}

// Count saved loans.

function countLoans() {
    return loans.length;
}

// Only include loans due in the current month.

function calculateTotalDue() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return loans.reduce((total, loan) => {
        const date = new Date(`${loan.dueDate}T00:00:00`);

        if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        ) {
            return total + loan.dueAmount;
        }

        return total;
    }, 0);
}

// Estimate the percentage of monthly income used for repayments due this month.

function calculateRepaymentPressure() {
    if (monthlyIncome <= 0) return 0;

    return (calculateTotalDue() / monthlyIncome) * 100;
}

// Update dashboard figures.

function updateDashboard() {
    getElement("totalOutstanding").textContent =
        formatMoney(calculateTotalOutstanding());

    getElement("loanCount").textContent = countLoans();

    getElement("totalDue").textContent =
        formatMoney(calculateTotalDue());

    getElement("monthlyIncome").textContent =
        formatMoney(monthlyIncome);

    getElement("pressureValue").textContent =
        calculateRepaymentPressure().toFixed(1) + "%";

    displayDashboardLoans();
}

// Create a loan card safely without inserting user input as HTML.

function createLoanCard(loan, includeDelete = false) {
    const card = document.createElement("div");
    card.className = "border rounded p-3 mb-3";

    const name = document.createElement("h3");
    name.className = "h5";
    name.textContent = loan.lender;

    const originalAmount = document.createElement("p");
    originalAmount.className = "mb-1";
    originalAmount.textContent =
        "Original amount: " + formatMoney(loan.amount);

    const dueAmount = document.createElement("p");
    dueAmount.className = "mb-1";
    dueAmount.textContent =
        "Amount still due: " + formatMoney(loan.dueAmount);

    const dueDate = document.createElement("p");
    dueDate.className = "mb-2";
    dueDate.textContent = "Due date: " + loan.dueDate;

    card.append(name, originalAmount, dueAmount, dueDate);

    if (includeDelete) {
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-outline-danger btn-sm";
        deleteButton.textContent = "Delete Loan";

        deleteButton.addEventListener("click", () => {
            deleteLoan(loan.id);
        });

        card.appendChild(deleteButton);
    }

    return card;
}

// Show loans on the dashboard.

function displayDashboardLoans() {
    const list = getElement("dashboardLoans");
    const emptyMessage = getElement("emptyDashboard");

    list.replaceChildren();

    emptyMessage.classList.toggle("d-none", loans.length > 0);

    loans.forEach(loan => {
        list.appendChild(createLoanCard(loan));
    });
}

// Show all loans on the My Loans page.

function displayAllLoans() {
    const list = getElement("allLoans");
    const emptyMessage = getElement("emptyLoans");

    list.replaceChildren();

    emptyMessage.classList.toggle("d-none", loans.length > 0);

    loans.forEach(loan => {
        list.appendChild(createLoanCard(loan, true));
    });
}

// Load loans from  browser storage

function loadLoans() {
    try {
        loans = getLoansFromStorage();

        updateDashboard();
        displayAllLoans();
    } catch (error) {
        console.error(error);

        showMessage(
            "Could not load loans from this browser.",
            "danger"
        );
    }
}

// Save a new loan in  browser storage 

function addLoan(event) {
    event.preventDefault();

    const loan = {
        id: Date.now().toString(),
        lender: getElement("lender").value.trim(),
        amount: Number(getElement("amount").value),
        dueAmount: Number(getElement("dueAmount").value),
        dueDate: getElement("dueDate").value
    };

    if (
        !loan.lender ||
        !Number.isFinite(loan.amount) ||
        loan.amount <= 0 ||
        !Number.isFinite(loan.dueAmount) ||
        loan.dueAmount <= 0 ||
        !loan.dueDate
    ) {
        showMessage("Please enter valid loan details.", "warning");
        return;
    }

    try {
    const savedLoans = getLoansFromStorage();
    savedLoans.push(loan);

    saveLoansToStorage(savedLoans);
    

        getElement("loanForm").reset();

        loadLoans();
        showView("loans");
        showMessage("Loan saved successfully!", "success");
    } catch (error) {
        showMessage("Could not save the loan in this browser.", "danger");
        console.error(error);
    }
}

// Delete a loan using its ID from the browser storage.

function deleteLoan(id) {
    if (!confirm("Are you sure you want to delete this loan?")) {
        return;
    }

    try {
        const updatedLoans = savedLoans.filter(
            loan => String(loan.id) !== String(id)
        );

        if (updatedLoans.length === savedLoans.length) {
            showMessage("Loan not found.", "warning");
            return;
        }

        saveLoansToStorage(updatedLoans);

        loadLoans();

        showMessage("Loan deleted successfully.", "success");
    } catch (error) {
        console.error(error);
        showMessage("Could not delete the loan.", "danger");
    }
}

// Check repayment affordability.

function checkAffordability(event) {
    event.preventDefault();

    const income = Number(getElement("affordIncome").value);
    const repayment = Number(getElement("repaymentAmount").value);
    const result = getElement("affordResult");

    if (
        !Number.isFinite(income) || income <= 0 ||
        !Number.isFinite(repayment) || repayment <= 0
    ) {
        result.textContent = "Enter a valid income and repayment amount.";
        return;
    }

    const percentage = (repayment / income) * 100;

    result.className = "mt-4 alert " +
        (percentage <= 30 ? "alert-success" : "alert-warning");

    result.textContent =
        `The repayment uses ${percentage.toFixed(1)}% of your monthly income. ` +
        (percentage <= 30
            ? "It may be manageable, depending on your other expenses."
            : "Be careful to account for essential expenses and other debts.");
}

// Calculate a simple monthly payment plan.

function calculatePlan(event) {
    event.preventDefault();

    const income = Number(getElement("plannerIncome").value);
    const expenses = Number(getElement("monthlyExpenses").value);
    const payment = Number(getElement("plannedPayment").value);
    const result = getElement("plannerResult");

    if (
        !Number.isFinite(income) || income <= 0 ||
        !Number.isFinite(expenses) || expenses < 0 ||
        !Number.isFinite(payment) || payment < 0
    ) {
        result.textContent = "Please enter valid amounts.";
        return;
    }

    const remaining = income - expenses - payment;

    result.className = "mt-4 alert " +
        (remaining >= 0 ? "alert-success" : "alert-warning");

    result.textContent =
        `Money remaining after expenses and repayment: ${formatMoney(remaining)}. ` +
        (remaining >= 0
            ? "Check that this also covers savings and unexpected costs."
            : "Your planned expenses and repayment exceed your income.");
}

// Save monthly income in this browser.

function saveSettings(event) {
    event.preventDefault();

    const income = Number(getElement("settingsIncome").value);

    if (!Number.isFinite(income) || income <= 0) {
        showMessage("Enter a valid monthly income.", "warning");
        return;
    }

    monthlyIncome = income;
    localStorage.setItem("paypathIncome", String(monthlyIncome));

    updateDashboard();
    showView("settings");
    showMessage("Monthly income saved.", "success");
}

// Connect sidebar buttons to the screens.

document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
        showView(button.dataset.view);
    });
});

// Connect buttons such as Add a Loan.

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        showView(button.dataset.go);
    });
});

// Connect forms to their functions.

getElement("loanForm").addEventListener("submit", addLoan);
getElement("affordForm").addEventListener("submit", checkAffordability);
getElement("plannerForm").addEventListener("submit", calculatePlan);
getElement("settingsForm").addEventListener("submit", saveSettings);

// Load the first screen and saved records.

showView("dashboard");
loadLoans();