const express = require("express");
const dotenv = require("dotenv");

// Load Environment Variables
dotenv.config({ path: "./config/config.env" });

const APP = express();

const PORT = process.env.PORT || 5000;

APP.listen(
  PORT,
  console.log(`${process.env.NODE_ENV} mode running on ${PORT}.`)
);
