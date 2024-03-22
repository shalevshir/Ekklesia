import express, { Request, Response } from 'express';
import categoriesRepo from './category.repo';
import { handleError } from '../../utils/errors.utils';
import queryRepo from '../query/query.repo';
// Create a new router instance
const categoryRouter = express.Router();

categoryRouter.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await categoriesRepo.getAllCategories();
    res.send(categories);
  } catch (error) {
    handleError('error in get categories', error, res);
  }
});

categoryRouter.get('/subCategories/:categoryName', async (req: Request, res: Response) => {
  try {
    const subCategories = await categoriesRepo.getSubCategories(req.params.categoryName);
    res.send(subCategories);
  } catch (error) {
    handleError('error in get sub categories', error, res);
  }
});

categoryRouter.get('/query/:id', async (req: Request, res: Response) => {
  try {
    const queryId = req.params.id;
    const query = await queryRepo.findOne({ _id: queryId });
    if (!query || !query.queryLink) {
      throw new Error(`Query ${ queryId } not found`);
    }
    // const queryText = await getFileAsText(query.queryLink);

    // const categorization = await embeddingService.categorizeQuery(queryText);
    // res.json(categorization).send();
  } catch (error) {
    handleError('error in get categories tree', error, res);
  }
});

// Export the router
export default categoryRouter;
