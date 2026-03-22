import express from "express";
import {
  crearRecompensa,
  obtenerRecompensas,
  actualizarRecompensa,
  eliminarRecompensa,
  canjearRecompensa
} from "../controllers/recompensaController.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.post("/", crearRecompensa);
router.get("/", obtenerRecompensas);
router.put("/:id", actualizarRecompensa);
router.delete("/:id", eliminarRecompensa);
router.post("/:id/redeem", authRequired, canjearRecompensa);

export default router;