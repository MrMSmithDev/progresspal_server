/* eslint-disable no-undef */
module.exports = {
  verifySignupInput: jest.fn(() =>
    Promise.resolve({ status: 200, error: null }),
  ),
  verifyWorkoutInput: jest.fn(() => ({ status: 200, error: null })),
  verifyUpdatePasswordInput: jest.fn(() => ({ status: 200, error: null })),
};
