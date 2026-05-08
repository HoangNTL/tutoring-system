import { Router } from 'express';
import router from '../test.routes';

const v1Router = Router();

v1Router.use('/test-db', router);

export default v1Router;
