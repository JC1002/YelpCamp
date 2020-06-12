var mongoose = require('mongoose');
var Comment = require('./comments');

var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: {type: Date, default: Date.now},
    price : { type: Number, set: setPrice},
    author: {
             id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
             username: String
            },
    comments: [
            {type: mongoose.Schema.Types.ObjectId, ref: "Comment"}
    ]
});

function setPrice(num) {
    let decimal = parseFloat(num);
    return decimal.toFixed(2);
}

module.exports = mongoose.model("Campground", campgroundSchema);