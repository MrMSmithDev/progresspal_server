/* eslint-disable no-undef */
const User = jest.fn((userData) => ({
  ...userData,
  save: jest.fn().mockResolvedValue({
    _id: "test_id",
    username: "test_username",
    email: "test@email.com",
  }),
}));

User.deleteOne = jest.fn(() => ({
  deletedCount: 1,
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
  {
    _id: "test_id",
    username: "test_username",
    email: "test@email.com",
    salt: "test_salt",
    hash: "test_hash",
  },
  {
    _id: "test_id2",
    username: "test_username2",
    email: "test@email.com2",
    salt: "test_salt",
    hash: "test_hash",
  },
]);

User.skip = jest.fn(() => ({
  limit: User.limit,
}));

User.find = jest.fn(() => ({
  skip: User.skip,
  limit: User.limit,
}));

User.updateOne = jest.fn(() => "docid-5");

module.exports = User;
