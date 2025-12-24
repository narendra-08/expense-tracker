import "./style.css";
import { renderIncomeExpenseChart } from "./charts/incomeExpense.chart.js";
import { renderCategoryChart } from "./charts/category.chart.js";

let transactions = [];
let currentUser = null;

/* ===============================
   FILTER STATE
================================ */
let filters = {
  type: "all",
  search: ""
};

/* ===============================
   DOM ELEMENTS
================================ */
const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");

const demoBtn = document.getElementById("demo-btn");
const logoutBtn = document.getElementById("logout-btn");

const txForm = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("total-income");
const expenseEl = document.getElementById("total-expense");

const typeFilter = document.getElementById("type-filter");
const searchInput = document.getElementById("search-input");

/* ===============================
   UI FUNCTIONS
================================ */
function showLogin() {
  authSection.classList.remove("hidden");
  dashboard.classList.add("hidden");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
}

function showDashboard() {
  authSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
}

function logout() {
  currentUser = null;
  showLogin();
}

/* ===============================
   LOAD TRANSACTIONS
================================ */
async function loadTransactions() {
  const res = await fetch("http://localhost:5000/api/transactions");
  transactions = await res.json();
  renderUI();
}

/* ===============================
   APPLY FILTERS
================================ */
function getFilteredTransactions() {
  return transactions.filter(tx => {
    // TYPE FILTER
    if (filters.type !== "all" && tx.type !== filters.type) {
      return false;
    }

    // SEARCH FILTER
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        tx.category.toLowerCase().includes(q) ||
        (tx.note || "").toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

/* ===============================
   RENDER UI
================================ */
function renderUI() {
  const filtered = getFilteredTransactions();
  tbody.innerHTML = "";

  let income = 0;
  let expense = 0;
  const categoryMap = {};

  filtered.forEach(tx => {
    const amt = Number(tx.amount);

    if (tx.type === "income") {
      income += amt;
    } else {
      expense += amt;
      categoryMap[tx.category] =
        (categoryMap[tx.category] || 0) + amt;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>-</td>
      <td class="${tx.type === "income" ? "badge-income" : "badge-expense"}">
        ${tx.type}
      </td>
      <td>${tx.category}</td>
      <td>${tx.note || "-"}</td>
      <td>₹${amt}</td>
      <td>
        <button class="delete-btn" data-id="${tx.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  /* SUMMARY */
  balanceEl.innerText = "₹" + (income - expense);
  incomeEl.innerText = "₹" + income;
  expenseEl.innerText = "₹" + expense;

  /* CHARTS */
  renderIncomeExpenseChart(
    document.getElementById("txChart"),
    income,
    expense
  );

  renderCategoryChart(
    document.getElementById("catChart"),
    categoryMap
  );

  /* DELETE EVENTS */
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      deleteTransaction(btn.dataset.id);
    });
  });
}

/* ===============================
   ADD TRANSACTION
================================ */
txForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newTx = {
    type: document.getElementById("tx-type").value,
    amount: Number(document.getElementById("tx-amount").value),
    category: document.getElementById("tx-category").value,
    note: document.getElementById("tx-note").value,
    date: document.getElementById("tx-date").value
  };

  await fetch("http://localhost:5000/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTx)
  });

  txForm.reset();
  loadTransactions();
});

/* ===============================
   DELETE TRANSACTION
================================ */
async function deleteTransaction(id) {
  await fetch(`http://localhost:5000/api/transactions/${id}`, {
    method: "DELETE"
  });
  loadTransactions();
}

/* ===============================
   FILTER EVENTS
================================ */
typeFilter.addEventListener("change", () => {
  filters.type = typeFilter.value;
  renderUI();
});

searchInput.addEventListener("input", () => {
  filters.search = searchInput.value.trim();
  renderUI();
});

/* ===============================
   AUTH (TEMP)
================================ */
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  showDashboard();
  loadTransactions();
});

demoBtn.addEventListener("click", () => {
  currentUser = { name: "Demo User" };
  document.getElementById("user-name").innerText = "Demo User";
  showDashboard();
  loadTransactions();
});

logoutBtn.addEventListener("click", logout);

/* ===============================
   TAB SWITCH
================================ */
loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
});

signupTab.addEventListener("click", () => {
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {
  showLogin();
});
