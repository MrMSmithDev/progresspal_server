/* eslint-disable no-undef */
const mockClient = {
  get: jest.fn((key, callback) => callback(null, null)),
  setex: jest.fn(),
  on: jest.fn(),
};

module.exports = mockClient;
