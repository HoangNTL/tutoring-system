import { Router } from "express";
import { testDb } from "../controllers/test.controller";

const router = Router();

router.get("/test-db", testDb);

export default router;