import { Router } from 'express';
import v1Router from './v1/index';

const rootRouter = Router();

// Mount versioned routers
rootRouter.use('/v1', v1Router);

export default rootRouter;
