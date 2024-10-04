const express = require("express");
const app = express();
const port = 3000;

// Middleware to parse JSON bodies (for POST requests)
app.use(express.json());

// Vulnerable CORS Setup
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// 1. Route to set a cookie
app.get("/set-cookie", (req, res) => {
  res.setHeader('Set-Cookie', 'myCookie=12345; HttpOnly');
  res.send("Cookie has been set!");
});

// 2. Route to send JSON only if the cookie exists
app.get("/protected-json", (req, res) => {
  const cookies = req.headers.cookie;

  if (cookies && cookies.includes('myCookie=12345')) {
    res.json({ message: "Here is your protected JSON data!" });
  } else {
    res.status(401).send("Unauthorized: No valid cookie found");
  }
});

// Simple homepage route
app.get("/", (req, res) => {
  res.send(`Welcome to my server! This is the homepage on port ${port}`);
});

// Route with URL parameters (req.params)
app.get("/:name", (req, res) => {
  res.send(`Hello ${req.params.name}`);
});

// Route with query parameters (req.query)
app.get("/search", (req, res) => {
  const query = req.query.q;
  if (query) {
    res.send(`You searched for: ${query}`);
  } else {
    res.send("Please provide a search query using ?q=your-query");
  }
});

// Route with request body (POST request) (req.body)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    res.send(`Login successful! Welcome, ${username}`);
  } else {
    res.send("Please provide a valid username and password.");
  }
});

// Get full domain and construct a reset password link (req.get)
app.post("/forgot-password", (req, res) => {
  const email = req.body.email;
  if (email) {
    const protocol = req.protocol;
    const host = req.get('host');
    const resetToken = 'dummy-token';
    const resetLink = `${protocol}://${host}/reset-password/${resetToken}`;
    res.send(`Password reset link sent to ${email}: ${resetLink}`);
  } else {
    res.send("Please provide your email address.");
  }
});

// Fetch request headers
app.get("/headers", (req, res) => {
  res.json({
    "Your-User-Agent": req.get("User-Agent"),
    "All-Headers": req.headers
  });
});

// Additional Routes for Security Testing

// Reflected XSS
app.get("/xss", (req, res) => {
  res.send(`<h1>${req.query.input}</h1>`);
});

// SQL Injection-like Vulnerability
app.get("/user", (req, res) => {
  res.send(`SELECT * FROM users WHERE username = '${req.query.username}'`);
});

// Open Redirect
app.get("/redirect", (req, res) => {
  res.redirect(req.query.target);
});

// Directory Traversal (Simulated)
app.get("/file", (req, res) => {
  res.send(`Serving file: /public/${req.query.path}`);
});

// Insecure JSON Parsing
app.post("/json-parse", (req, res) => {
  const jsonInput = JSON.parse(req.body.data);  // No validation
  res.json(jsonInput);
});

// Weak Password Validation
app.post("/login-weak", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "password") {
    res.send("Logged in with weak credentials");
  } else {
    res.status(401).send("Unauthorized");
  }
});

// Command Injection-like Behavior
app.get("/exec", (req, res) => {
  const command = req.query.cmd;
  res.send(`Executing: ${command}`);
});

// Insufficient Rate Limiting
let counter = 0;
app.get("/rate-limit", (req, res) => {
  counter++;
  res.send(`Counter: ${counter}`);
});

// Vulnerable to Cross-Site Request Forgery (CSRF)
app.post("/change-email", (req, res) => {
  res.send(`Email changed to: ${req.body.email}`);
});

// Insecure Cookie Handling (No Secure flag)
app.get("/insecure-cookie", (req, res) => {
  res.setHeader('Set-Cookie', 'insecureCookie=test123; SameSite=None');
  res.send("An insecure cookie (no Secure flag) has been set!");
});

// Cross-Site Scripting (XSS) Attack Simulation
app.get("/xss-vulnerable", (req, res) => {
  const userInput = req.query.name || "Stranger";
  res.send(`<h1>Welcome, ${userInput}</h1>`);
});

// SQL Injection-like Vulnerability Simulation (No input validation)
app.get("/search-user", (req, res) => {
  const username = req.query.username || "anonymous";
  res.send(`SELECT * FROM users WHERE username = '${username}'`);
});

// Testing for Missing Authentication on Protected Route
app.get("/protected-route", (req, res) => {
  const cookies = req.headers.cookie;

  if (cookies && cookies.includes('authCookie=true')) {
    res.send("Access granted to the protected route.");
  } else {
    res.status(403).send("Access denied. No valid auth cookie found.");
  }
});

// Testing Open Redirect Vulnerability
app.get("/redirect", (req, res) => {
  const target = req.query.target || "http://localhost:3000";
  res.redirect(target);
});
