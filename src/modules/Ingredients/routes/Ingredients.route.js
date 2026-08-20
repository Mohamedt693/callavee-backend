import express from "express";

import {
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../controllers/Ingredient.controller.js";

import {
  getAllIngredients,
  getIngredientBySlug,
  getIngredientById,
} from "../controllers/ingredient.query.controller.js";

import {
  getIngredientFilters,
  getFeaturedIngredients,
} from "../controllers/ingredient.filter.controller.js";

import { protectAdmin } from "../../../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/filters", getIngredientFilters);
router.get("/featured", getFeaturedIngredients);


router.get("/", getAllIngredients);
router.get("/slug/:slug", getIngredientBySlug);
router.get("/:id", getIngredientById);


router.post("/", protectAdmin, createIngredient);
router.put("/:id", protectAdmin, updateIngredient);
router.delete("/:id", protectAdmin, deleteIngredient);

export default router;