/* eslint-disable no-undef */
const { editWeightData } = require("../../../controllers/weight");
const Weight = require("../../../models/weight");
const mongoose = require("mongoose");

jest.mock("mongoose");
jest.mock("../../../models/weight");

describe("WEIGHT editWeightData", () => {
  let req, res;
  //   const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    req = {
      body: {},
      params: {
        weightId: "test_id",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mongoose.Types.ObjectId.isValid.mockImplementation(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("finds and edits a weight field when passed valid parameters", async () => {
    req.body = { weight: "10" };

    await editWeightData(req, res);

    expect(Weight.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "test_id" },
      { weight: 10 },
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Data updated: {"weight":10}',
      result: {
        date: expect.any(String),
        _id: "test_id",
        unit: "met",
        weight: 10,
      },
    });
  });

  it("handles being passed an invalid weight gracefully by excluding the argument", async () => {
    req.body = { weight: "invalid" };

    await editWeightData(req, res);

    expect(Weight.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "test_id" },
      {},
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Data updated: {}",
      result: {
        date: expect.any(String),
        _id: "test_id",
        unit: "met",
        weight: "1",
      },
    });
  });

  it("handles being passed an invalid weight including numbers gracefully by excluding the argument", async () => {
    req.body = { weight: "10invalid" };

    await editWeightData(req, res);

    expect(Weight.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "test_id" },
      {},
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Data updated: {}",
      result: {
        date: expect.any(String),
        _id: "test_id",
        unit: "met",
        weight: "1",
      },
    });
  });

  it("finds and edits a date field when passed valid parameters", async () => {
    const newDate = new Date().toISOString();
    req.body = { date: newDate };

    await editWeightData(req, res);

    expect(Weight.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "test_id" },
      { date: expect.any(Date) },
    );
    expect(res.json).toHaveBeenCalledWith({
      message: `Data updated: {"date":"${newDate}"}`,
      result: {
        date: expect.any(Date),
        _id: "test_id",
        unit: "met",
        weight: "1",
      },
    });
  });

  it("handles being passed an invalid date gracefully", async () => {
    req.body = { date: "invalid" };

    await editWeightData(req, res);

    expect(Weight.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "test_id" },
      {},
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Data updated: {}",
      result: {
        date: expect.any(String),
        _id: "test_id",
        unit: "met",
        weight: "1",
      },
    });
  });

  it("finds and edits a unit field when passed valid parameters", async () => {
    req.body = { unit: "imp" };

    await editWeightData(req, res);

    expect(Weight.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "test_id" },
      { unit: "imp" },
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Data updated: {"unit":"imp"}',
      result: {
        date: expect.any(String),
        _id: "test_id",
        unit: "imp",
        weight: "1",
      },
    });
  });

  it("handles being passed an invalid unit gracefully", async () => {
    req.body = { unit: "invalid" };

    await editWeightData(req, res);

    expect(Weight.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "test_id" },
      {},
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Data updated: {}",
      result: {
        date: expect.any(String),
        _id: "test_id",
        unit: "met",
        weight: "1",
      },
    });
  });

  it("handles being passed multiple values to edit", async () => {
    req.body = { weight: "10", unit: "imp" };

    await editWeightData(req, res);

    expect(Weight.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "test_id" },
      { weight: 10, unit: "imp" },
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Data updated: {"weight":10,"unit":"imp"}',
      result: {
        date: expect.any(String),
        _id: "test_id",
        unit: "imp",
        weight: 10,
      },
    });
  });

  it("handles being passed multiple values to edit", async () => {
    const newDate = new Date().toISOString();
    req.body = { weight: "10", unit: "imp", date: newDate };

    await editWeightData(req, res);

    expect(Weight.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "test_id" },
      { weight: 10, unit: "imp", date: expect.any(Date) },
    );
    expect(res.json).toHaveBeenCalledWith({
      message: `Data updated: {"date":"${newDate}","weight":10,"unit":"imp"}`,
      result: {
        date: expect.any(Date),
        _id: "test_id",
        unit: "imp",
        weight: 10,
      },
    });
  });

  it("handles being passed multiple values to edit", async () => {
    const newDate = new Date().toISOString();
    req.body = { weight: "100", date: newDate };

    await editWeightData(req, res);

    expect(Weight.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "test_id" },
      { weight: 100, date: expect.any(Date) },
    );
    expect(res.json).toHaveBeenCalledWith({
      message: `Data updated: {"date":"${newDate}","weight":100}`,
      result: {
        date: expect.any(Date),
        _id: "test_id",
        unit: "met",
        weight: 100,
      },
    });
  });

  it("handles being passed a mixture of valid and invalid arguments", async () => {
    const newDate = new Date("invalid");
    req.body = { weight: "100", date: newDate };

    await editWeightData(req, res);

    expect(Weight.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "test_id" },
      { weight: 100 },
    );
    expect(res.json).toHaveBeenCalledWith({
      message: `Data updated: {"weight":100}`,
      result: {
        date: expect.any(String),
        _id: "test_id",
        unit: "met",
        weight: 100,
      },
    });
  });

  it("returns 400 and relevant error message on invalid weightId", async () => {
    req.params.weightId = "invalid";
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await editWeightData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid weightId" });
  });

  it("returns 500 and relevant error message on database error", async () => {
    const mockError = new Error("Database error");
    Weight.findOneAndUpdate.mockRejectedValueOnce(mockError);

    await editWeightData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
