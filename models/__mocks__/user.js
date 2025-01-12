/* eslint-disable no-undef */
const User = jest.fn((userData) => ({
  ...userData,
  save: jest.fn().mockResolvedValue({
    _id: "test_id",
    username: "test_username",
    email: "test@email.com",
  }),
}));

User.findById = jest.fn(() => ({
  _id: "test_id",
  username: "test_username",
  email: "test@email.com",
  toObject: jest.fn().mockReturnValue({
    _id: "test_id",
    username: "test_username",
    email: "test@email.com",
  }),
}));

module.exports = User;
