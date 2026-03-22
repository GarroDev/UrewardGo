import Recompensa from "../models/recompensa.js";
import Usuario from "../models/usuario.js";
import HistorialCanje from "../models/historialCanje.js";

export const crearRecompensa = async (req, res) => {
  try {
    const recompensa = new Recompensa(req.body);
    const recompensaGuardada = await recompensa.save();
    res.status(201).json(recompensaGuardada);
  } catch (error) {
    res.status(500).json({ msg: "Error al crear recompensa", error });
  }
};


export const obtenerRecompensas = async (req, res) => {
  try {
    const recompensas = await Recompensa.find();
    res.json(recompensas);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener recompensas", error });
  }
};


export const actualizarRecompensa = async (req, res) => {
  try {
    const { id } = req.params;
    const recompensa = await Recompensa.findByIdAndUpdate(id, req.body, { new: true, runValidators: true, });
    if (!recompensa) {
      return res.status(404).json({ msg: "Recompensa no encontrada" });
    }

    res.json(recompensa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const eliminarRecompensa = async (req, res) => {
  try {

    const { id } = req.params;

    const recompensa = await Recompensa.findByIdAndDelete(id);

    if (!recompensa) {
      return res.status(404).json({ msg: "Recompensa no encontrada" });
    }

    res.json({ message: "Recompensa eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const canjearRecompensa = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recompensa = await Recompensa.findById(id);
    if (!recompensa) return res.status(404).json({ msg: "Recompensa no encontrada" });

    const usuario = await Usuario.findById(userId);
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

    if (usuario.points < recompensa.puntosRequeridos) {
      return res.status(400).json({ msg: "Puntos insuficientes para canjear esta recompensa" });
    }

    usuario.points -= recompensa.puntosRequeridos;
    await usuario.save();

    recompensa.cantidadCanjes += 1;
    await recompensa.save();

    const historial = new HistorialCanje({
      historialId: Date.now(),
      usuario: userId,
      recompensa: id
    });
    await historial.save();

    res.json({ msg: "Recompensa canjeada exitosamente", points: usuario.points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};