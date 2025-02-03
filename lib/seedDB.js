const faker = require("faker");
const mongoose = require("mongoose");
const connectDB = require("../config/database");
const Weight = require("../models/weight");
const Workout = require("../models/workout");

const SEED_ID = process.env.SEED_ID;

(async () => {
  const redisClient = require("./path-to-redis-client");
  await redisClient.set("testKey", "Hello, Redis!");
  const value = await redisClient.get("testKey");
  console.log(value); // Should print: Hello, Redis!
})();

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
  return faker.date.between(pastYear, currentDate);
}

async function generateWorkouts() {
  const workouts = [];
  for (let i = 0; i < num_workouts; i++) {
    const type = faker.random.arrayElement(types);
    workouts.push(
      new Workout({
        userId: [SEED_ID],
        unit: faker.random.arrayElement(units),
        date: getRandomDate(),
        length: faker.datatype.number({ min: 20, max: 120 }),
        exercises: [
          {
            type: type,
            name: faker.lorem.words({ min: 1, max: 5 }),
            sets:
              type === "strength"
                ? Array.from(
                    { length: faker.datatype.number({ min: 1, max: 5 }) },
                    () => ({
                      weight: faker.datatype.number({ min: 10, max: 200 }),
                      reps: faker.datatype.number({ min: 1, max: 15 }),
                    }),
                  )
                : null,
            distance:
              type === "cardio"
                ? faker.datatype.number({ min: 1, max: 10 })
                : null,
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
        unit: faker.random.arrayElement(units),
        weight: faker.datatype.number({ min: 10, max: 100 }),
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
    console.log(`Error seeding data: ${err.message}`);
  })
  .finally(async () => {
    mongoose.connection.close();
    process.exit();
  });
