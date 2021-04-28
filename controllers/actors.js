const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../middleware/utilities/errorReponse");
const path = require("path");
const Actor = require("../model/Actor");

// @desc    GET ALL actors
// @route   GET /api/v1/actors
// @access  Public
exports.getActors = asyncHandler(async (req, res, next) => {
  // const actors = await Actor.find();

  res.status(200).json(res.advancedResults);
});

// @desc    GET ONE actors
// @route   GET /api/v1/actors/:id
// @access  Public
exports.getActor = asyncHandler(async (req, res, next) => {
  const actor = await Actor.findById(req.params.id).populate({
    path: "movies",
    select: "title overview release_year poster_path -actors",
  });

  if (!actor) {
    return next(
      new ErrorResponse(`No actor with the id: ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: actor,
  });
});

// @desc    ADD ONE actor
// @route   POST /api/v1/actors/
// @access  Public
exports.addActor = asyncHandler(async (req, res, next) => {
  const actor = await Actor.create(req.body);

  res.status(201).json({
    success: true,
    data: actor,
  });
});

// @desc    UPDATE ONE ACTOR
// @route   PUT /api/v1/actors/:id
// @access  Private
exports.updateActor = asyncHandler(async (request, response, next) => {
  let actor = await Actor.findById(request.params.id);

  if (!actor) {
    return next(
      new ErrorResponse(`Actor not found with id: ${request.params.id}.`, 404)
    );
  }

  actor = await Actor.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });

  response.status(200).json({
    success: true,
    data: actor,
  });
});

// @desc    DELETE ONE ACTOR
// @route   DELETE /api/v1/actors/:id
// @access  Private
exports.deleteActor = asyncHandler(async (request, response, next) => {
  const actor = await Actor.findById(request.params.id);

  if (!actor) {
    return next(
      new ErrorResponse(`Actor not found with id: ${request.params.id}.`, 404)
    );
  }

  await actor.remove();

  response.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Upload Photo for Actor
// @route   POST /api/v1/actor/:id/photo
// @access  Private
exports.uploadActorPhoto = asyncHandler(async (request, response, next) => {
  const actor = await Actor.findById(request.params.id);

  if (!actor) {
    return next(
      new ErrorResponse(`Actor not found with id: ${request.params.id}.`, 404)
    );
  }

  if (!request.files) {
    return next(new ErrorResponse(`Please upload a photo`, 400));
  }

  const file = request.files.file;

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
  file.name = `photo_${actor._id}${path.parse(file.name).ext}`;

  // Upload file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new ErrorResponse(`Cannot upload file`, 500));
    }

    await Actor.findByIdAndUpdate(request.params.id, {
      picture_path: file.name,
    });
    response.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
