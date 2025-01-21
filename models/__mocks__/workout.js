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

Workout.skip = jest.fn(() => ({
  limit: Workout.limit,
}));

Workout.sort = jest.fn(() => ({
  skip: Workout.skip,
}));

Workout.find = jest.fn(() => ({
  sort: Workout.sort,
}));

Workout.select = jest.fn(() => ({
  userId: "12345",
}));

Workout.findOne = jest.fn(() => ({
  select: Workout.select,
}));

module.exports = Workout;
