/* eslint-disable no-undef */
const Workout = jest.fn((workoutData) => ({
  ...workoutData,
  save: jest.fn(() => ({
    _id: "test_id",
    length: workoutData.length,
    date: workoutData.date,
    exercises: workoutData.exercises,
  })),
}));

Workout.deleteOne = jest.fn(() => ({ deletedCount: 1 }));

Workout.findById = jest.fn(() => ({
  _id: "test_id",
  length: "15",
  date: "test_date",
  exercise: [],
  toObject: jest.fn().mockReturnValue({
    _id: "test_id",
    length: "15",
    date: "test_date",
    exercise: [],
  }),
}));

Workout.limit = jest.fn(() => [
  {
    _id: "test_id_1",
    length: "15",
    date: "test_date",
    exercise: [],
  },
  {
    _id: "test_id_2",
    length: "15",
    date: "test_date",
    exercise: [],
  },
]);

Workout.sort = jest.fn(() => ({
  limit: Workout.limit,
}));

Workout.find = jest.fn(() => ({
  sort: Workout.sort,
}));

module.exports = Workout;
