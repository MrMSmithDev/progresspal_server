/* eslint-disable no-undef */
const Weight = jest.fn((weightData) => ({
  ...weightData,
  save: jest.fn().mockResolvedValue({
    _id: "test_id",
    unit: "met",
    date: new Date().toISOString(),
    weight: "10",
  }),
}));

Weight.findById = jest.fn(() => ({
  _id: "test_id",
  userId: "test_user",
  unit: "met",
  date: "test_date",
  weight: "1",
}));

Weight.findOneAndUpdate = jest.fn((filter, options) => ({
  _id: "test_id",
  unit: "met",
  date: new Date().toISOString(),
  weight: "1",
  ...options,
}));

Weight.deleteOne = jest.fn(() => ({
  deletedCount: 1,
}));

Weight.select = jest.fn(() => ({
  userId: "12345",
}));

Weight.findOne = jest.fn(() => ({
  select: Weight.select,
}));

module.exports = Weight;
