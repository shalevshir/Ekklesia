import BaseRepo from '../../abstracts/repo.abstract';
import SubCategoryModel, { SubCategory } from './subCategory.model';

class SubCategoryRepo extends BaseRepo<SubCategory> {
  constructor() {
    super(SubCategoryModel);
  }
}

const subCategoryRepo = new SubCategoryRepo();
export default subCategoryRepo;
