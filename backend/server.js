// loads express which creates an app
const express = require('express');

// loads CORS which permits 1 url to fetch data from another
const cors = require('cors');

// dotenv helps to read .env files and extract the sensitive info
//without exposing it to the user
require('dotenv').config();

//stores the node env state from the .env file in a const
const CONFIG_NODE_ENV = process.env.NODE_ENV;

//server will listen on .env port or else default to 3000
const CONFIG_PORT = Number(process.env.PORT) || 3000;

//stores allowed origins from env in a const
const CONFIG_ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(',')
  .filter(Boolean)
  .map((s) => s.trim());

//decide which websites (origins) are allowed by CORS to call our API
//our frontend 5173 can call our server 3000 as it is in allowed origins
const configureAllowedOrigins = () => {
  if (CONFIG_NODE_ENV == 'development') {
    CONFIG_ALLOWED_ORIGINS.push('http://localhost:5173');
  }

  // else if (CONFIG_NODE_ENV == 'production') {
  //   CONFIG_ALLOWED_ORIGINS.push('http://localhost:5173');
  // }

  //explain this line in detail
  return [...new Set([...CONFIG_ALLOWED_ORIGINS])].filter(Boolean).map((o) => o.replace(/\/$/, ''));
};

//build the final allowed origins list
const allowedOrigins = configureAllowedOrigins();

// Create the Express application instance (app = our server)
const app = express();

//register a middleware function globally
// express.json() = parses JSON request bodies into req.body
app.use(express.json());

app.use(
  cors({
    // origin can be a string or a function; we use a function for custom logic
    origin: function (origin, callback) {
      // If origin is undefined/null, allow it (curl/mobile apps often have no origin)
      if (!origin) return callback(null, true); //(?)
      // allowedOrigins.includes(origin) = check if the requesting origin is in our list
      if (allowedOrigins.includes(origin)) return callback(null, true); //(whats a callback?)
      // callback(new Error(...)) = reject the request due to CORS policy (keyword: error-first callback)
      return callback(new Error('CORS blocked for origin: ' + origin));
    },
    // credentials: true = allow cookies/authorization headers across origins if needed //(?)
    credentials: true,
  })
);

app.get('/', handleRoot);
function handleRoot(req, res) {
  res.send('welcome to the default page'); //sends text on the browser window when "/"
}

app.get('/health', handleHealthCheck);
function handleHealthCheck(req, res) {
  const timestamp = new Date().toISOString();
  //if google api key exist then store true
  const hasApiKey = !!process.env.GOOGLE_API_KEY;

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

//when no route matched above
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Start the server ---
// app.listen(PORT, callback) = begin listening for incoming HTTP requests on PORT
app.listen(CONFIG_PORT, () => {
  console.log(`API listening on http://localhost:${CONFIG_PORT} (env=${CONFIG_NODE_ENV})`);
});

module.exports = app;
