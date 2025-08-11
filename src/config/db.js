require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_SSL } = process.env;

const sslOptions =
  DB_SSL === "true"
    ? {
        rejectUnauthorized: false,
      }
    : undefined;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT ? Number(DB_PORT) : 3306,
  connectionLimit: 10,
  multipleStatements: true,
  ssl: sslOptions,
});

const initPool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  port: DB_PORT ? Number(DB_PORT) : 3306,
  connectionLimit: 10,
  multipleStatements: true,
  ssl: sslOptions,
});

async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, "..", "models", "schema.sql");
    const schemaContent = fs.readFileSync(schemaPath, "utf8");

    const splitIndex = schemaContent.indexOf(";");

    if (splitIndex === -1) {
      throw new Error(
        "Schema file does not contain a CREATE DATABASE statement ending with ;"
      );
    }

    const createDbStatement = schemaContent.slice(0, splitIndex + 1).trim();
    const restOfSchema = schemaContent.slice(splitIndex + 1).trim();

    await initPool.query(createDbStatement);

    await initPool.query(`USE \`${DB_NAME}\`;`);

    if (restOfSchema) {
      await initPool.query(restOfSchema);
    }

    console.log("Database and tables initialized successfully.");
    await initPool.end();
  } catch (error) {
    console.error("Error initializing database schema:", error);
    process.exit(1);
  }
}

module.exports = {
  pool,
  initializeDatabase,
};
