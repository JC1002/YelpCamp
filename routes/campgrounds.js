const express= require('express');
const router = express.Router();
const Campground = require('../models/campgrounds');
const middleware = require('../middleware')


router.get('/',(req, res)=>{
    Campground.find(function(err, campgrounds){
      if(err){console.log(err)}
      else {
          res.render("campgrounds/campgrounds",{campgrounds:campgrounds});
      }
    });
});

 //CREATE - add new campground to DB
 router.post('/', middleware.isLoggedIn,(req, res)=>{
    var name = req.body.name;
    var image = req.body.image;
    var desc =  req.body.description;
    var price = req.body.price;
    var author = {
              id: req.user._id,
              username: req.user.username
    }
    var newCampground =  {name: name, image: image, description: desc, author, price}
    Campground.create(newCampground, (err,campground) => {
      if(err) throw err
      else {
        res.redirect('/campgrounds');}
     })
});

 //NEW - Show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
  res.render("campgrounds/new");
});

//SHOW - shows info about one campground
router.get("/:id", function(req, res){
    var id = req.params.id;
    //find the campground with provided ID
    Campground.findById(id)
      .populate("comments")
      .exec((err, foundCampground) => {
        if(err) throw err;
        else {
          //render show template with that campground
          res.render("campgrounds/show",{campground: foundCampground});
        }
      });
});

//EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id,(err, campground) => {
    if(err){
      res.redirect('/campgrounds');
    }
    else res.render('campgrounds/edit', { campground });
  });
});

router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, foundCampground) => {
    if(err){
      res.redirect('/campgrounds');
    } else {
      res.redirect('/campgrounds/'+ req.params.id);
    }  
  })
});

//Destroy or DELETE CAMPGROUND
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err) => {
    if(err){
        res.redirect('/campgrounds');
    } else {
        res.redirect('/campgrounds');
    }
  });
});



module.exports = router;