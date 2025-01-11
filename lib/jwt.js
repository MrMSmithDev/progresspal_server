const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, admin: user.admin },
    JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
}

function generateRefreshToken(id) {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, {
    expiresIn: "365d",
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function returnUser(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  return payload;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.user = payload;
    next();
  } catch (err) {
    res.status(403).json({ error: `Error authenticating JWT token: ${err}` });
  }
}

function authenticateRefreshToken(token) {
  const authenticated = jwt.verify(
    token,
    JWT_REFRESH_SECRET,
    (err, decoded) => {
      if (err) return false;
      return decoded;
    },
  );
  return authenticated;
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  authenticateToken,
  authenticateRefreshToken,
  returnUser,
};
