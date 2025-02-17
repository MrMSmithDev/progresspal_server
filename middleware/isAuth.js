const jwt = require("jsonwebtoken");

function isAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ error: "You are not authorized to access this resource" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    console.log(err);

    if (err.name === "TokenExpiredError")
      return res.status(401).json({ error: "Token expired" });

    return res
      .status(500)
      .json({ error: `Error authenticating token: ${err.message}` });
  }
}

module.exports = isAuth;
