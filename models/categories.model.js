const { Schema, default: mongoose } = require("mongoose");

const categoriesSchema = new Schema(
    {
        name: String,
        description: String,
        icon: String,
        isMainCategory: Boolean,
        subCategories: [
            {
                type: Schema.Types.ObjectId,
                ref: "Categories",
            },
        ],
        committee: {
            type: Schema.Types.ObjectId,
            ref: "Committees",
        },
    },
    {
        timestamps: true,
    }
);


const Categories = mongoose.model("Categories", categoriesSchema);
module.exports = Categories;
