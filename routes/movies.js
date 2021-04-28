const express = require("express");

// Movie Controllers
const {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieActors,
  addMovieActors,
  uploadMoviePhoto,
  removeMovieActors,
} = require("../controllers/movies");

const Movie = require("../model/Movie");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

// blind routes
router
  .route("/")
  .get(
    advancedResults(Movie, {
      path: "actors",
      select: "full_name",
    }),
    getMovies
  )
  .post(createMovie);

// param routes
router.route("/:id").get(getMovie).put(updateMovie).delete(deleteMovie);

// Reroute (mount) into other resource router
router.route("/:movieId/actors").get(getMovieActors);

// Route for adding actors to movie
router.route("/:movieId/actors/:actorId").put(addMovieActors);

// Route for uploading photo
router.route("/:id/photo").put(uploadMoviePhoto);

module.exports = router;
