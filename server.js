require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { pool: db, initializeDatabase } = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const adminRoutes = require("./src/routes/admin.routes");
const userRoutes = require("./src/routes/user.routes");
const typeRoutes = require("./src/routes/type.routes");
const evaluationRoutes = require("./src/routes/evaluation.routes");
const supervisorRoutes = require("./src/routes/supervisor.routes");
const employeeRoutes = require("./src/routes/employee.routes");
const divisionRoutes = require("./src/routes/division.routes");
const criteriaRoutes = require("./src/routes/criteria.routes");
const reportRoutes = require("./src/routes/report.routes");
const globalErrorMiddleware = require("./src/middlewares/global.error.middleware");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




(async () => {
  await initializeDatabase();

  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/type", typeRoutes);
  app.use("/api/evaluations", evaluationRoutes);
  app.use("/api/supervisor", supervisorRoutes);
  app.use("/api/employee", employeeRoutes);
  app.use("/api/divisions", divisionRoutes);
  app.use("/api/criteria", criteriaRoutes);
  app.use("/api/report", reportRoutes);

  //app.use(globalErrorMiddleware);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})();
