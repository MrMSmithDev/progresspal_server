/* eslint-disable no-undef */
jest.mock("redis");

const mockClient = {
  get: jest.fn((key, callback) => callback(null, null)),
  setex: jest.fn(),
  on: jest.fn(),
  del: jest.fn(),
};

module.exports = mockClient;
