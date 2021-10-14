var express= require('express');
var router = express.Router();

var passport =  require('passport');
var User =  require('../models/user')

//INDEX - Display...
router.get('/',(req, res)=>{
    res.render("landing");
  });

//Render signing up form
router.get('/register', (req, res) => {
    res.render('register', {page: 'register'});
});
  
//Sign up users
router.post('/register', (req, res) => {
    let newUser = new User({username: req.body.username});
    if(req.body.adminCode === 'secretcode') {
      newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
      if(err) { 
        console.log(`Error ${err}`)
          req.flash('error', err.message);
          return res.redirect('/register');
      }
        passport.authenticate('local')(req, res, () => {
          req.flash('success', "Sucessfully signed up! Welcome to the YelpCamp ");
          res.redirect('/campgrounds');
      });
    });
});
  
//Render Login page
router.get('/login', (req, res) => {
    res.render('login', {page: 'login'});
});

//handling Login logic
router.post('/login', passport.authenticate('local',  {
    failureFlash: 'Invalid username or password.',
    failureRedirect: '/login'
  }
), (req, res) => {
    req.flash('success', 'Welcome back ' + req.user.username + '!');
    res.redirect('/campgrounds');
});
  
//Logout logic
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You logged you out');
    res.redirect('/campgrounds');
});

module.exports = router;