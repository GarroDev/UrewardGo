import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "../models/usuario.js";

function sign(u) {
  return jwt.sign({ id: u._id, email: u.email, rol: u.rol }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req, res) {
  try {
    const { name = "", email, password } = req.body;
    const rol = "Trabajador"; // Forzar rol desde registro público

    if (!email || !password) return res.status(400).json({ message: "Email y password son requeridos" });

    const exists = await Usuario.findOne({ email });
    if (exists) return res.status(409).json({ message: "El email ya está registrado" });

    const hash = await bcrypt.hash(password, 10);
    const user = await Usuario.create({ name, email, password: hash, rol, points: 0 });

    const token = sign(user);


    const safe = { id: user._id, name: user.name, email: user.email, rol: user.rol, points: user.points };
    res.status(201).json({ token, user: safe });
  } catch (e) {
    console.error("Error en register:", e);
    res.status(500).json({ message: "Error registrando usuario" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await Usuario.findOne({ email });
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = sign(user);
    const safe = { id: user._id, name: user.name, email: user.email, rol: user.rol, points: user.points };
    res.json({ token, user: safe });
  } catch {
    res.status(500).json({ message: "Error iniciando sesión" });
  }
}

export async function me(req, res) {
  try {
    const user = await Usuario.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Error obteniendo perfil" });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: "Email y nueva contraseña son requeridos" });

    const user = await Usuario.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch {
    res.status(500).json({ message: "Error al cambiar contraseña" });
  }
}
