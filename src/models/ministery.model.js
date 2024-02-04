const { Schema, default: mongoose } = require("mongoose");

const MinistrySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    originId: {
        type: String,
        required: true
    }
});

const MinistryModel = mongoose.model("Ministry", MinistrySchema);

module.exports = MinistryModel;