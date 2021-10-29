const express = require('express');
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const {promisify} = require("util");
const pipeline = promisify(require("stream").pipeline);

async function main() {
  await mongoose.connect('mongodb://localhost:27017/curdReviews');
}

const reviewSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    fileName: String
  },
  {timestamps: true}
)

const Review = mongoose.model("Review", reviewSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const upload = multer();

main().catch(err => console.log(err));

router.post("/upload", upload.single("file"), async function(req, res, next) {
  const file = req.file;
  const body = req.body;

  const reviewTitle = body.newReviewTitle;
  const reviewText = body.newReviewText;
  const fileName = String(Math.random()) + file.originalName;

  await pipeline(file.stream, fs.createWriteStream(`${__dirname}/../public/images/${fileName}`))
  
  const review = new Review({title:reviewTitle, content:reviewText, fileName:fileName});
  await review.save();

  res.send("File uploaded as " + fileName);
});

router.get("/reviews/one", async function(req, res) {
  const recentReview = await Review.find().sort({"createdAt":-1}).limit(1)
  res.send(recentReview[0]);
});

router.get("/reviews/all", async function(req, res) {
  const allReviews = await Review.find({}).sort({"createdAt":-1})
  res.send(allReviews);
})
module.exports = router;


