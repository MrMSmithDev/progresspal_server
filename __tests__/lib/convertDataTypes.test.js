/* eslint-disable no-undef */
const { convertExerciseToInt } = require("../../lib/convertDataTypes");

describe("convertExerciseToInt", () => {
  it("should convert valid weights and reps to integers", () => {
    const input = [
      {
        sets: [
          { weight: "45.6", reps: "12" },
          { weight: "30", reps: "10.9" },
        ],
      },
    ];

    const result = convertExerciseToInt(input);
    expect(result).toEqual([
      {
        sets: [
          { weight: 45, reps: 12 },
          { weight: 30, reps: 10 },
        ],
      },
    ]);
  });

  it("should handle invalid weights and reps by setting them to 0", () => {
    const input = [
      {
        sets: [
          { weight: "abc", reps: "xyz" },
          { weight: null, reps: undefined },
        ],
      },
    ];

    const result = convertExerciseToInt(input);
    expect(result).toEqual([
      {
        sets: [
          { weight: 0, reps: 0 },
          { weight: 0, reps: 0 },
        ],
      },
    ]);
  });

  it("should convert distance to an integer", () => {
    const input = [
      {
        distance: "100.5",
      },
    ];

    const result = convertExerciseToInt(input);
    expect(result).toEqual([
      {
        distance: 100,
      },
    ]);
  });

  it("should handle invalid distance by setting it to null", () => {
    const input = [
      {
        distance: "not_a_number",
      },
    ];

    const result = convertExerciseToInt(input);
    expect(result).toEqual([
      {
        distance: 0,
      },
    ]);
  });

  it("should handle a mix of valid and invalid values", () => {
    const input = [
      {
        sets: [
          { weight: "50.9", reps: "8.3" },
          { weight: "invalid", reps: "5" },
        ],
        distance: "15",
      },
      {
        sets: [{ weight: 100, reps: "12a" }],
        distance: "wrong",
      },
    ];

    const result = convertExerciseToInt(input);
    expect(result).toEqual([
      {
        sets: [
          { weight: 50, reps: 8 },
          { weight: 0, reps: 5 },
        ],
        distance: 15,
      },
      {
        sets: [{ weight: 100, reps: 0 }],
        distance: 0,
      },
    ]);
  });

  it("should return an empty array when input is empty", () => {
    const result = convertExerciseToInt([]);
    expect(convertExerciseToInt(result)).toEqual([]);
  });

  it("should not modify the original array (immutability test)", () => {
    const input = [
      {
        sets: [{ weight: "45.6", reps: "12" }],
      },
    ];
    const copy = JSON.parse(JSON.stringify(input));
    convertExerciseToInt(input);
    expect(input).toEqual(copy);
  });
});
