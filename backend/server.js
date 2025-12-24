import express from "express";
import cors from "cors";

const app = express();

/* ===============================
   MIDDLEWARES
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   PORT (IMPORTANT FOR RENDER)
================================ */
const PORT = process.env.PORT || 5000;

/* ===============================
   TEMP DATABASE (IN-MEMORY)
================================ */
let users = [];
let transactions = [];

/* ===============================
   ROOT ROUTE (RENDER CHECK)
================================ */
app.get("/", (req, res) => {
  res.send("Expense Tracker Backend is running 🚀");
});

/* ===============================
   DEBUG ROUTE (DEPLOY CHECK)
================================ */
app.get("/api/debug", (req, res) => {
  res.json({
    status: "API routes loaded successfully",
    time: new Date().toISOString()
  });
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running healthy ✅" });
});

/* ===============================
   SIGNUP
================================ */
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = { id: Date.now(), name, email, password };
  users.push(user);

  res.json({ message: "Signup successful" });
});

/* ===============================
   LOGIN
================================ */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    message: "Login successful",
    user: { id: user.id, name: user.name, email: user.email }
  });
});

/* ===============================
   TRANSACTIONS CRUD
================================ */
app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

app.post("/api/transactions", (req, res) => {
  const tx = { id: Date.now(), ...req.body };
  transactions.push(tx);
  res.status(201).json(tx);
});

app.delete("/api/transactions/:id", (req, res) => {
  const id = Number(req.params.id);
  transactions = transactions.filter(tx => tx.id !== id);
  res.json({ success: true });
});

/* ===============================
   404 HANDLER (LAST)
================================ */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
