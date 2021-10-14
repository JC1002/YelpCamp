var mongoose = require('mongoose');
var passportLocalMongoose =  require('passport-local-mongoose');

var UserSchema =  new mongoose.Schema(
    {
        user: {
            type: String,
            unique:true,
            set:setUser,
            },
        password: { type: String },
        isAdmin: { type:Boolean, default: false }
});

function setUser(user) {
    return user[0].toUppercase;
}


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);