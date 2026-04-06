import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, User, Mail, Lock, ArrowRight, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/heroassets/Logo dynamique de Grace Service.png';
import API_URL from '../utils/config';

export const AuthPages = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nom: '', prenom: '', whatsapp: '', email: '', password: ''
    });
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation du format burkinabè (8 chiffres, ou +226/00226 suivi de 8 chiffres)
        const phoneRegex = /^(?:\+226|00226)?([0-9]{8})$/;
        if (!phoneRegex.test(formData.whatsapp)) {
            setError("Le numéro doit être au format burkinabè : 8 chiffres (avec ou sans +226).");
            return;
        }

        // Validation du mot de passe
        const pwdRegex = /^\S{8,}$/;
        if (!pwdRegex.test(formData.password)) {
            setError("Le mot de passe doit faire au moins 8 caractères sans aucun espace.");
            return;
        }

        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok) {
                if (isLogin) {
                    login(data.user, data.token);
                    navigate('/profile');
                } else {
                    setIsLogin(true); // Switch to login after successful register
                    alert('Compte créé ! Connectez-vous maintenant.');
                }
            } else {
                setError(data.error || 'Une erreur est survenue');
            }
        } catch (err) {
            setError('Impossible de contacter le serveur');
        }
    };

    return (
        <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="text-center mb-8">
                    <div className="inline-flex w-20 h-20 bg-white items-center justify-center rounded-3xl mb-4 p-2 overflow-hidden ring-8 ring-primary/5 shadow-sm">
                        <img src={logo} alt="Grace Service Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 leading-tight">
                        {isLogin ? 'Bon retour parmi nous' : 'Créer un compte'}
                    </h1>
                    <p className="text-sm text-gray-400 font-medium mt-2">
                        {isLogin ? 'Connectez-vous pour continuer sur Grace Service' : 'Rejoignez la plus grande marketplace locale'}
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-xl mb-6 border border-red-100 italic">⚠️ {error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                <input name="nom" placeholder="Nom" onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary transition-all" required />
                            </div>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                <input name="prenom" placeholder="Prénom" onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary transition-all" required />
                            </div>
                        </div>
                    )}
                    
                    <div className="relative group">
                        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input name="whatsapp" placeholder="Numéro WhatsApp (ex: +226...)" onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary transition-all" required />
                    </div>

                    {!isLogin && (
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                            <input name="email" type="email" placeholder="Email (Facultatif)" onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary transition-all" />
                        </div>
                    )}

                    <div className="space-y-1">
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                            <input name="password" type={showPassword ? "text" : "password"} placeholder="Mot de passe" onChange={handleChange} className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary transition-all" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {isLogin && (
                            <div className="text-right px-2">
                                <a 
                                    href={`https://wa.me/22674846759?text=Bonjour Grace Service, j'ai oublié mon mot de passe pour mon compte associé au numéro ${formData.whatsapp || '[Veuillez préciser votre numéro]'}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-gray-400 hover:text-primary transition-all underline"
                                >
                                    Mot de passe oublié ?
                                </a>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        {isLogin ? 'Se connecter' : 'S\'inscrire'}
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-8 text-center pt-8 border-t border-gray-50">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-gray-400 text-sm font-bold hover:text-primary transition-all">
                        {isLogin ? 'Pas de compte ? Créer gratuitement' : 'Déjà inscrit ? Connectez-vous'}
                    </button>
                </div>
            </div>
        </div>
    );
};
