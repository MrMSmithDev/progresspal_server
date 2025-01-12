/* eslint-disable no-undef */
module.exports = {
  generateSaltHash: jest.fn(() => ({ salt: "test_salt", hash: "test_hash" })),
};
