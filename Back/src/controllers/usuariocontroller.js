import Usuario from "../models/usuario.js";
import Trabajador from "../models/trabajador.js";
import Admin from "../models/admin.js";
import bcrypt from "bcrypt";

export const crearUsuario = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    let usuario;
    switch (req.body.rol) {
      case "Trabajador":
        usuario = new Trabajador(data);
        break;
      case "Admin":
        usuario = new Admin(data);
        break;
      default:
        usuario = new Usuario(data);
    }
    const usuarioGuardado = await usuario.save();
    res.status(201).json(usuarioGuardado);
  } catch (error) {
    res.status(500).json({ msg: "Error al crear usuario", error });
  }
};

// Obtener usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const filter = req.user && req.user.rol !== "Admin" ? { rol: { $ne: "Admin" } } : {};
    const usuarios = await Usuario.find(filter);
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener usuarios", error });
  }

};

export const actualizausuario = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const usuarios = await Usuario.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!usuarios) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(usuarios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const eliminarusuario = async (req, res) => {
  try {
    const usuarios = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuarios) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerPorRol = async (req, res) => {
  try {
    const { rol } = req.params;
    const usuarios = await Usuario.find({ rol });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener usuarios por rol", error });
  }
};