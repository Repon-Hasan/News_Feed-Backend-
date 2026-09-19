import { Router } from "express";

import { categoryController } from "./categories.controller";
import { checkAuth } from "../../middleware/checkAuth";


const router = Router();

// Public
router.get("/", categoryController.getAllCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

// Admin only
router.post(
  "/",
 checkAuth("ADMIN"),
  categoryController.createCategory
);

router.patch(
  "/:id",
 checkAuth("ADMIN"),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  checkAuth("ADMIN"),
  categoryController.deleteCategory
);

// Subcategory - Admin only
router.post(
  "/subcategories",
 checkAuth("ADMIN"),
  categoryController.createSubcategory
);

router.patch(
  "/subcategories/:id",
 checkAuth("ADMIN"),
  categoryController.updateSubcategory
);

router.delete(
  "/subcategories/:id",
 checkAuth("ADMIN"),
  categoryController.deleteSubcategory
);

export const categoryRouter = router;