import BaseRepo from '../../abstracts/repo.abstract';
import MainCategoryModel, { MainCategory } from './mainCategory.model';

class CategoryRepo extends BaseRepo<MainCategory> {
  constructor() {
    super(MainCategoryModel);
  }

  async getAllCategories() {
    return await this.find({ isMainCategory: true }, { populate: 'subCategories' });
  }

  async getSubCategories(categoryName: string) {
    const mainCategory = await this.findOne({ name: categoryName }, { populate: 'subCategories' });
    if (!mainCategory) {
      throw new Error('Category not found');
    }
    return mainCategory.subCategories;
  }

  async getCategoriesTree() {
    try {
      const categories = await this.model.aggregate([
        {
          $match:
                 {
                   isMainCategory: true
                 }
        },
        {
          $lookup:
                 {
                   from: 'categories',
                   localField: 'subCategories',
                   foreignField: '_id',
                   as: 'subCategories'
                 }
        },
        {
          $project:
                 {
                   mainCategory: '$name',
                   subCategories: '$subCategories.name'
                 }
        }
      ]);
      let taxonomy = '';
      for (const category of categories) {
        const mainCategory = category.mainCategory;
        const subCategories = category.subCategories.join(', ');
        taxonomy += `Main Category: ${ mainCategory }:\n SubCategories: ${ subCategories }\n\n`;
      }
      return taxonomy;
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }

  async getMainCategories() {
    return await this.find({ isMainCategory: true });
  }
}

const categoryRepo = new CategoryRepo();
export default categoryRepo;
