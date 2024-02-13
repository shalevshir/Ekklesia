import express, { Request, Response } from 'express';
import categoriesRepo from './category.repo';
import { handleError } from '../../utils/errors.utils';
// Create a new router instance
const categoryRouter = express.Router();

categoryRouter.get('/', async (req: Request, res: Response) => {
    try {
        const categories = await categoriesRepo.getAllCategories();
        res.send(categories);
    } catch (error) {
        handleError("error in get categories", error, res);
    }
});

categoryRouter.get('/subCategories/:categoryName', async (req: Request, res: Response) => {
    try {
        const subCategories = await categoriesRepo.getSubCategories(req.params.categoryName);
        res.send(subCategories);
    }
    catch (error) {
        handleError("error in get sub categories", error, res);
    }
});


// Export the router
export default categoryRouter;
