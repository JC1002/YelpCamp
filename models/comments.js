var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    text:{ type: String },
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: {type: String}
    }
});

module.exports = mongoose.model("Comment", commentSchema);