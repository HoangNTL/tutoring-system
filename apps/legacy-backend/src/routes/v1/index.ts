import { Router } from 'express';
import router from '../test.routes';
import studentRouter from './student.routes';
import lecturerRouter from './lecturer.routes';
import departmentRouter from './department.routes';

const v1Router = Router();

v1Router.use('/test-db', router);
v1Router.use('/students', studentRouter);
v1Router.use('/lecturers', lecturerRouter);
v1Router.use('/departments', departmentRouter);

export default v1Router;
