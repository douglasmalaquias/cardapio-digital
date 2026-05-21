import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Valida o e-mail e senha diretamente com o Auth do Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });

    if (error) {
      alert('Erro ao aceder: ' + error.message);
    } else {
      navigate('/'); // Se estiver correto, entra no Hub Central
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-900">
      <div className="max-w-md w-full bg-white border rounded-3xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-gray-950 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs mx-auto">
            🔒
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase mt-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-500 text-sm">
            Introduza as suas credenciais administrativas para gerir a plataforma.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu-email@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-950"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-950"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-950 hover:bg-gray-800 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? 'A verificar...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
