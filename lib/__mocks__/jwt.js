/* eslint-disable no-undef */
module.exports = {
  generateToken: jest.fn(() => "mock_token"),
  generateRefreshToken: jest.fn(() => "mock_refresh_token"),
  authenticateRefreshToken: jest.fn(() => ({
    id: "test_id",
  })),
};
