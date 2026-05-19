import { useState, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  FileText,
  Bell,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
  userName?: string;
  userRole?: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Inventario', path: '/inventario' },
  { icon: AlertTriangle, label: 'Incidentes', path: '/incidentes', badge: 3 },
  { icon: FileText, label: 'Reportes', path: '/reportes' },
  { icon: Bell, label: 'Notificaciones', path: '/notificaciones', badge: 5 },
  { icon: Users, label: 'Usuarios', path: '/usuarios' },
  { icon: Settings, label: 'Configuración', path: '/configuracion' },
];

export function Layout({ children, onLogout, userName = 'Admin DTIC', userRole = 'Administrador' }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-[#2C3E1F] border-r-4 border-[#D91E18] flex flex-col relative z-20 shadow-xl"
      >
        {/* Header with logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <motion.div
              initial={false}
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              className="flex items-center gap-3"
            >
              <Shield className="w-10 h-10 text-[#D91E18]" strokeWidth={1.5} />
              {sidebarOpen && (
                <div>
                  <h2 className="text-white tracking-wider uppercase" style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                    EMCH CFB
                  </h2>
                  <p className="text-white/60 uppercase" style={{ fontSize: '0.625rem', letterSpacing: '0.15em' }}>
                    Sistema DTIC
                  </p>
                </div>
              )}
            </motion.div>
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* User info */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-[#3A4D29] border-y border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4A5D23] flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white truncate" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {userName}
                </p>
                <p className="text-white/60 truncate" style={{ fontSize: '0.75rem' }}>
                  {userRole}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={item.path}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all relative group ${
                        isActive
                          ? 'bg-[#4A5D23] text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-[#D91E18]"
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 uppercase tracking-wide" style={{ fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <Badge className="bg-[#D91E18] text-white hover:bg-[#D91E18] h-5 px-2 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start text-white/70 hover:text-white hover:bg-[#D91E18]/20 gap-3"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && (
              <span className="uppercase tracking-wide" style={{ fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                Cerrar Sesión
              </span>
            )}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-[#4A5D23]/10 shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[#4A5D23]" />
              <div>
                <h1 className="text-[#2C3E1F] uppercase tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                  {menuItems.find(item => item.path === location.pathname)?.label || 'Sistema DTIC'}
                </h1>
                <p className="text-[#5C6064] text-sm">
                  Gestión de Inventario de Equipos Informáticos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-[#2C3E1F]" style={{ fontWeight: 600 }}>
                  {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-xs text-[#5C6064]">
                  {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="h-10 w-1 bg-[#D91E18]" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
