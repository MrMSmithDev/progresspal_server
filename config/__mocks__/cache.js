/* eslint-disable no-undef */
jest.mock("redis");

const mockClient = {
  get: jest.fn((key, callback) => callback(null, null)),
  setEx: jest.fn(),
  on: jest.fn(),
  del: jest.fn(),
};

module.exports = mockClient;
