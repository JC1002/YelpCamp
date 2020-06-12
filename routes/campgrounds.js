const express = require("express");
const router = express.Router();
const Campground = require("../models/campgrounds");
const middleware = require("../middleware");
const NodeGeocoder = require("node-geocoder");
const multer = require("multer");
const cloudinary = require('cloudinary');

const options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

var storage = multer.diskStorage({
    filename: (req, file, callback) => {
      callback(null, Date.now() + file.originalname);
    }
});
var imageFilter =  (req, file, cb) => {
    //RegEx to accept images only
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({storage: storage, fileFilter: imageFilter});

//Cloudinary config
cloudinary.config({
  cloud_name: 'jn1002', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX - Show all campground
router.get("/", function (req, res) {
  Campground.find({}, function (err, allCampgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/campgrounds", {
        campgrounds: allCampgrounds,
        page: "campgrounds",
      });
    }
  });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req, res) {
  // get data from form and add to campgrounds array
  var name = req.body.campground.name;
  var desc = req.body.campground.description;
  var price = req.body.campground.price;
  
  geocoder.geocode(req.body.campground.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;

    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the campground object under image property
      var image = req.body.campground.image = result.secure_url;
      // add author to campground
      var author = req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      var newCampground = {
        name,
        image,
        description: desc,
        price,
        author,
        location,
        lat,
        lng
      };
      Campground.create(newCampground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
  });
});

//NEW - Show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("campgrounds/new");
});

//SHOW - shows info about one campground
router.get("/:id", function (req, res) {
  var id = req.params.id;
  //find the campground with provided ID
  Campground.findById(id)
    .populate("comments")
    .exec((err, foundCampground) => {
      if (err) throw err;
      else {
        //render show template with that campground
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      res.redirect("/campgrounds");
    } else res.render("campgrounds/edit", { campground });
  });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function (req, res) {
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err,campground) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Successfully Updated!");
        res.redirect("/campgrounds/" + campground._id);
      }
    });
  });
});

//Destroy or DELETE CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      req.flash("error", "Campground couldn't be removed");
      res.redirect("/campgrounds");
    } else {
      req.flash("success", "Campground Successfully removed");
      res.redirect("/campgrounds");
    }
  });
});

module.exports = router;
