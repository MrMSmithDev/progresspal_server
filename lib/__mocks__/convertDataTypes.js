/* eslint-disable no-undef */
module.exports = {
  convertExerciseToInt: jest.fn(() => [
    {
      type: "cardio",
      name: "test_cardio",
      distance: 100,
    },
    {
      type: "strength",
      name: "test_strength",
      sets: [
        {
          weight: 10,
          reps: 12,
        },
      ],
    },
  ]),
};
