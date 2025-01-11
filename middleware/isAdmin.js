const jwt = require("jsonwebtoken");

function isAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ error: "You are not authorized to access this resource" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload && payload.admin) next();
    return res
      .status(403)
      .json({ error: "You are not authorized to view this admin resource" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Error authenticating admin: ${err.message}` });
  }
}

module.exports = isAdmin;
