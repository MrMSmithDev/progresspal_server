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

User.limit = jest.fn(() => [
  { _id: "test_id", username: "test_username", email: "test@email.com" },
  { _id: "test_id2", username: "test_username2", email: "test@email.com2" },
]);

User.find = jest.fn(() => ({
  limit: User.limit,
}));

User.updateOne = jest.fn(() => "docid-5");

module.exports = User;
