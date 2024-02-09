import BaseRepo from '../abstracts/repo.abstract';
import CategoryModel, { Category } from '../models/category.model';

class CategoryRepo extends BaseRepo<Category> {
    constructor() {
        super(CategoryModel);
    }

    async getAllCategories() {
        return await this.find({ isMainCategory:true },{populate: 'subCategories'});
    }

    async getSubCategories(categoryName: string){
        const mainCategory = await this.find({name: categoryName},{populate: 'subCategories'});
        if(!mainCategory || !mainCategory[0]){
            throw new Error('Category not found');
        }
        return mainCategory[0].subCategories;
    }
}

export default new CategoryRepo();