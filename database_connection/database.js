var mongoose = require('mongoose');

//Database connection
function databaseConnection() {
    const options = {
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
    });

}

module.exports = databaseConnection;