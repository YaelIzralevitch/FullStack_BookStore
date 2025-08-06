const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.router");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);

module.exports = app;
