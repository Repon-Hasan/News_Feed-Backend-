import { Router } from "express"; 
import { authRouters } from "../auth/auth.router";
import { reporterProfileRoutes } from "../reporter/profile/reporterProfile.routes";
import { reporterRoutes } from "../reporter/news/reporter.routes";

import { adminRoutes } from "../admin/dashboard/admin.router";
import { userRoutes } from "../user/user.routes";
import { categoryRouter } from "../admin/categories/category.router";

const router=Router()
router.use('/auth',authRouters)
router.use('/reporterProfile',reporterProfileRoutes)
router.use("/reporter", reporterRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/categories",categoryRouter)
router.use("/user", userRoutes);
export const indexRoutes=router;