/* eslint-disable no-undef */
jest.mock("redis");

const mockClient = {
  get: jest.fn(() => {}),
  set: jest.fn(),
  on: jest.fn(),
  del: jest.fn(),
};

module.exports = { cache: mockClient };
