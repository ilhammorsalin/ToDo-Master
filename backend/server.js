// Bring in the tools we need ("imports" for Node's CommonJS)
// const = create a variable that won't be reassigned (keyword: const)
// require('express') = load the Express library (keyword: require = CommonJS import)
// 'express' = the package name from npm that returns a function to create an app
const express = require('express');
// cors = a library that controls which websites can talk to our server (Cross-Origin Resource Sharing)
// require('cors') loads the cors middleware factory function
const cors = require('cors');
// dotenv = library that reads a .env file and puts values into process.env
// .config() = initialize dotenv so environment variables become available (keyword: method call)
require('dotenv').config();

// Config section: set common settings with safe defaults
// process.env = object that holds environment variables (keyword: environment variables)
// NODE_ENV = a common flag to indicate environment: 'development', 'test', or 'production'
// || 'development' = use 'development' if nothing is set (keyword: logical OR for default)
const CONFIG_NODE_ENV = process.env.NODE_ENV;
// PORT = which TCP port the server listens on (number between ~1024 and 65535 in dev)
// Number(...) = convert string to a number (keyword: type conversion)
// || 5000 = default to 5000 if PORT isn't set in .env or the shell
const CONFIG_PORT = Number(process.env.PORT);
const CONFIG_ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(',')
  .filter(Boolean)
  .map((s) => s.trim());
// Allowed origins helper
// Purpose: decide which websites (origins) are allowed by CORS to call our API
// Origin = scheme + host + port (e.g., http://localhost:5173)
// .env usage: ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

const configureAllowedOrigins = () => {
  if (CONFIG_NODE_ENV == 'development') {
    CONFIG_ALLOWED_ORIGINS.push('http://localhost:5173');
  }

  // else if (CONFIG_NODE_ENV == 'production') {
  //   CONFIG_ALLOWED_ORIGINS.push('http://localhost:5173');
  // }

  return [...new Set([...CONFIG_ALLOWED_ORIGINS])].filter(Boolean).map((o) => o.replace(/\/$/, ''));
};

// Call the helper to build the final allowed origins list
const allowedOrigins = configureAllowedOrigins();

// Create the Express application instance (app = our server)
// express() returns an object with methods like get, use, listen
const app = express();

// --- Middleware (code that runs before your route handlers) ---
// app.use(...) = register a middleware function globally (keyword: middleware)
// express.json() = built-in middleware that parses JSON request bodies into req.body
app.use(express.json());
// cors(...) = returns a middleware that checks the request's origin against our allowlist
app.use(
  cors({
    // origin can be a string or a function; we use a function for custom logic
    origin: function (origin, callback) {
      // If origin is undefined/null, allow it (curl/mobile apps often have no origin)
      if (!origin) return callback(null, true);
      // allowedOrigins.includes(origin) = check if the requesting origin is in our list
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // callback(new Error(...)) = reject the request due to CORS policy (keyword: error-first callback)
      return callback(new Error('CORS blocked for origin: ' + origin));
    },
    // credentials: true = allow cookies/authorization headers across origins if needed
    credentials: true,
  })
);

// Route handler function for GET /
// function handleRoot(req, res) { ... } = named function that receives request and response objects
function handleRoot(req, res) {
  // res.send(...) = send plain text or HTML back to the client (keyword: response)
  res.send('welcome to the default page');
}

// Route handler for GET /health that reports server status
function handleHealthCheck(req, res) {
  // new Date().toISOString() = current time in a standard string format
  const timestamp = new Date().toISOString();
  // !!value = convert to boolean; true if GOOGLE_API_KEY exists (keyword: double-bang)
  const hasApiKey = !!process.env.GOOGLE_API_KEY;

  // healthStatus = plain JS object describing current state (keyword: object literal)
  const healthStatus = {
    status: 'healthy', // simple status text
    timestamp, // shorthand for timestamp: timestamp (keyword: property shorthand)
    api: {
      running: true, // our API is up
      port: CONFIG_PORT, // current port number
      env: CONFIG_NODE_ENV, // environment string
      allowedOrigins, // which origins are allowed (array)
    },
    gemini: {
      configured: hasApiKey, // whether GOOGLE_API_KEY is present
      // conditional (ternary) operator: pick a model name if configured, otherwise 'unavailable'
      model: hasApiKey ? 'gemini-2.5-flash' : 'unavailable',
    },
    // process.uptime() = seconds since the Node process started (keyword: uptime)
    uptime: process.uptime(),
  };

  // Log a human-friendly line to the console for quick debugging
  console.log(
    `[${timestamp}] API Status: Running, Gemini: ${hasApiKey ? 'Configured' : 'Not configured'}`
  );

  // res.json(obj) = send JSON response (auto sets Content-Type: application/json)
  res.json(healthStatus);
}

// --- Routes (map HTTP method + path to a handler function) ---
// app.get(path, handler) = respond to GET requests at the given path
app.get('/', handleRoot); // GET / -> handleRoot
app.get('/health', handleHealthCheck); // GET /health -> handleHealthCheck

// 404 handler (catch-all) when no route matched above
// app.use((req,res)=>...) without a path = runs for any request not handled earlier
app.use((req, res) => {
  // res.status(404) = set HTTP status code to 404 (Not Found)
  // .json({ ... }) = send a JSON body back
  res.status(404).json({ error: 'Not found' });
});

// --- Start the server ---
// app.listen(PORT, callback) = begin listening for incoming HTTP requests on PORT
// The callback runs once the server is up; we print helpful info to the console
app.listen(CONFIG_PORT, () => {
  // Template string (backticks) with ${...} placeholders (keyword: template literal)
  console.log(`API listening on http://localhost:${CONFIG_PORT} (env=${CONFIG_NODE_ENV})`);
});

// Export the app instance for testing or external usage (keyword: module.exports = CommonJS export)
module.exports = app;
