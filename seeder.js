const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// DOTENV Variables
dotenv.config({ path: "./config/config.env" });

// Models
const Movie = require("./model/Movie");
const Actor = require("./model/Actor");

// Connect to Database
mongoose.connect(process.env.MONGO_DB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Read JSON
const movies = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/movies.json`, "utf-8")
);
const actors = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/actors.json`, "utf-8")
);

// Import JSON into DB
const importData = async () => {
  try {
    await Movie.create(movies);
    await Actor.create(actors);
    console.log("Imported Data");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// DELETE Data from DB
const deleteData = async () => {
  try {
    await Movie.deleteMany();
    await Actor.deleteMany();
    console.log("Deleted Data");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
