const bcrypt = require("bcrypt");
const db = require("../config/db");
const { getDivisionIdByName } = require("./division.controller");

const addUser = async (req, res, next) => {
  try {
    const { name, email, password, gender, division, role } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!name || !email || !password || !role || !gender) {
      return res.status(400).json({
        message: "Name, gender, email, role, and password are required.",
      });
    }

    if (!["admin", "employee", "supervisor"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be 'admin', 'employee', or 'supervisor'.",
      });
    }

    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({
        message: "Invalid gender. Must be 'male', 'female', or 'other'.",
      });
    }

    const existingUser = await db.query(
      "SELECT email FROM `user` WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const divisionId = await getDivisionIdByName(division);

    await db.query(
      `INSERT INTO \`user\` (name, email, password, photo, gender, division_id, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, photo, gender, divisionId, role]
    );

    return res.status(201).json({ message: "User added successfully." });
  } catch (error) {
    console.error("Error in adding user:", error);
    next(error);
  }
};

const updateUserInfo = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { name, email, gender, role, division } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    if (gender && !["male", "female", "other"].includes(gender)) {
      return res.status(400).json({
        message: "Invalid gender. Must be 'male', 'female', or 'other'.",
      });
    }

    if (role && !["admin", "employee", "supervisor"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be 'admin', 'employee', or 'supervisor'.",
      });
    }

    const existingUser = await db.query(
      "SELECT uid FROM `user` WHERE email = ? AND uid != ?",
      [email, uid]
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "Email is already in use by another user." });
    }

    const updatedFields = [];
    const values = [];

    if (name) {
      updatedFields.push("name = ?");
      values.push(name);
    }
    if (email) {
      updatedFields.push("email = ?");
      values.push(email);
    }
    if (photo) {
      updatedFields.push("photo = ?");
      values.push(photo);
    }
    if (gender) {
      updatedFields.push("gender = ?");
      values.push(gender);
    }
    if (division) {
      const divisionId = await getDivisionIdByName(division);
      updatedFields.push("division_id = ?");
      values.push(divisionId);
    }
    if (role) {
      updatedFields.push("role = ?");
      values.push(role);
    }

    if (updatedFields.length === 0) {
      return res
        .status(400)
        .json({ message: "No fields provided for update." });
    }

    values.push(uid);

    const updateUserQuery =
      "UPDATE `user` SET " + updatedFields.join(", ") + " WHERE uid = ?";

    const results = await db.query(updateUserQuery, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      message: "User information updated successfully.",
    });
  } catch (error) {
    console.error("Error in updating user info:", error);
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const users = await db.query(
      `SELECT u.*, d.name as division_name
       FROM \`user\` u
       LEFT JOIN division d ON u.division_id = d.id
       WHERE u.uid = ?`,
      [uid]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Error in getting user by ID:", error);
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await db.query(
      `SELECT u.*, d.name as division_name
       FROM \`user\` u
       LEFT JOIN division d ON u.division_id = d.id`
    );
    res.json(users);
  } catch (error) {
    console.error("Error in getting all users:", error);
    next(error);
  }
};

const adminRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingAdmin = await db.query(
      "SELECT email FROM `user` WHERE email = ? AND role = 'admin'",
      [email]
    );

    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: "Admin already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO \`user\` (name, email, password, role)
       VALUES (?, ?, ?, 'admin')`,
      [name, email, hashedPassword]
    );

    return res.status(201).json({ message: "Admin registered successfully." });
  } catch (error) {
    console.error("Error in admin registration:", error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { uid } = req.params;

    const results = await db.query("DELETE FROM `user` WHERE uid = ?", [uid]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    next(error);
  }
};

module.exports = {
  adminRegister,
  addUser,
  updateUserInfo,
  getUserById,
  getAllUsers,
  deleteUser,
};
