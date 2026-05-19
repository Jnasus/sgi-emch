import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventario } from './components/Inventario';
import { InventarioDetalle } from './components/InventarioDetalle';
import { InventarioNuevo } from './components/InventarioNuevo';
import { Incidentes } from './components/Incidentes';
import { IncidenteNuevo } from './components/IncidenteNuevo';
import { Reportes } from './components/Reportes';
import { Notificaciones } from './components/Notificaciones';
import { Usuarios } from './components/Usuarios';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (username: string, password: string) => {
    // Simulación de autenticación
    // En producción, aquí se validaría contra el backend
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/inventario/nuevo" element={<InventarioNuevo />} />
          <Route path="/inventario/:id" element={<InventarioDetalle />} />
          <Route path="/incidentes" element={<Incidentes />} />
          <Route path="/incidentes/nuevo" element={<IncidenteNuevo />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracion" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}