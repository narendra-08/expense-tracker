import "./style.css";
import { renderIncomeExpenseChart } from "./charts/incomeExpense.chart.js";
import { renderCategoryChart } from "./charts/category.chart.js";
import { API_BASE } from "./config.js";

/* ===============================
   STATE
================================ */
let transactions = [];
let currentUser = null;

let filters = {
  type: "all",
  search: ""
};

/* ===============================
   DOM
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
   UI
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
   AUTH – SIGNUP
================================ */
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  const res = await fetch(`${API_BASE}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Signup failed");
    return;
  }

  alert("Signup successful! Please login.");
  loginTab.click();
});

/* ===============================
   AUTH – LOGIN
================================ */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Login failed");
    return;
  }

  currentUser = data.user;
  document.getElementById("user-name").innerText = currentUser.name;
  showDashboard();
  loadTransactions();
});

/* ===============================
   TRANSACTIONS
================================ */
async function loadTransactions() {
  const res = await fetch(`${API_BASE}/api/transactions`);
  transactions = await res.json();
  renderUI();
}

async function deleteTransaction(id) {
  await fetch(`${API_BASE}/api/transactions/${id}`, {
    method: "DELETE"
  });
  loadTransactions();
}

/* ===============================
   FILTER + RENDER
================================ */
function getFilteredTransactions() {
  return transactions.filter(tx => {
    if (filters.type !== "all" && tx.type !== filters.type) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !tx.category.toLowerCase().includes(q) &&
        !(tx.note || "").toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });
}

function renderUI() {
  const filtered = getFilteredTransactions();
  tbody.innerHTML = "";

  let income = 0;
  let expense = 0;
  const categoryMap = {};

  filtered.forEach(tx => {
    const amt = Number(tx.amount);
    if (tx.type === "income") income += amt;
    else {
      expense += amt;
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + amt;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>-</td>
      <td class="${tx.type === "income" ? "badge-income" : "badge-expense"}">${tx.type}</td>
      <td>${tx.category}</td>
      <td>${tx.note || "-"}</td>
      <td>₹${amt}</td>
      <td><button class="delete-btn" data-id="${tx.id}">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });

  balanceEl.innerText = "₹" + (income - expense);
  incomeEl.innerText = "₹" + income;
  expenseEl.innerText = "₹" + expense;

  renderIncomeExpenseChart(document.getElementById("txChart"), income, expense);
  renderCategoryChart(document.getElementById("catChart"), categoryMap);

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteTransaction(btn.dataset.id));
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

  await fetch(`${API_BASE}/api/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTx)
  });

  txForm.reset();
  loadTransactions();
});

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
   TABS + INIT
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

demoBtn.addEventListener("click", () => {
  currentUser = { name: "Demo User" };
  document.getElementById("user-name").innerText = "Demo User";
  showDashboard();
  loadTransactions();
});

logoutBtn.addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", showLogin);
