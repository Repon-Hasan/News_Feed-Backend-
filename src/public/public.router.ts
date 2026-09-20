import { Router } from "express";
import { publicControllers } from "./public.controller";


const router=Router()
router.get(
  "/allArticles",
  publicControllers.getAllArticles
);

export const publicRouter=router;