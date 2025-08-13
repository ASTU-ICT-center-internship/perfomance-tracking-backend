const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFilePath = path.join(logDir, "error.log");

module.exports = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  // Handle NaN in calculations gracefully
  if (message.toLowerCase().includes("nan") || Number.isNaN(err.value)) {
    res.status(400).json({
      status: "error",
      message: "Invalid numeric calculation (NaN encountered)",
    });
    return;
  }

  // Log error to file
  const logEntry = `[${new Date().toISOString()}] ${req.method} ${
    req.originalUrl
  } - ${statusCode} - ${message}\nStack: ${err.stack || "No stack"}\n\n`;

  fs.appendFile(logFilePath, logEntry, (fsErr) => {
    if (fsErr) {
      console.error("Failed to write error log:", fsErr);
    }
  });

  // Send clean JSON response
  res.status(statusCode).json({
    status: "error",
    message,
  });
};
