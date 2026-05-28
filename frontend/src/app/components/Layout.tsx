import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router';
import { listarTicketsPorEstado } from '../../services/ticketService';
import { contarNoLeidas } from '../../services/notificacionService';
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

const ROL_LABEL: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  TECNICO: 'Técnico DTIC',
  SUPERVISOR: 'Supervisor',
};

const ROL_ACCENT: Record<string, { border: string; avatar: string; label: string }> = {
  ADMINISTRADOR: {
    border: 'border-l-[#D91E18]',
    avatar: 'bg-[#D91E18]/20 text-[#ff8080]',
    label:  'text-[#ff8080]',
  },
  TECNICO: {
    border: 'border-l-blue-500',
    avatar: 'bg-blue-500/20 text-blue-300',
    label:  'text-blue-300',
  },
  SUPERVISOR: {
    border: 'border-l-purple-500',
    avatar: 'bg-purple-500/20 text-purple-300',
    label:  'text-purple-300',
  },
};

const BASE_MENU = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard' },
  { icon: Package,         label: 'Inventario',     path: '/inventario' },
  { icon: AlertTriangle,   label: 'Incidentes',     path: '/incidentes', badgeKey: 'incidentes' },
  { icon: FileText,        label: 'Reportes',       path: '/reportes' },
  { icon: Bell,            label: 'Notificaciones', path: '/notificaciones', badgeKey: 'notificaciones' },
  { icon: Users,           label: 'Usuarios',       path: '/usuarios' },
  { icon: Settings,        label: 'Configuración',  path: '/configuracion' },
];

export function Layout({ children, onLogout, userName = 'Usuario', userRole = '' }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const [ticketsAbiertos, setTicketsAbiertos] = useState<number | null>(null);
  const [noLeidas, setNoLeidas] = useState<number | null>(null);

  // Cargar conteo de tickets ABIERTOS para el badge del menú
  useEffect(() => {
    listarTicketsPorEstado('ABIERTO', {}, 0, 1)
      .then(r => setTicketsAbiertos(r.totalElements))
      .catch(() => {}); // silencioso — el badge es informativo
    contarNoLeidas()
      .then(c => setNoLeidas(c))
      .catch(() => {}); // silencioso — el badge es informativo
  }, []);

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
        {sidebarOpen && (() => {
          const accent = ROL_ACCENT[userRole] ?? {
            border: 'border-l-white/20',
            avatar: 'bg-white/10 text-white/70',
            label:  'text-white/50',
          };
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`border-y border-white/10 border-l-4 ${accent.border}`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Monogram */}
                <div className={`w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0 ${accent.avatar}`}
                  style={{ fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.05em' }}>
                  {userName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate uppercase"
                    style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em' }}>
                    {userName}
                  </p>
                  <p className={`truncate uppercase ${accent.label}`}
                    style={{ fontSize: '0.625rem', letterSpacing: '0.18em' }}>
                    {ROL_LABEL[userRole] ?? userRole}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {BASE_MENU.map((item, index) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
              const Icon = item.icon;
              const badgeCount = item.badgeKey === 'incidentes'
                ? ticketsAbiertos
                : item.badgeKey === 'notificaciones'
                ? noLeidas
                : null;

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
                          {badgeCount != null && badgeCount > 0 && (
                            <Badge className="bg-[#D91E18] text-white hover:bg-[#D91E18] h-5 px-2 text-xs">
                              {badgeCount > 99 ? '99+' : badgeCount}
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
                  {BASE_MENU.find(item =>
                    item.path === location.pathname ||
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'))
                  )?.label || 'Sistema DTIC'}
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
