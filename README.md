PayPath — Your Money, Your Way Forward

Overview

PayPath is a loan and repayment planning web application designed to help users track their loans, understand upcoming repayments, and make informed financial decisions.

Problem Statement

Managing loan balances, repayment dates, and monthly expenses can be difficult. PayPath provides a simple dashboard to organize loan information and help users assess repayment affordability.

Objectives

- Track loan balances and repayment dates.
- Summarize outstanding loans and repayments due during the current month.
- Help users plan monthly loan repayments.
- Estimate repayment affordability based on income and expenses.

Features

- Dashboard with financial summaries.
- Loan management: add, view, and delete loans.
- Payment planner.
- Loan affordability checker.
- Monthly income settings.
- Backend API for loan records.

Technologies Used

- HTML5
- CSS3
- Bootstrap 5
- JavaScript
- Node.js
- Express.js
- JSON file storage

Project Structure

- "index.html" — application structure.
- "style.css" — styling and responsive layout.
- "index.js" — frontend logic and API communication.
- "server.js" — backend server and API endpoints.
- "data/loans.json" — local loan data storage.
- "package.json" — project dependencies and scripts.

Installation and Setup

1. Install Node.js.
2. Clone or download this repository.
3. Open the project folder in a terminal.
4. Install dependencies using "npm install".
5. Start the application using "npm start".
6. Open "http://localhost:3000" in your browser.

API Endpoints

- "GET /api/loans" — retrieve saved loans.
- "POST /api/loans" — add a loan.
- "DELETE /api/loans/:id" — delete a loan by its ID.

Limitations

This is an educational prototype. Loan records are stored locally in a JSON file. The application does not yet provide user authentication, a production database, or integration with actual financial institutions.

Author

Martin Muriithi

Disclaimer

PayPath is a financial planning demonstration, not a lender or a substitute for professional financial advice.
