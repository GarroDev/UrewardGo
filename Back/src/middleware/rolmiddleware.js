export function requireRol(rol) {
  const roles = Array.isArray(rol) ? rol : [rol];
  return (req, res, next) => {
    if (roles.includes(req.user.rol)) {
      return next();
    }
    return res.status(403).json({ message: "Acceso denegado: rol insuficiente" });
  };
}
