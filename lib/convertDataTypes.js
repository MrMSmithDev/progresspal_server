function convertExerciseToInt(exerciseArr) {
  const arrCopy = JSON.parse(JSON.stringify(exerciseArr));

  arrCopy.forEach((exercise) => {
    if (exercise.sets && Array.isArray(exercise.sets))
      exercise.sets.forEach((set) => {
        if (set.weight !== undefined || set.reps !== undefined) {
          const weight = Number(set.weight);
          set.weight = isNaN(weight) ? 0 : Math.floor(weight);

          const reps = Number(set.reps);
          set.reps = isNaN(reps) ? 0 : Math.floor(reps);
        }
      });
    if (exercise.distance) {
      if (exercise.distance !== undefined) {
        const distance = Number(exercise.distance);
        exercise.distance = isNaN(distance) ? 0 : Math.floor(distance);
      }
    }
  });
  return arrCopy;
}

module.exports = { convertExerciseToInt };
