require("dotenv").config();

const faker = require("@faker-js/faker").faker;
const mongoose = require("mongoose");
const connectDB = require("../config/database");
const Weight = require("../models/weight");
const Workout = require("../models/workout");

const SEED_ID = process.env.SEED_ID;

if (!SEED_ID) {
  console.error("SEED_ID is not defined in env file. Exiting...");
  process.exit(1);
}

const num_workouts = 100;
const num_weights = 40;

const types = ["strength", "cardio"];
const units = ["met", "imp"];

function getRandomDate() {
  const currentDate = new Date();
  const pastYear = new Date().setFullYear(currentDate.getFullYear() - 1);
  return faker.date.between({ from: pastYear, to: currentDate });
}

async function generateWorkouts() {
  const workouts = [];
  for (let i = 0; i < num_workouts; i++) {
    const type = faker.helpers.arrayElement(types);
    workouts.push(
      new Workout({
        userId: SEED_ID,
        unit: faker.helpers.arrayElement(units),
        date: getRandomDate(),
        length: faker.number.int({ min: 20, max: 120 }),
        exercises: [
          {
            type: type,
            name: faker.lorem.words({ min: 1, max: 5 }),
            sets:
              type === "strength"
                ? Array.from(
                    { length: faker.number.int({ min: 1, max: 5 }) },
                    () => ({
                      weight: faker.number.int({ min: 10, max: 200 }),
                      reps: faker.number.int({ min: 1, max: 15 }),
                    }),
                  )
                : null,
            distance:
              type === "cardio" ? faker.number.int({ min: 1, max: 10 }) : null,
          },
        ],
      }),
    );
  }
  await Workout.insertMany(workouts);
  console.log("Workouts seeded");
}

async function generateWeights() {
  const weights = [];
  for (let i = 0; i < num_weights; i++) {
    weights.push(
      new Weight({
        userId: SEED_ID,
        date: getRandomDate(),
        unit: faker.helpers.arrayElement(units),
        weight: faker.number.int({ min: 10, max: 100 }),
      }),
    );
  }
  await Weight.insertMany(weights);
  console.log("Weights seeded");
}

connectDB()
  .then(async () => {
    await generateWorkouts();
    await generateWeights();
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(async () => {
    mongoose.connection.close();
    process.exit();
  });
