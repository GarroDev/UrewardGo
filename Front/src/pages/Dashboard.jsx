import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { listTasks, listUserTasks, listCanjes, listRewards } from '../services/api.js'

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    tareasEnProgreso: 0,
    tareasCompletadas: 0,
    tareasPendientes: 0,
    canjesTotales: 0,
    puntosGastados: 0
  });

  const [recientes, setRecientes] = useState([]);
  const [canjesRecientes, setCanjesRecientes] = useState([]);
  const [recompensasDisp, setRecompensasDisp] = useState([]);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        // Cargar tareas según rol
        let allTasks = [];
        if (user?.rol === "Admin") {
          allTasks = await listTasks();
        } else {
          allTasks = await listUserTasks();
          // Solo Trabajador cuenta con mySubmission si lo buscamos, o nos basamos en el status general.
          // Para no hacer 50 peticiones de mySubmission, estimaremos en base a listUserTasks general o si el endpoint las incluye.
        }

        // Tareas Recientes
        setRecientes(allTasks.slice(0, 5));

        // Estadísticas de tareas
        let completadas = 0;
        let pendientes = 0;
        allTasks.forEach(t => {
          // Asumimos t.status general para Admin o tareas globales
          if (t.status === "Completada" || t.status === "Aprobada") completadas++;
          else pendientes++;
        });

        // Cargar Canjes
        let allCanjes = await listCanjes().catch(() => []);
        if (user?.rol !== "Admin") {
          allCanjes = allCanjes.filter(c => c.usuario && c.usuario._id === user.id);
        }

        // Calcular Puntos Gastados o canjes
        let puntosGastados = 0;
        allCanjes.forEach(c => {
          if (c.puntosGastados) puntosGastados += c.puntosGastados;
          else if (c.recompensa?.puntosRequeridos) puntosGastados += c.recompensa.puntosRequeridos;
        });

        setCanjesRecientes(allCanjes.slice(0, 5));

        // Cargar Recompensas Disponibles
        const allRewards = await listRewards().catch(() => []);
        setRecompensasDisp(allRewards.slice(0, 4));

        // Porcentaje progreso (evitar división por 0)
        let percent = 0;
        const totalT = completadas + pendientes;
        if (totalT > 0) percent = Math.round((completadas / totalT) * 100);

        setProgreso(percent);
        setStats({
          tareasEnProgreso: 0,
          tareasCompletadas: completadas,
          tareasPendientes: pendientes,
          canjesTotales: allCanjes.length,
          puntosGastados
        });

      } catch (err) {
        console.error("Error al cargar dashboard", err);
      }
    }
    if (user) loadData();
  }, [user]);

  return (
    <div>
      <div className="banner">
        <div>
          <div style={{ opacity: .9, fontWeight: 700, fontSize: 18 }}>¡Bienvenido, {user?.name || "Usuario"}!</div>
          <div style={{ opacity: .85 }}>Tienes {stats.tareasPendientes} tareas pendientes o globales por realizar.</div>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="stat">
          <div className="statTitle">Tareas Históricas / Completadas</div>
          <div className="statValue">{stats.tareasCompletadas}</div>
        </div>
        <div className="stat">
          <div className="statTitle">Puntos Acumulados (Disponibles)</div>
          <div className="statValue" style={{ color: '#00C896' }}>{user?.points ?? 0} pts</div>
        </div>
        <div className="stat">
          <div className="statTitle">Puntos Invertidos (Canjes)</div>
          <div className="statValue" style={{ color: '#E53E3E' }}>{stats.puntosGastados} pts</div>
        </div>
        <div className="stat">
          <div className="statTitle">Recompensas Canjeadas</div>
          <div className="statValue">{stats.canjesTotales}</div>
        </div>

        <div className="progressWrap card">
          <h3>Progreso de Tareas Plataforma</h3>
          <div className="progressBar" style={{ marginTop: 10 }}>
            <div className="progressInner" style={{ width: progreso + '%' }} />
          </div>
          <div className="row" style={{ marginTop: 10, color: 'var(--muted)' }}>
            <span>Completadas / Finalizadas: {stats.tareasCompletadas}</span><span>Disponibles / Pendientes: {stats.tareasPendientes}</span>
          </div>
        </div>

        <div className="listWrap">
          <div className="list">
            <h3>Algunas Recompensas Creadas</h3>
            {recompensasDisp.length === 0 && <p style={{ fontSize: 12, opacity: 0.6 }}>No hay recompensas.</p>}
            {recompensasDisp.map((r, i) => (
              <div key={i} className="listItem">
                <div>{r.nombre}</div>
                <div style={{ opacity: .8 }}>{r.puntosRequeridos ?? r.points ?? 0} puntos</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / span 7' }}>
          <h3>Tareas Recientes Registradas</h3>
          {recientes.length === 0 && <p style={{ fontSize: 12, opacity: 0.6 }}>Aún no hay tareas.</p>}
          {recientes.map((t, i) => (
            <div key={t._id || i} className="listItem">
              <div>{t.title}</div>
              <div style={{ opacity: .8 }}>{t.points} pts</div>
            </div>
          ))}
        </div>

        {user?.rol !== "Admin" && (
          <div className="card" style={{ gridColumn: 'span 5' }}>
            <h3>Canjes Recientes</h3>
            {canjesRecientes.length === 0 && <p style={{ fontSize: 12, opacity: 0.6 }}>No hay canjes.</p>}
            {canjesRecientes.map((c, i) => (
              <div key={c._id || i} className="listItem">
                <div>
                  <div>{c.recompensa?.nombre || "Recompensa Desconocida"}</div>
                  <div style={{ opacity: .6, fontSize: 12 }}>{c.fechaCanje ? new Date(c.fechaCanje).toLocaleDateString() : ""}</div>
                </div>
                <div style={{ color: 'var(--danger)' }}>{c.puntosGastados ?? c.recompensa?.puntosRequeridos ?? 0} pts gastados</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
