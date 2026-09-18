import { Router } from "express"; 
import { authRouters } from "../auth/auth.router";
const router=Router()
router.use('/auth',authRouters)
export const indexRoutes=router;