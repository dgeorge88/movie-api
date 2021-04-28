const mongoose = require("mongoose");

const ActorSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      trim: true,
      required: [true, "Please enter actors full name"],
    },
    biography: {
      type: String,
      required: [true, "Please enter actors biography information"],
    },
    date_of_birth: {
      type: Date,
      required: [true, "Please add actors date of birth"],
    },
    picture_path: {
      type: String,
      default: "no-image.jpg",
    },
    website: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cascade Delete instances of Actors in Movies
ActorSchema.pre("remove", async function (next) {
  const actor = await this.model("Movie").updateMany({
    $pull: { actors: this._id },
  });
  next();
});

// Virtual populate of Movies in Actor Profiles
ActorSchema.virtual("movies", {
  ref: "Movie",
  localField: "_id",
  foreignField: "actors",
  justOne: false,
});

module.exports = mongoose.model("Actor", ActorSchema);
