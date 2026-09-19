import { Router } from "express";
import { searchController } from "./search.controller";

const router = Router();

// Search published articles
router.get("/", searchController.searchArticles);

// Search suggestions
router.get("/suggestions", searchController.getSearchSuggestions);

export const searchRoutes = router;