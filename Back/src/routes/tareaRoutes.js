import express from "express";
import {crearTarea,obtenerTareas,actualizarTarea,eliminarTarea,obtenerTareasUsuario} from "../controllers/tareaController.js";
import { upload } from "../middleware/upload.js"
import {submitTask,listSubmissionsForTask,mySubmissionForTask,decideSubmission} from "../controllers/submissionController.js";
import { authRequired } from "../middleware/auth.js";
import { requireRol } from "../middleware/rolmiddleware.js";
import { claimPoints } from "../controllers/submissionController.js";

const router = express.Router();

router.get("/user/list",authRequired,requireRol("Trabajador"),obtenerTareasUsuario)

router.get("/", authRequired,obtenerTareas);

router.post("/", authRequired, requireRol(["Admin", "Lider"]), crearTarea);

router.put("/:id", authRequired, requireRol(["Admin", "Lider"]), actualizarTarea);

router.delete("/:id", authRequired, requireRol(["Admin", "Lider"]), eliminarTarea);

router.post("/:id/submit", authRequired, requireRol("Trabajador"), upload.single("file"), submitTask)

router.get("/:id/submissions", authRequired, requireRol(["Admin", "Lider"]), listSubmissionsForTask)

router.get("/:id/submission", authRequired, requireRol("Trabajador"), mySubmissionForTask)

router.patch("/:taskId/submission/:subId/decision", authRequired, requireRol(["Admin", "Lider"]), decideSubmission)

router.post("/:taskId/claim", authRequired, requireRol("Trabajador"), claimPoints)

export default router;