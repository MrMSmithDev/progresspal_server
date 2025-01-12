/* eslint-disable no-undef */
module.exports = jest.fn(() => ({
  save: jest.fn(() => ({
    _id: "test_id",
    username: "test_username",
    email: "test@email.com",
  })),
}));
