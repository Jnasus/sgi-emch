import { useState, useEffect } from 'react';
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
import { Catalogos } from './components/Catalogos';
import * as authService from '../services/authService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  const handleLogin = async (username: string, password: string): Promise<void> => {
    await authService.login(username, password);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  useEffect(() => {
    window.addEventListener('sgi:unauthorized', handleLogout);
    return () => window.removeEventListener('sgi:unauthorized', handleLogout);
  }, []);

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
          <Route path="/inventario/:id/editar" element={<InventarioNuevo />} />
          <Route path="/inventario/:id" element={<InventarioDetalle />} />
          <Route path="/incidentes" element={<Incidentes />} />
          <Route path="/incidentes/nuevo" element={<IncidenteNuevo />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracion" element={<Catalogos />} />
        </Routes>
      </Layout>
    </Router>
  );
}
