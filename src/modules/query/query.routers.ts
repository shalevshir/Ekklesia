import express, { Request, Response, Router } from 'express';
import queryRepo from './query.repo';
import { handleError } from '../../utils/errors.utils';

const queryRouter: Router = express.Router();

queryRouter.get('/nextQuery', async (req: Request, res: Response) => {
    try {
        const query = await queryRepo.getNextQuery();
        res.send(query);
    } catch (error) {
        handleError("error in get next query", error, res);
    }
});

queryRouter.patch('/categoryToQuery', async (req: Request, res: Response) => {
    try {
        const query = await queryRepo.addCategoryToQuery(req.body.documentId, req.body.categories);
        res.send(query);
    } catch (error) {
        handleError("error in add category to query", error, res);
    }
});

export default queryRouter;
