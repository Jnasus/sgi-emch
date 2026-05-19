import { motion } from 'motion/react';
import {
  Package,
  Warehouse,
  UserCheck,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Activity,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const statsCards = [
  { icon: Package, label: 'Equipos Totales', value: '1,247', change: '+12%', color: '#4A5D23' },
  { icon: Warehouse, label: 'En Bodega', value: '328', change: '-5%', color: '#5C6064' },
  { icon: UserCheck, label: 'Asignados', value: '847', change: '+8%', color: '#7A8F3A' },
  { icon: Wrench, label: 'En Reparación', value: '42', change: '+15%', color: '#D91E18' },
  { icon: AlertTriangle, label: 'Incidentes Abiertos', value: '23', change: '-10%', color: '#D91E18' },
  { icon: Activity, label: 'Stock Crítico', value: '15', change: '0%', color: '#D91E18' },
];

const equipmentByArea = [
  { area: 'ADMIN', cantidad: 156 },
  { area: 'DTIC', cantidad: 89 },
  { area: 'LOGÍSTICA', cantidad: 124 },
  { area: 'ACADÉMICA', cantidad: 342 },
  { area: 'COMANDO', cantidad: 78 },
  { area: 'APOYO', cantidad: 98 },
];

const incidentsByType = [
  { tipo: 'Hardware', cantidad: 45 },
  { tipo: 'Software', cantidad: 32 },
  { tipo: 'Red', cantidad: 18 },
  { tipo: 'Impresora', cantidad: 12 },
];

const inventoryStatus = [
  { name: 'En Bodega', value: 328 },
  { name: 'Asignados', value: 847 },
  { name: 'En Reparación', value: 42 },
  { name: 'Dado de Baja', value: 30 },
];

const incidentTrend = [
  { mes: 'Ene', incidentes: 45 },
  { mes: 'Feb', incidentes: 52 },
  { mes: 'Mar', incidentes: 38 },
  { mes: 'Abr', incidentes: 41 },
  { mes: 'May', incidentes: 49 },
  { mes: 'Jun', incidentes: 35 },
];

const COLORS = ['#4A5D23', '#7A8F3A', '#D91E18', '#5C6064'];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: stat.color }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-sm bg-[#F5F5F0]">
                      <Icon className="w-5 h-5" style={{ color: stat.color }} strokeWidth={1.5} />
                    </div>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : stat.change.startsWith('-') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    {stat.label}
                  </p>
                  <p className="text-[#2C3E1F]" style={{ fontSize: '1.875rem', fontWeight: 700 }}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment by Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-t-4 border-t-[#4A5D23]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#4A5D23]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Equipos por Área
                </CardTitle>
              </div>
              <CardDescription>Distribución de equipos en áreas operativas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={equipmentByArea}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
                  <XAxis dataKey="area" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#4A5D23" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Incidents by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-t-4 border-t-[#D91E18]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D91E18]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Incidentes por Tipo
                </CardTitle>
              </div>
              <CardDescription>Categorización de incidentes reportados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incidentsByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="tipo" type="category" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#D91E18" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-t-4 border-t-[#5C6064]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#5C6064]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Estado de Inventario
                </CardTitle>
              </div>
              <CardDescription>Distribución actual del inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventoryStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inventoryStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Incident Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="border-t-4 border-t-[#7A8F3A]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#7A8F3A]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Tendencia de Incidentes
                </CardTitle>
              </div>
              <CardDescription>Evolución mensual de incidentes reportados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={incidentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="incidentes"
                    stroke="#7A8F3A"
                    strokeWidth={3}
                    dot={{ fill: '#7A8F3A', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-t-4 border-t-[#4A5D23]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#4A5D23]" />
              <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                Actividad Reciente
              </CardTitle>
            </div>
            <CardDescription>Últimas operaciones registradas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Equipo asignado', detail: 'Laptop HP EliteBook 840 → Área Académica', time: 'Hace 15 min', type: 'success' },
                { action: 'Incidente reportado', detail: 'Ticket #1234 - Impresora sin conectividad', time: 'Hace 30 min', type: 'warning' },
                { action: 'Equipo reparado', detail: 'Desktop Dell OptiPlex 7080 → Listo para asignación', time: 'Hace 1 hora', type: 'success' },
                { action: 'Stock crítico', detail: 'Mouse inalámbrico - Solo quedan 5 unidades', time: 'Hace 2 horas', type: 'error' },
                { action: 'Nuevo registro', detail: 'Monitor LG 24" agregado al inventario', time: 'Hace 3 horas', type: 'info' },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-sm hover:bg-[#F5F5F0] transition-colors border-l-2"
                  style={{
                    borderLeftColor:
                      activity.type === 'success'
                        ? '#4A5D23'
                        : activity.type === 'warning'
                        ? '#D91E18'
                        : activity.type === 'error'
                        ? '#D91E18'
                        : '#5C6064',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{
                      backgroundColor:
                        activity.type === 'success'
                          ? '#4A5D23'
                          : activity.type === 'warning'
                          ? '#D91E18'
                          : activity.type === 'error'
                          ? '#D91E18'
                          : '#5C6064',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>
                      {activity.action}
                    </p>
                    <p className="text-sm text-[#5C6064]">{activity.detail}</p>
                  </div>
                  <p className="text-xs text-[#5C6064] flex-shrink-0">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
