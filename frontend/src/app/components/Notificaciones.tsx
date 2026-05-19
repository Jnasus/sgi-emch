import { motion } from 'motion/react';
import { Bell, AlertTriangle, Package, CheckCircle, Info, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const notifications = [
  { id: 1, type: 'critical', icon: AlertTriangle, title: 'Stock Crítico', message: 'Mouse inalámbrico - Solo quedan 5 unidades en bodega', time: 'Hace 15 min', area: 'Inventario', unread: true },
  { id: 2, type: 'warning', icon: Package, title: 'Equipos por Reponer', message: 'Se requiere reposición de 15 equipos identificados como obsoletos', time: 'Hace 1 hora', area: 'Inventario', unread: true },
  { id: 3, type: 'critical', icon: AlertTriangle, title: 'Alerta de Mantenimiento', message: '8 laptops requieren mantenimiento preventivo urgente', time: 'Hace 2 horas', area: 'Mantenimiento', unread: true },
  { id: 4, type: 'info', icon: Info, title: 'Nuevo Equipo Registrado', message: 'Monitor LG 27" ha sido agregado al inventario - Código: EJ-2024-001250', time: 'Hace 3 horas', area: 'Inventario', unread: false },
  { id: 5, type: 'success', icon: CheckCircle, title: 'Incidente Resuelto', message: 'Ticket #1237 - Monitor con pantalla parpadeante ha sido cerrado', time: 'Hace 4 horas', area: 'Incidentes', unread: false },
  { id: 6, type: 'warning', icon: Package, title: 'Garantía por Vencer', message: '3 equipos tienen garantía que vence en los próximos 30 días', time: 'Hace 5 horas', area: 'Garantías', unread: false },
  { id: 7, type: 'info', icon: Info, title: 'Asignación Completada', message: 'Desktop Dell OptiPlex asignado al Área de Logística', time: 'Hace 6 horas', area: 'Inventario', unread: false },
  { id: 8, type: 'critical', icon: AlertTriangle, title: 'Múltiples Incidentes', message: '5 nuevos tickets abiertos en las últimas 24 horas', time: 'Hace 1 día', area: 'Incidentes', unread: false },
];

const typeConfig = {
  critical: { bg: 'bg-red-50 border-l-red-500', iconColor: 'text-red-600', badgeColor: 'bg-red-100 text-red-700' },
  warning: { bg: 'bg-yellow-50 border-l-yellow-500', iconColor: 'text-yellow-600', badgeColor: 'bg-yellow-100 text-yellow-700' },
  success: { bg: 'bg-green-50 border-l-green-500', iconColor: 'text-green-600', badgeColor: 'bg-green-100 text-green-700' },
  info: { bg: 'bg-blue-50 border-l-blue-500', iconColor: 'text-blue-600', badgeColor: 'bg-blue-100 text-blue-700' },
};

export function Notificaciones() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            Centro de Notificaciones
          </h2>
          <p className="text-[#5C6064]">Alertas y notificaciones del sistema</p>
        </div>
        <Button variant="outline" className="gap-2 border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white">
          <CheckCircle className="w-4 h-4" />
          Marcar Todas Leídas
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification, index) => {
          const Icon = notification.icon;
          const config = typeConfig[notification.type as keyof typeof typeConfig];

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border-l-4 ${config.bg} ${notification.unread ? 'shadow-md' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${config.iconColor} bg-white`}>
                      <Icon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>
                            {notification.title}
                          </h3>
                          {notification.unread && (
                            <div className="w-2 h-2 rounded-full bg-[#D91E18]" />
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5C6064] hover:text-[#2C3E1F]">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-[#5C6064] mb-3">{notification.message}</p>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`${config.badgeColor} border-0`}>
                          {notification.area}
                        </Badge>
                        <span className="text-sm text-[#5C6064]">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
