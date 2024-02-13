import express, { Request, Response, Router } from 'express';
import queryRepo from './query.repo';

const queryRouter: Router = express.Router();

queryRouter.get('/getNextQuery', async (req: Request, res: Response) => {
    const query = await queryRepo.getNextQuery();
    res.send(query);
});

queryRouter.post('/addCategoryToQuery', async (req: Request, res: Response) => {
  const query = await queryRepo.addCategoryToQuery(req.body.documentId, req.body.categories);
  res.send(query);
});

// Export the router
export default queryRouter;
