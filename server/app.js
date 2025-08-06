const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.router");
const userRoutes = require('./routes/users.routes');
//const bookRoutes = require('./routes/books.routes');
//const orderRoutes = require('./routes/orders.routes');

//const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use('/api/users', userRoutes);
//app.use('/api/books', bookRoutes);
//app.use('/api/orders', orderRoutes);

// Error Handler (last)
//app.use(errorMiddleware);

module.exports = app;
