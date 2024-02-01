const mongoose = require("mongoose");
const { rolesEnum } = require("../types/roles.enum");
const { Schema } = mongoose;

const personSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    firstNameHeb: String,
    lastNameHeb: String,
    age: Number,
    gender: {
      type: String,
      enum:[ "male","female" ]
    },
    roles: [
      {
        title: {
          type: String,
          enum: rolesEnum,
        },

        startDate: Date,
        endDate: Date,
        isCurrent: Boolean,
      },
    ],
    dateOfBirth: Date,
    residence: String,
    faction: {
      originId: String,
      name: String,
      displayName: String,
      block: {
        name: {
          type: String,
          enum: ["coalition", "opposition"],
        },
      },
    },
    committees: [
      {
        name: String,
        committeeId: { type: Schema.Types.ObjectId, ref: "Committee" },
        isChairman: Boolean,
      },
    ],
    minister: [{
      type: Schema.Types.ObjectId,
      ref: "Ministry",
    }],
    email: String,
    originId: String,
  },
  {
    timestamps: true,
  }
);
const Person = mongoose.model("Person", personSchema);

module.exports = Person;
