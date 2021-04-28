const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

// Environment Variables
dotenv.config({ path: "./config/config.env" });

// Database Connection
const connectDB = require("./config/db");
connectDB();

// Express init variable
const app = express();

// Body Request Parser
app.use(express.json());

// Logging middleware
const morgan = require("morgan");
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Sanitise Data
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize());

// Secure Headers
const helmet = require("helmet");
app.use(helmet());

// XSS Prevention
const xss = require("xss-clean");
app.use(xss());

// Request Rate Limiting
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// HTTP Param Pollution Prevention
const hpp = require("hpp");
app.use(hpp());

// ENable CORS
const cors = require("cors");
app.use(cors());

// File upload
const fileUpload = require("express-fileupload");
app.use(fileUpload());

// Set Static folder
app.use(express.static(path.join(__dirname, "public")));

// Router for Movies
const movies = require("./routes/movies");
app.use("/api/v1/movies", movies);

// Router for Actors
const actors = require("./routes/actors");
app.use("/api/v1/actors", actors);

// Error Handler
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// PORT: ENV PORT or 5000
const PORT = process.env.PORT || 5000;

// Server initialise
const server = app.listen(
  PORT,
  console.log(`${process.env.NODE_ENV} mode running on ${PORT}.`)
);

// Handle promise rejections
process.on("unhandledRejection", (error, promise) => {
  console.log(`error: ${error.message}.`);
  // close and exit
  server.close(() => process.exit(1));
});
