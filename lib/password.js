const crypto = require("crypto");

function _generateHash(string, salt) {
  return crypto.pbkdf2Sync(string, salt, 10000, 64, "sha512").toString("hex");
}

function generateSaltHash(string) {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = _generateHash(string, salt);
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  if (
    typeof password !== "string" ||
    typeof hash !== "string" ||
    typeof salt !== "string"
  ) {
    return false;
  }

  const hashedPassword = _generateHash(password, salt);
  return hashedPassword == hash;
}

module.exports = { generateSaltHash, verifyPassword };
