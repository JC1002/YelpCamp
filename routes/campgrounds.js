const express = require("express");
const router = express.Router();
const Campground = require("../models/campgrounds");
const middleware = require("../middleware");
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const geocoder = NodeGeocoder(options);
let page = "campgrounds";
//INDEX - Show all campground
router.get("/", function (req, res) {
  if(req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Campground.find({name: regex}, function (err, allCampgrounds) {
      if (err) {
        console.log(err);
      } else {
        if(allCampgrounds.length < 1 ) {
          req.flash('error', 'No campground match that query, please try again');
          return res.redirect('back');
        }
        res.render("campgrounds/campgrounds",{ campgrounds: allCampgrounds, page});
      }
    });
  } else {
      Campground.find({}, function (err, allCampgrounds) {
        if (err) {
          console.log(err);
        } else {
          res.render("campgrounds/campgrounds", { campgrounds: allCampgrounds, page});
        }
      });
    }
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function (req, res) {
  // get data from form and add to campgrounds array
  var name = req.body.campground.name;
  var desc = req.body.campground.description;
  var price = req.body.campground.price;
  var image = req.body.campground.image;
  // add author to campground
  var author = req.body.campground.author = {
    id: req.user._id,
    username: req.user.username
  }
  
  geocoder.geocode(req.body.campground.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
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
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
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
        req.flash("success", "Successfully Updated");
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
