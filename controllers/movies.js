const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../middleware/utilities/errorReponse");
const path = require("path");
const Actor = require("../model/Actor");
const Movie = require("../model/Movie");

// @desc    GET ALL movies
// @route   GET /api/v1/movies
// @access  Public
exports.getMovies = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    GET ONE movie
// @route   GET /api/v1/movies/:id
// @access  Public
exports.getMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id).populate({
    path: "actors",
    select: "full_name",
  });

  if (!movie) {
    return next(
      new ErrorResponse(`Movie not found with id: ${req.params.id}.`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: movie,
  });
});

// @desc    POST NEW movie
// @route   POST /api/v1/movies/
// @access  Private
exports.createMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.create(req.body);

  res.status(201).json({
    success: true,
    data: movie,
  });
});

// @desc    UPDATE ONE movie
// @route   POST /api/v1/movies/:id
// @access  Private
exports.updateMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!movie) {
    return next(
      new ErrorResponse(`Movie not found with id: ${req.params.id}.`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: movie,
  });
});

// @desc    DELETE ONE movie
// @route   POST /api/v1/movies/:id
// @access  Private
exports.deleteMovie = asyncHandler(async (req, res, next) => {
  console.log("hello");
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    return next(
      new ErrorResponse(`Movie not found with id: ${req.params.id}.`, 404)
    );
  }

  await movie.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    GET ONE movie Actors
// @route   GET /api/v1/movies/:movieId/actors
// @access  Public
exports.getMovieActors = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.movieId).populate({
    path: "actors",
    select: "full_name",
  });

  if (!movie) {
    return next(
      new ErrorResponse(`Movie not found with id: ${req.params.movieId}.`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: movie.actors,
  });
});

// @desc    Upload Photo for Movie
// @route   POST /api/v1/movies/:id/photo
// @access  Private
exports.uploadMoviePhoto = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    return next(
      new ErrorResponse(`Movie not found with id: ${req.params.id}.`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a photo`, 400));
  }

  const file = req.files.file;

  // Test that file is photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload a image file`, 400));
  }

  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(
      new ErrorResponse(
        `Please upload a image file less than ${process.env.MAX_FILE_SIZE}`,
        400
      )
    );
  }

  // Create custom file tag
  file.name = `photo_${movie._id}${path.parse(file.name).ext}`;

  // Upload file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new ErrorResponse(`Cannot upload file`, 500));
    }

    await Movie.findByIdAndUpdate(req.params.id, {
      poster_path: file.name,
    });
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});

// @desc    Add OR Remove Movie Actors
// @route   Put /api/v1/movies/:movieId/actors/:actorId
// @access  Public
exports.addMovieActors = asyncHandler(async (req, res, next) => {
  // req.body.movies = req.params.movieId;

  // find movie by id
  let movie = await Movie.findById(req.params.movieId);

  // handle error if movie doesnt exist
  if (!movie) {
    return next(
      new ErrorResponse(`Movie not found with id: ${req.params.movieId}.`, 404)
    );
  }

  // find actor by Id
  const actor = await Actor.findById(req.params.actorId);

  // handle error if actor doesnt exist
  if (!actor) {
    return next(new ErrorResponse(`Actor not found`, 404));
  }

  // if actor id exists in movie throw error
  if (movie.actors.includes(req.params.actorId)) {
    // push new actor id to actors array
    await Movie.findByIdAndUpdate(
      req.params.movieId,
      { $pull: { actors: req.params.actorId } },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    // push new actor id to actors array
    await Movie.findByIdAndUpdate(
      req.params.movieId,
      { $push: { actors: actor } },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  res.status(200).json({
    success: true,
    data: movie,
  });
});
