import express from "express";

import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import { getCategories } from "../controllers/category.query.controller.js";
import { protectAdmin } from "../../../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/")
  .get(getCategories)
  .post(protectAdmin, createCategory); 

router
  .route("/:id")
  .put(protectAdmin, updateCategory) 
  .delete(protectAdmin, deleteCategory); 

export default router;