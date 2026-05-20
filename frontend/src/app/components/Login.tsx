import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, User, Lock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor complete todos los campos');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await onLogin(username, password);
    } catch {
      setError('Credenciales inválidas. Verifique su usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C3E1F] via-[#3A4D29] to-[#4A5D23] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Geometric military pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
        }} />
      </div>

      {/* Animated corner accents */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-[#D91E18]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-[#D91E18]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card with military styling */}
        <div className="bg-white/95 backdrop-blur-sm rounded-sm overflow-hidden shadow-2xl border-2 border-[#4A5D23]/20">
          {/* Header with red accent stripe */}
          <div className="bg-[#4A5D23] p-6 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#D91E18]" />
            <div className="flex items-center justify-center mb-2">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />
              </motion.div>
            </div>
            <h1 className="text-center text-white tracking-wider uppercase" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
              EMCH CFB
            </h1>
            <p className="text-center text-white/80 mt-1" style={{ fontSize: '0.75rem', letterSpacing: '0.15em' }}>
              ESCUELA MILITAR DE CHORRILLOS
            </p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-center text-white/90" style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                Sistema de Gestión de Inventario DTIC
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-l-4 border-[#D91E18] p-3 flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-[#D91E18]" />
                  <p className="text-sm text-[#D91E18]">{error}</p>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2 text-[#2C3E1F] uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
                  <User className="w-4 h-4" />
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-[#4A5D23]/30 focus:border-[#4A5D23] h-11 bg-[#F9F9F6]"
                  placeholder="Ingrese su usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-[#2C3E1F] uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
                  <Lock className="w-4 h-4" />
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#4A5D23]/30 focus:border-[#4A5D23] h-11 bg-[#F9F9F6]"
                  placeholder="Ingrese su contraseña"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#4A5D23] hover:bg-[#3A4D29] text-white uppercase tracking-wider relative overflow-hidden group disabled:opacity-70"
                style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.1em' }}
              >
                <span className="relative z-10">{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
                <motion.div
                  className="absolute inset-0 bg-[#D91E18]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>

              <div className="text-center">
                <a href="#" className="text-sm text-[#5C6064] hover:text-[#4A5D23] transition-colors">
                  ¿Olvidó su contraseña?
                </a>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-[#F5F5F0] px-8 py-4 border-t border-[#4A5D23]/10">
            <p className="text-center text-xs text-[#5C6064]">
              Sistema de uso exclusivo del personal autorizado de la EMCH
            </p>
            <p className="text-center text-xs text-[#5C6064] mt-1">
              © 2026 DTIC - Todos los derechos reservados
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
