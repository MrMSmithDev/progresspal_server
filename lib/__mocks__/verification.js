/* eslint-disable no-undef */
module.exports = {
  verifySignupInput: jest.fn(() =>
    Promise.resolve({ status: 200, error: null }),
  ),
};
