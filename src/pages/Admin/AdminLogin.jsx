import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight, Loader2, Warehouse } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../assets/heroassets/Logo dynamique de Grace Service.png';
import API_URL from '../../utils/config';

const AdminLogin = () => {
    const [whatsapp, setWhatsapp] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // NOTE: Admin uses separate localStorage keys (admin_token/admin_user)
    // to avoid overwriting the regular user's session

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsapp, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erreur de connexion');

            if (data.user.role !== 'ADMIN') {
                throw new Error('Accès réservé aux administrateurs');
            }

            // Use SEPARATE keys so user session is never affected
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12"
            >
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 ring-8 ring-primary/5 p-2 overflow-hidden shadow-sm">
                        <img src={logo} alt="Grace Service Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Espace Administration</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Grace Service Manager</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-black text-center border border-red-100"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identifiant WhatsApp</label>
                        <div className="relative group">
                            <Warehouse className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                            <input 
                                type="text"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="+226 XX XX XX XX"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                Se connecter au Panel
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
