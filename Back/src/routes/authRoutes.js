import { Router } from "express";
import { login, register, me, resetPassword } from "../controllers/authController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.get("/me", authRequired, me);

export default router;
