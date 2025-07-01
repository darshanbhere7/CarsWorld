// backend/routes/imagekit.js
const express = require("express");
const router = express.Router();
const imagekit = require("../config/imagekit");

router.get("/auth", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result); // { token, expire, signature }
});

module.exports = router;
