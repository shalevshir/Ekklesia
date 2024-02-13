import BaseRepo from '../../abstracts/repo.abstract';
import CategoryModel, { Category } from './category.model';

class CategoryRepo extends BaseRepo<Category> {
    constructor() {
        super(CategoryModel);
    }

    async getAllCategories() {
        return await this.find({ isMainCategory:true },{populate: 'subCategories'});
    }

    async getSubCategories(categoryName: string){
        const mainCategory = await this.findOne({name: categoryName},{populate: 'subCategories'});
        if(!mainCategory){
            throw new Error('Category not found');
        }
        return mainCategory.subCategories;
    }
}

export default new CategoryRepo();