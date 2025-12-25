import "./style.css";
import { renderIncomeExpenseChart } from "./charts/incomeExpense.chart.js";
import { renderCategoryChart } from "./charts/category.chart.js";
import { API_BASE } from "./config.js";

let transactions = [];
let currentUser = null;

/* ===============================
   DOM ELEMENTS
================================ */
const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");

const logoutBtn = document.getElementById("logout-btn");
const demoBtn = document.getElementById("demo-btn");

const txForm = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("total-income");
const expenseEl = document.getElementById("total-expense");

/* ===============================
   UI HELPERS
================================ */
function showLogin() {
  authSection.classList.remove("hidden");
  dashboard.classList.add("hidden");
}

function showDashboard() {
  authSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
}

/* ===============================
   SIGNUP
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
    alert(data.message);
    return;
  }

  alert("Signup successful, now login");
  signupForm.reset();
});

/* ===============================
   LOGIN
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
    alert(data.message);
    return;
  }

  currentUser = data.user;
  document.getElementById("user-name").innerText = currentUser.name;

  showDashboard();
  loadTransactions();
});

/* ===============================
   LOAD TRANSACTIONS
================================ */
async function loadTransactions() {
  const res = await fetch(`${API_BASE}/api/transactions`);
  transactions = await res.json();
  renderUI();
}

/* ===============================
   RENDER UI
================================ */
function renderUI() {
  tbody.innerHTML = "";

  let income = 0;
  let expense = 0;
  const categoryMap = {};

  transactions.forEach(tx => {
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
      <td>${tx.date || "-"}</td>
      <td>${tx.type}</td>
      <td>${tx.category}</td>
      <td>${tx.note || "-"}</td>
      <td>₹${amt}</td>
      <td>
        <button class="delete-btn" data-id="${tx.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  balanceEl.innerText = "₹" + (income - expense);
  incomeEl.innerText = "₹" + income;
  expenseEl.innerText = "₹" + expense;

  renderIncomeExpenseChart(
    document.getElementById("txChart"),
    income,
    expense
  );

  renderCategoryChart(
    document.getElementById("catChart"),
    categoryMap
  );

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await fetch(`${API_BASE}/api/transactions/${btn.dataset.id}`, {
        method: "DELETE"
      });
      loadTransactions();
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

  await fetch(`${API_BASE}/api/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTx)
  });

  txForm.reset();
  loadTransactions();
});

/* ===============================
   LOGOUT
================================ */
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  showLogin();
});

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", showLogin);
