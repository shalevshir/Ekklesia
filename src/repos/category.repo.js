const BaseRepo = require('../abstracts/repo.abstract');
const Category = require('../models/categories.model');

class CategoryRepo extends BaseRepo {
    constructor() {
        super(Category);
    }

    async getAllCategories() {
        return await this.find({ isMainCategory:true },{populate: 'subCategories'});
    }

    async getSubCategories(categoryName){
        const mainCategory = await this.find({name: categoryName},{populate: 'subCategories'});
        if(!mainCategory || !mainCategory[0]){
            throw new Error('Category not found');
        }
        return mainCategory[0].subCategories;
    }
}

module.exports = new CategoryRepo();