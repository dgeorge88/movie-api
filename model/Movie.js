const mongoose = require("mongoose");
const slugify = require("slugify");

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a movie title"],
    unique: true,
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters."],
  },
  slug: String,
  release_date: {
    type: Date,
    required: [true, "Please add a release date"],
    min: "1888-10-14",
  },
  release_year: {
    type: Number,
    required: [true, "Please add a movie release year"],
    trim: true,
    maxlength: [4, "Year cannot be more than 4 characters."],
  },
  overview: {
    type: String,
    required: [true, "Please add a Movie description"],
    maxlength: [500, "Name cannot be more than 500 characters."],
  },
  poster_path: {
    type: String,
    default: "no-image.jpg",
  },
  director: {
    type: String,
    required: [true, "Please add movie Director"],
  },
  actors: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Actor",
    },
  ],
  finance: {
    budget: Number,
    box_office: Number,
  },
  rating: {
    type: Number,
    min: [1, "Rating must be at least 1."],
    max: [10, "Rating has a max of 10."],
  },
});

// slugifty
// @desc  Slug from title
MovieSchema.pre("save", function (next) {
  this.slug = slugify(this.title, {
    lower: true,
    replacement: " ",
    remove: undefined,
  });
  next();
});

module.exports = mongoose.model("Movie", MovieSchema);
