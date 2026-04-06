import React, { useState, useEffect } from 'react';
import { 
    Users, Package, TrendingUp, ShieldCheck, Search, Trash2, 
    ArrowRight, CheckCircle2, XCircle, LogOut, LayoutDashboard, 
    MessageCircle, Code2, ExternalLink, Calendar, CreditCard, ChevronRight, Key,
    Users2, ShoppingBag, BarChart3, Mail, Phone, MapPin, Loader2, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/heroassets/Logo dynamique de Grace Service.png';
import API_URL from '../../utils/config';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [planPrice, setPlanPrice] = useState('');
    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
    const navigate = useNavigate();

    // Use SEPARATE admin session keys — never touch the user's session
    const token = localStorage.getItem('admin_token');

    const handleAdminLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/admin/login');
    };

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [statsRes, usersRes, prodsRes] = await Promise.all([
                fetch(`${API_URL}/admin/stats`, { headers }),
                fetch(`${API_URL}/admin/users`, { headers }),
                fetch(`${API_URL}/admin/products`, { headers })
            ]);

            const statsData = await statsRes.json();
            const usersData = await usersRes.json();
            const prodsData = await prodsRes.json();

            setStats(statsData);
            setUsers(usersData);
            setProducts(prodsData);

            // Fetch current plan price
            const settingsRes = await fetch(`${API_URL}/settings/plan_price`);
            const settingsData = await settingsRes.json();
            if (settingsData.value) setPlanPrice(settingsData.value);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Toutes ses données seront effacées.')) return;
        try {
            const res = await fetch(`${API_URL}/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleActivatePlan = async (userId, type, months) => {
        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}/activate-plan`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan_type: type, duration_months: months })
            });
            if (res.ok) {
                alert(`Plan ${type} activé avec succès !`);
                fetchData();
            }
        } catch (error) {
            console.error('Error activating plan:', error);
        }
    };

    const handleCancelPlan = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler le plan de cet utilisateur ?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}/cancel-plan`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Plan annulé avec succès !');
                fetchData();
            }
        } catch (error) {
            console.error('Error canceling plan:', error);
        }
    };
    
    const handleResetPassword = async (userId) => {
        const newPassword = window.prompt("Entrez le nouveau mot de passe temporaire :");
        if (!newPassword || newPassword.length < 8) {
            if (newPassword) alert("Le mot de passe doit faire au moins 8 caractères.");
            return;
        }
        
        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}/reset-password`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_password: newPassword })
            });
            if (res.ok) {
                alert('Mot de passe réinitialisé avec succès !');
            } else {
                const data = await res.json();
                alert(data.error || 'Erreur lors de la réinitialisation');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            const res = await fetch(`${API_URL}/admin/categories`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newCategory.trim() })
            });
            if (res.ok) {
                alert('Catégorie ajoutée avec succès !');
                setNewCategory('');
            } else {
                const data = await res.json();
                alert(data.error || 'Erreur lors de l’ajout de la catégorie');
            }
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    const handleUpdatePrice = async (e) => {
        e.preventDefault();
        setIsUpdatingPrice(true);
        try {
            const res = await fetch(`${API_URL}/settings/plan_price`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ value: planPrice })
            });
            if (res.ok) {
                alert('Prix du plan mis à jour avec succès !');
            } else {
                const data = await res.json();
                alert(data.error || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Error updating price:', error);
            alert('Erreur réseau');
        } finally {
            setIsUpdatingPrice(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.whatsapp.includes(searchTerm)
    );

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getImageUrl = (img) => {
        if (!img) return 'https://placehold.co/400x400?text=Indisponible';
        if (img.startsWith('http')) return img;
        return `${API_URL.replace('/api', '')}${img}`;
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-12 min-h-[90vh] gap-6 animate-in fade-in duration-500">
            {/* Sidebar / Top Nav Mobile */}
            <div className="lg:col-span-3 space-y-4">
                <div className="bg-white rounded-[32px] p-4 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
                    <div className="flex items-center gap-4 p-4 border-b border-gray-50 mb-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 ring-4 ring-primary/5 p-1 overflow-hidden">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate tracking-tight">Admin Grace Service</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Connecté</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'overview', icon: LayoutDashboard, label: 'Tableau de bord' },
                            { id: 'users', icon: Users2, label: 'Utilisateurs' },
                            { id: 'products', icon: ShoppingBag, label: 'Produits' },
                            { id: 'settings', icon: Settings, label: 'Paramètres' },
                            { id: 'developer', icon: Code2, label: 'Contact Développeur' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                    activeTab === item.id 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                                {activeTab === item.id && <ChevronRight size={14} className="ml-auto" />}
                            </button>
                        ))}

                        <div className="h-px bg-gray-50 my-4 mx-4" />

                        <button
                            onClick={handleAdminLogout}
                            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-50 transition-all focus:outline-none"
                        >
                            <LogOut size={18} />
                            Déconnexion
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9 space-y-6">
                <AnimatePresence mode="wait">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: Users, color: 'primary' },
                                    { label: 'Produits', value: stats?.totalProducts || 0, icon: Package, color: 'blue' },
                                    { label: 'Membres PRO', value: stats?.proUsers || 0, icon: ShieldCheck, color: 'emerald' },
                                    { label: 'Clics WhatsApp', value: stats?.totalWhatsAppClicks || 0, icon: TrendingUp, color: 'orange' },
                                ].map((stat, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                        key={stat.label} className="bg-white p-6 rounded-[32px] shadow-lg shadow-gray-100 border border-gray-50 text-center space-y-3"
                                    >
                                        <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-500 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-${stat.color}-50/50`}>
                                            <stat.icon size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Activités Récentes</h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60">Visualisation globale</p>
                                    </div>
                                    <button onClick={fetchData} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-primary">
                                        <LayoutDashboard size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {users.slice(0, 5).map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-primary/10 transition-all group">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary font-black shadow-sm group-hover:scale-110 transition-transform">
                                                    {user.nom[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{user.nom} {user.prenom}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-tight uppercase">{user.whatsapp}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.plan_status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                                                    {user.plan_status === 'ACTIVE' ? 'PRO' : 'BASIQUE'}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-300">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <motion.div key="users" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl shadow-gray-200/50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Gestion Utilisateurs</h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60">{users.length} total</p>
                                    </div>
                                    <div className="relative group w-full md:max-w-xs">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Chercher..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto no-scrollbar pb-4">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="border-b border-gray-50">
                                                <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Identité</th>
                                                <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Statut / Plan</th>
                                                <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Produits</th>
                                                <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredUsers.map(user => (
                                                <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                                                    <td className="py-5 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-black text-xs overflow-hidden border border-gray-100">
                                                                {user.avatar ? (
                                                                    <img src={getImageUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{user.nom[0]}{user.prenom[0]}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user.nom} {user.prenom}</p>
                                                                <p className="text-[11px] font-bold text-gray-400 group-hover:text-primary transition-colors">{user.whatsapp}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-4">
                                                        <div className="space-y-1.5">
                                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.plan_status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                                {user.plan_status === 'ACTIVE' ? `PRO • ${user.plan_type}` : 'BASIC'}
                                                            </span>
                                                            {user.plan_expiry && user.plan_status === 'ACTIVE' && (
                                                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter ml-1">
                                                                    Expire : {new Date(user.plan_expiry).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-4 text-center">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-900 text-[11px] font-black group-hover:bg-primary group-hover:text-white transition-all">
                                                            {user.productCount}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 px-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="flex gap-1">
                                                                 <button 
                                                                     onClick={() => handleActivatePlan(user.id, 'PRO', 1)}
                                                                     className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                                                                     title="Activer Plan PRO (30 jours)"
                                                                 >
                                                                     Activer
                                                                 </button>
                                                                 <button 
                                                                     onClick={() => handleResetPassword(user.id)}
                                                                     className="px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all ml-1"
                                                                     title="Réinitialiser le mot de passe"
                                                                 >
                                                                     <Key size={12} />
                                                                 </button>
                                                                 {user.plan_status === 'ACTIVE' && (
                                                                     <button 
                                                                         onClick={() => handleCancelPlan(user.id)}
                                                                         className="px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all ml-1"
                                                                         title="Annuler le plan"
                                                                     >
                                                                         X
                                                                     </button>
                                                                 )}
                                                             </div>
                                                            <button 
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all outline-none"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PRODUCTS TAB */}
                    {activeTab === 'products' && (
                        <motion.div key="products" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl shadow-gray-200/50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Focus Produits</h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60">{products.length} catalogués</p>
                                    </div>
                                    <div className="relative group w-full md:max-w-xs">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Filtrer par nom ou catégorie..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredProducts.map(p => (
                                        <div key={p.id} className="bg-gray-50 p-4 rounded-3xl border border-transparent hover:border-primary/10 transition-all flex gap-4 group">
                                            <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden shrink-0 shadow-sm">
                                                <img src={getImageUrl(p.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="min-w-0 flex-1 flex flex-col justify-between py-1">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="px-2 py-0.5 rounded-full bg-white text-[8px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">{p.category}</span>
                                                        <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                                            <TrendingUp size={10} />
                                                            {p.whatsapp_clicks} clics
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-gray-900 truncate leading-none">{p.name}</h4>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-xs font-black text-primary">{p.price.toLocaleString()} <span className="text-[10px]">FCFA</span></p>
                                                    <p className="text-[10px] font-bold text-gray-400 italic truncate ml-2 max-w-[100px]">Par: {p.seller_prenom}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl shadow-gray-200/50 mt-6">
                                <div className="space-y-1 mb-6">
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Nouvelle Catégorie</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60">Ajouter une catégorie au catalogue</p>
                                </div>
                                <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Nom de la catégorie..." 
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="flex-1 px-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    />
                                    <button 
                                        type="submit" 
                                        className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary-dark transition-all"
                                    >
                                        Ajouter
                                    </button>
                                </form>
                            </div>

                        </motion.div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <motion.div key="settings" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl mx-auto">
                            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                                <div className="space-y-2 mb-8 text-center">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                        <Settings size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Configuration Plateforme</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60">Gérer les paramètres globaux de Grace Service</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100/50 space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Abonnement Vendeur PRO</p>
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 leading-tight">Prix de l'activation (30 jours)</h3>
                                            <p className="text-xs font-medium text-gray-400">Ce montant sera affiché à tous les vendeurs souhaitant passer en PRO et sera inclus dans le message WhatsApp administrateur.</p>
                                        </div>

                                        <form onSubmit={handleUpdatePrice} className="space-y-4">
                                            <div className="relative group">
                                                <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                                <input 
                                                    type="number" 
                                                    value={planPrice}
                                                    onChange={(e) => setPlanPrice(e.target.value)}
                                                    placeholder="Montant en FCFA..." 
                                                    className="w-full pl-16 pr-24 py-5 bg-white border-2 border-transparent rounded-[24px] text-lg font-black focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm"
                                                    required
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">FCFA</div>
                                            </div>

                                            <button 
                                                type="submit" 
                                                disabled={isUpdatingPrice}
                                                className="w-full bg-primary text-white py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {isUpdatingPrice ? (
                                                    <Loader2 className="animate-spin" size={20} />
                                                ) : (
                                                    <>
                                                        Enregistrer les modifications
                                                        <ArrowRight size={20} />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>

                                    <div className="p-6 border-2 border-dashed border-gray-100 rounded-[32px] flex items-center gap-4 text-gray-400">
                                        <ShieldCheck size={40} className="shrink-0 opacity-20" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Les changements de prix s'appliquent instantanément pour tous les nouveaux prospects et les renouvellements.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* DEVELOPER TAB */}
                    {activeTab === 'developer' && (
                        <motion.div key="developer" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-2xl mx-auto">
                            <div className="bg-primary-dark rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Code2 size={120} />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="space-y-4">
                                        <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center ring-4 ring-white/5">
                                            <Code2 size={28} />
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight leading-none">Support Technique</h2>
                                        <p className="text-primary-light/70 text-sm font-medium max-w-sm">Optimisation et maintenance de votre plateforme marketplace.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { icon: MessageCircle, label: 'WhatsApp', detail: '07158478', color: 'emerald' },
                                            { icon: Mail, label: 'Développeur', detail: 'CipherSam', color: 'blue' },
                                            { icon: MapPin, label: 'Ville', detail: 'Bobo dioulasso', color: 'orange' },
                                            { icon: Phone, label: 'Urgence', detail: '07158478', color: 'red' },
                                        ].map((contact, i) => (
                                            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-[24px] border border-white/10 hover:bg-white/10 transition-all group">
                                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                                    <contact.icon size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-primary-light/50 uppercase tracking-widest leading-none">{contact.label}</p>
                                                    <p className="text-sm font-bold text-white group-hover:text-primary-light transition-colors">{contact.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button 
                                            onClick={() => window.open('https://wa.me/+22607158478?text=Bonjour, je souhaite contacter le développeur pour Grace Service.', '_blank')}
                                            className="flex-1 bg-white text-primary-dark py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-primary transition-all active:scale-95"
                                        >
                                            Me contacter sur WhatsApp
                                            <ChevronRight size={18} />
                                        </button>
                                        <button className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all">
                                            <ExternalLink size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;
