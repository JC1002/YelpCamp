require('dotenv').config();
var express         = require('express'),
    bodyParser      = require('body-parser'),
    port            = process.env.PORT || 4000,
    mongoose        = require('mongoose'),
    flash           = require('connect-flash'),
    passport        = require('passport'),
    LocalStrategy   = require('passport-local'),
    methodOverride  = require('method-override'),
    User            = require('./models/user'),
    seedDB          = require('./seeds');
    
const databaseConnection = require('./database_connection/database')();

var commentRoutes = require('./routes/comments'),
    campgroundsRoutes = require('./routes/campgrounds'),
    indexRoutes = require('./routes/index');

//Database connection   
/* const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
};

const url = process.env.DATABASE_URL;

mongoose.connect(url, options)
    .then(()=>{
        console.log(`Connected to the DB:  ${process.env.DB_NAME}`);
    })
    .catch((err)=>{
        console.log(`Error: </br> ${err.message}`);
        process.exit(1);
}); */


//Database connection  

//seedDB();
var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+ '/public'));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');

//Requirement Express session
app.use(require('express-session')({
    secret:"Once you go black, you never go back",
    resave: false,
    saveUninitialized: false     
}));

//PASSPORT CONFIGURATION
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //Give the local strategy that was required
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//This shows the current use logged in
//I used this to show the log out only if logged in or in the contrary
app.use(function(req, res, next) {
  if(res.locals.currentUser === "") {
     res.locals.currentUser = "Guest";
  } else{
      res.locals.currentUser = req.user;
    } 
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use('/', indexRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

app.listen(port, process.env.OPENSHIFT_NODEJS_PORT, () => {
    console.log("YelpCamp V11 has started! on port: " + port);
});