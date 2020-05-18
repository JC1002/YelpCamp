const express= require('express');
const router = express.Router({mergeParams:true});
const middleware = require('../middleware')

const Campground = require('../models/campgrounds');
const Comment =  require('../models/comments');

//RENDER THE FORM TO CREATE A NEW COMMENT
router.get('/new', middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
      if(err) throw err;
      else {
        res.render('comments/new', { campground });
      }
    });
});

//CREATE THE NEW COMMENT
router.post('/', middleware.isLoggedIn, (req, res) => {
  //find the campgroundID
  Campground.findById(req.params.id,(err, campgroundFound) => {
    if(err) {
      console.log(err)
    //Create a new comment and push into the array of comment in the background collection
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if(err) {
          console.log(err);
        } else {
            //add username and id to comment
            comment.author.id =  req.user._id;
            comment.author.username = req.user.username;
            //save comment
            comment.save();
            console.log(`This is the comment: </br>${comment}`);
            campgroundFound.comments.push(comment);
            //Save this comment, then redirect
            campgroundFound.save();
            req.flash('success','The comment has been added');
            res.redirect('/campgrounds/' + campgroundFound._id);
        }
      });
    }
  });
});

//RENDER THE FORM TO UPDATE A COMMENT
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
  let campground_id = req.params.id; //This id is coming from the route, which is set up as campground/:id/comments
  Comment.findById(req.params.comment_id, (err, comment) => {
    if(err) {
        res.redirect('back');
    } else {
        res.render('comments/edit',{campground_id, comment});
    }
  });
});

//UPDATE THE COMMENT 
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
    if(err) { res.redirect('back') }
    else { res.redirect('/campgrounds/' + req.params.id) };
  });
});

//DELETE A COMMENT
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if(err) {
        res.redirect('back');
    } else {
      req.flash('success','The comment has been successfully deleted');
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});


module.exports = router;