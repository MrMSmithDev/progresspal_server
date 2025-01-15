function convertExerciseToInt(exerciseArr) {
  exerciseArr.forEach((exercise) => {
    if (exercise.sets && Array.isArray(exercise.sets))
      exercise.sets.forEach((set) => {
        if (set.weight !== undefined) {
          const weight = Number(set.weight);
          set.weight = isNaN(weight) ? null : Math.floor(weight);
        }
        if (set.reps !== undefined) {
          const reps = Number(set.reps);
          set.reps = isNaN(reps) ? null : Math.floor(reps);
        }
      });
    if (exercise.distance) {
      if (exercise.distance !== undefined) {
        const distance = Number(exercise.distance);
        exercise.distance = isNaN(distance) ? null : Math.floor(distance);
      }
    }
  });
  return exerciseArr;
}

module.exports = { convertExerciseToInt };
