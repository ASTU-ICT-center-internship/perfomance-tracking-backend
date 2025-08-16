const { pool } = require("../config/db");

exports.uploadUserPhoto = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Check if logged-in user matches the ID or is an admin
    if (req.user.uid !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this user's photo" });
    }

    if (!req.file) {
      console.log("file saved in uploads");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const photoPath = req.file.filename;

    const [result] = await pool.query(
      "UPDATE user SET photo = ? WHERE uid = ?",
      [photoPath, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Photo uploaded successfully",
      photo: photoPath,
    });
  } catch (error) {
    next(error);
  }
};
