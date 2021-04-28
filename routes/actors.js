const express = require("express");

// Movie Controllers
const {
  getActors,
  getActor,
  addActor,
  updateActor,
  deleteActor,
  uploadActorPhoto,
} = require("../controllers/actors");

const Actor = require("../model/Actor");
const advancedResults = require("../middleware/advancedResults");

// get routes with merged params
// const router = express.Router({ mergeParams: true });

const router = express.Router();

router.route("/").get(advancedResults(Actor), getActors).post(addActor);
router.route("/:id").get(getActor).put(updateActor).delete(deleteActor);
// Route for uploading photo
router.route("/:id/photo").put(uploadActorPhoto);

module.exports = router;
