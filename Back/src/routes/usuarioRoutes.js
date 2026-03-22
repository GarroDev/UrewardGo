import express from "express";
import { actualizausuario, crearUsuario, eliminarusuario, obtenerUsuarios, obtenerPorRol } from "../controllers/usuariocontroller.js";
import { authRequired } from "../middleware/auth.js";
import { requireRol } from "../middleware/rolmiddleware.js";

const router = express.Router();

router.post("/", authRequired, requireRol("Admin"), crearUsuario);
router.get("/", authRequired, obtenerUsuarios);
router.put("/:id", authRequired, requireRol("Admin"), actualizausuario);
router.delete("/:id", authRequired, requireRol("Admin"), eliminarusuario);
router.get("/rol/:rol", authRequired, requireRol("Admin"), obtenerPorRol);

export default router;
