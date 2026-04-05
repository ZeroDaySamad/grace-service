import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Package, Settings, LogOut, ChevronRight, Plus, Edit, Trash2, ExternalLink, MapPin, CreditCard, MessageCircle, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, logout, updateUserInfo } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [proModal, setProModal] = useState(false);
  const [proData, setProData] = useState({ ville: '', plan_type: 'MENSUEL' });
  const [sellerStats, setSellerStats] = useState([]);

  useEffect(() => {
    if (user?.id) {
        // Fetch fresh user data to sync admin activations
        fetch(`http://localhost:5000/api/users/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) updateUserInfo(data);
            })
            .catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'PRO' && user?.plan_status === 'ACTIVE') {
        fetch(`http://localhost:5000/api/products/vendor/${user.id}/stats`)
            .then(res => res.json())
            .then(data => setSellerStats(data))
            .catch(err => console.error(err));
    }
  }, [user?.role, user?.plan_status]);

  const calculateDaysRemaining = () => {
    if (!user?.plan_expiry) return 0;
    const diff = new Date(user.plan_expiry) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleUpgradeRequest = async () => {
    try {
        const res = await fetch(`http://localhost:5000/api/users/${user.id}/upgrade`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proData)
        });
        if (res.ok) {
            updateUserInfo({ ...proData, plan_status: 'PENDING' });
            
            // Redirect to WhatsApp Admin
            const adminPhone = "+22600000000"; // Replace with real admin phone
            const message = `Bonjour Admin, je souhaite activer mon plan PRO sur WhatsPlace.\nNom: ${user.nom} ${user.prenom}\nWhatsApp: ${user.whatsapp}\nVille: ${proData.ville}\nPlan: ${proData.plan_type}`;
            window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
            
            setProModal(false);
        }
    } catch (err) {
        alert('Erreur lors de la demande');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-black shadow-xl shadow-primary/5">
                {user?.nom[0]}{user?.prenom[0]}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg ring-4 ring-white">
                <User size={18} />
            </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase ${user?.plan_status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                    {user?.role === 'PRO' ? 'Vendeur Pro' : 'Acheteur'}
                </span>
                {user?.plan_status === 'PENDING' && (
                    <span className="text-[10px] font-black tracking-widest bg-orange-50 text-orange-500 px-3 py-1 rounded-full uppercase">Activation en attente</span>
                )}
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">{user?.nom} {user?.prenom}</h1>
            <p className="text-sm text-gray-400 font-medium mb-4">{user?.whatsapp}</p>
            
            {user?.role !== 'PRO' && user?.plan_status === 'NONE' && (
                <button 
                  onClick={() => setProModal(true)}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-primary transition-all shadow-lg shadow-gray-200"
                >
                    <Plus size={16} />
                    Devenir Vendeur Pro
                </button>
            )}
            {user?.role === 'PRO' && user?.plan_status === 'ACTIVE' && (
                <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
                    <Clock size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">{calculateDaysRemaining()} Jours Restants sur le Plan {user.plan_type}</span>
                </div>
            )}
        </div>
      </div>

      {/* Main Stats / Dashboard */}
      {user?.role === 'PRO' && user?.plan_status === 'ACTIVE' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="text-2xl font-black text-gray-900">{sellerStats.length}</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Produits Actifs</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="text-2xl font-black text-primary">
                    {sellerStats.reduce((acc, curr) => acc + curr.whatsapp_clicks, 0)}
                </div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Commandes WhatsApp</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="text-2xl font-black text-blue-500">98%</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Satisfaction</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="text-2xl font-black text-orange-500">~15m</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Réponse</div>
            </div>
        </div>
      ) : (
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                <Package size={24} />
            </div>
            <div>
                <h3 className="font-black text-blue-900 text-sm">Prêt à vendre ?</h3>
                <p className="text-xs text-blue-700/70">Passez en mode Pro pour lister vos produits et recevoir des commandes directement.</p>
            </div>
        </div>
      )}

      {/* Tabs / Content */}
      <div className="space-y-6">
        <div className="flex border-b border-gray-100 gap-8">
            <button 
                onClick={() => setActiveTab('products')}
                className={`pb-4 text-sm font-black transition-all relative ${activeTab === 'products' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Mes Produits
                {activeTab === 'products' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
            </button>
        </div>

        {activeTab === 'products' && (
            <div className="grid gap-4">
                {user?.role === 'PRO' && user?.plan_status === 'ACTIVE' ? (
                    <>
                        <button className="w-full bg-white border-2 border-dashed border-gray-200 p-8 rounded-3xl text-gray-400 hover:text-primary hover:border-primary/30 transition-all flex flex-col items-center gap-3 group">
                            <Plus size={24} />
                            <span className="font-bold text-sm">Ajouter un nouveau produit</span>
                        </button>
                        {sellerStats.map(prod => (
                             <div key={prod.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group transition-all hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-bold">#</div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">{prod.name}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase">
                                            <BarChart3 size={12} />
                                            {prod.whatsapp_clicks} clics WhatsApp
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                     <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-primary transition-all"><Edit size={16} /></button>
                                     <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                                </div>
                             </div>
                        ))}
                    </>
                ) : (
                    <div className="text-center py-12 bg-white rounded-3xl border border-gray-50 shadow-sm flex flex-col items-center gap-4">
                        <Package size={48} className="text-gray-100" />
                        <p className="text-sm text-gray-400 font-medium">Activez votre plan Pro pour commencer à vendre.</p>
                    </div>
                )}
            </div>
        )}
      </div>

      <button onClick={logout} className="w-full py-5 rounded-3xl border border-gray-100 font-bold text-sm text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-3">
        <LogOut size={20} />
        Se déconnecter
      </button>

      {/* Upgrade Modal */}
      {proModal && (
          <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl relative">
                  <button onClick={() => setProModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">×</button>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Devenir Pro 🚀</h2>
                  <p className="text-sm text-gray-400 mb-8">Boostez vos ventes et débloquez les outils professionnels.</p>
                  
                  <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <MapPin size={12} /> Votre Ville
                        </label>
                        <input 
                            placeholder="ex: Ouagadougou" 
                            onChange={(e) => setProData({...proData, ville: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all border-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <CreditCard size={12} /> Choisir un Plan
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setProData({...proData, plan_type: 'MENSUEL'})}
                                className={`p-4 rounded-2xl border-2 transition-all ${proData.plan_type === 'MENSUEL' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400'}`}
                            >
                                <div className="font-black text-sm">Mensuel</div>
                                <div className="text-[10px] font-bold opacity-70">30 Jours</div>
                            </button>
                            <button 
                                onClick={() => setProData({...proData, plan_type: 'TRIMESTRIEL'})}
                                className={`p-4 rounded-2xl border-2 transition-all ${proData.plan_type === 'TRIMESTRIEL' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400'}`}
                            >
                                <div className="font-black text-sm">Trimestriel</div>
                                <div className="text-[10px] font-bold opacity-70">90 Jours</div>
                            </button>
                        </div>
                      </div>

                      <button 
                        onClick={handleUpgradeRequest}
                        disabled={!proData.ville}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                      >
                        Démarrer l'activation
                        <MessageCircle size={20} />
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
    </div>
  );
};

export default Profile;
