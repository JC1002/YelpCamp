var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");

var middlewareObj = {};

//Middleware to check for authentication in some routes
middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You must be logged in fist to do that");
  res.redirect("/login");
};

//Middleware to check for ownership of a campground
middlewareObj.checkCampgroundOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) {
        req.flash("error", "Campground not found");
        res.redirect("back");
      } else {
        //Check owner ID
        if (
          foundCampground.author.id.equals(req.user._id) || req.user.isAdmin
        ) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You must be logged in fist to do that");
    res.redirect("back");
  }
};

//Middleware to check for ownership of a particular Comment
middlewareObj.checkCommentOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        res.redirect("back");
      } else {
        //Check owner ID
        if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You must be logged in fist to do that");
    res.redirect("back");
  }
};

module.exports = middlewareObj;
