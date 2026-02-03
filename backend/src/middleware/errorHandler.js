const fs = require('fs');

const errorHandler = (err, req, res, next) => {
    try {
        fs.writeFileSync('global_error.log', (err.stack || err.toString()) + '\n');
    } catch (e) {
        console.error("Failed to write log", e);
    }
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        error: message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

module.exports = errorHandler;
