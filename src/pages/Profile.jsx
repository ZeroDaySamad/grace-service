import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { User, Package, Settings, LogOut, ChevronRight, Plus, Edit, Trash2, ExternalLink, MapPin, CreditCard, MessageCircle, BarChart3, Clock, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '../utils/config';

const Profile = () => {
  const { user, logout, updateUserInfo, token } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [proModal, setProModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState({ nom: user?.nom || '', prenom: user?.prenom || '' });
  const [addProductModal, setAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category: 'Électronique' });
  const [editProductModal, setEditProductModal] = useState(false);
  const [editProductData, setEditProductData] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [proData, setProData] = useState({ ville: '', plan_type: 'MENSUEL' });
  const [sellerStats, setSellerStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [planPrice, setPlanPrice] = useState('2500');
  const fileInputRef = React.useRef(null);
  const [searchParams] = useSearchParams();

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API_URL.replace('/api', '')}${img}`;
  };

  useEffect(() => {
    // Fetch categories
    fetch(`${API_URL}/categories`)
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(console.error);

    // Fetch current plan price
    fetch(`${API_URL}/settings/plan_price`)
        .then(res => res.json())
        .then(data => {
            if (data.value) setPlanPrice(data.value);
        })
        .catch(console.error);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();
    
    // Fetch fresh user data to sync admin activations
    fetch(`${API_URL}/users/${user.id}`, { 
        signal: controller.signal,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            // CRITICAL: Only update if we are still on the same user and data is valid
            if (!data.error && data.id === user.id) {
                updateUserInfo(data);
            }
        })
        .catch(err => {
            if (err.name !== 'AbortError') console.error(err);
        });

    return () => controller.abort();
  }, [user?.id]); // Re-run if user ID changes

  useEffect(() => {
    if (user?.role === 'PRO' && user?.plan_status === 'ACTIVE') {
        fetch(`${API_URL}/products/vendor/${user.id}/stats`)
            .then(res => res.json())
            .then(data => setSellerStats(data))
            .catch(err => console.error(err));
            
        if (searchParams.get('action') === 'add-product') {
            setAddProductModal(true);
        }
    }
  }, [user?.role, user?.plan_status, searchParams]);

  const calculateDaysRemaining = () => {
    if (!user?.plan_expiry) return 0;
    const diff = new Date(user.plan_expiry) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('category', newProduct.category);
    formData.append('sellerId', user.id);
    formData.append('ville', user.ville);
    if (productImage) formData.append('image', productImage);

    try {
        const res = await fetch(`${API_URL}/products/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            setAddProductModal(false);
            setNewProduct({ name: '', description: '', price: '', category: 'Électronique' });
            setProductImage(null);
            // Refresh stats
            fetch(`${API_URL}/products/vendor/${user.id}/stats`)
                .then(r => r.json())
                .then(d => setSellerStats(d));
        } else {
            alert(data.error || "Erreur lors de l'ajout");
        }
    } catch (err) {
        alert("Erreur réseau");
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (res.ok) {
            setSellerStats(sellerStats.filter(p => p.id !== productId));
        } else {
            alert(data.error || "Erreur lors de la suppression");
        }
    } catch (err) {
        alert("Erreur réseau");
    } finally {
        setLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', editProductData.name);
    formData.append('description', editProductData.description);
    formData.append('price', editProductData.price);
    formData.append('category', editProductData.category);
    if (productImage) formData.append('image', productImage);

    try {
        const res = await fetch(`${API_URL}/products/${editProductData.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            setEditProductModal(false);
            setEditProductData(null);
            setProductImage(null);
            // Refresh stats
            fetch(`${API_URL}/products/vendor/${user.id}/stats`)
                .then(r => r.json())
                .then(d => setSellerStats(d));
        } else {
            alert(data.error || "Erreur lors de la modification");
        }
    } catch (err) {
        alert("Erreur réseau");
    } finally {
        setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/users/${user.id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(editName)
        });
        if (res.ok) {
            updateUserInfo({ ...user, ...editName });
            setIsEditingName(false);
        } else {
            const data = await res.json();
            alert(data.error || 'Erreur lors de la mise à jour');
        }
    } catch (err) {
        alert('Erreur réseau');
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/users/${user.id}/delete`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: deletePassword })
        });
        const data = await res.json();
        if (res.ok) {
            logout();
        } else {
            alert(data.error || "Erreur lors de la suppression");
        }
    } catch (err) {
        alert("Erreur réseau");
    } finally {
        setLoading(false);
    }
  };

  const handleUpgradeRequest = async () => {
    try {
        const res = await fetch(`${API_URL}/users/${user.id}/upgrade`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(proData)
        });
        if (res.ok) {
            updateUserInfo({ ...proData, plan_status: 'PENDING' });
            
            // Redirect to WhatsApp Admin
            const adminPhone = "+22674846759"; // Replace with real admin phone
            const message = `Bonjour Admin, je souhaite activer mon plan PRO sur Grace Service.\nNom: ${user.nom} ${user.prenom}\nWhatsApp: ${user.whatsapp}\nVille: ${proData.ville}\nMontant: ${planPrice} FCFA (30 jours)`;
            window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
            
            setProModal(false);
        }
    } catch (err) {
        alert('Erreur lors de la demande');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const res = await fetch(`${API_URL}/users/${user.id}/avatar`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            updateUserInfo({ ...user, avatar: data.avatar });
        } else {
            alert(data.error || "Erreur lors de l'upload");
        }
    } catch (err) {
        alert("Erreur réseau");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
            <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-black shadow-xl shadow-primary/5 overflow-hidden border-4 border-white">
                {user?.avatar ? (
                    <img 
                        src={getImageUrl(user.avatar)} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                        onError={(e) => e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.nom}
                    />
                ) : (
                    <span>{user?.nom[0]}{user?.prenom[0]}</span>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white mb-1" size={24} />
                    <span className="text-[8px] text-white font-black uppercase tracking-tighter">Modifier</span>
                </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg ring-4 ring-white z-10">
                <User size={18} />
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
            />
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
            <div className="flex flex-col md:flex-row items-center gap-3">
                {isEditingName ? (
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <input 
                            value={editName.nom}
                            onChange={(e) => setEditName({...editName, nom: e.target.value})}
                            className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold w-32 focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <input 
                            value={editName.prenom}
                            onChange={(e) => setEditName({...editName, prenom: e.target.value})}
                            className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold w-32 focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <button onClick={handleUpdateName} className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                        <h1 className="text-3xl font-black text-gray-900 mb-1">{user?.nom} {user?.prenom}</h1>
                        <Edit size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                )}
            </div>
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
        <div className="grid grid-cols-2 gap-4">
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
                        <button 
                            onClick={() => setAddProductModal(true)}
                            className="w-full bg-white border-2 border-dashed border-gray-200 p-8 rounded-3xl text-gray-400 hover:text-primary hover:border-primary/30 transition-all flex flex-col items-center gap-3 group"
                        >
                            <Plus size={24} />
                            <span className="font-bold text-sm">Ajouter un nouveau produit</span>
                        </button>
                        {sellerStats.map(prod => (
                             <div key={prod.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group transition-all hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-100">
                                        <img 
                                            src={getImageUrl(prod.image)} 
                                            alt={prod.name} 
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                            onError={(e) => e.target.src = 'https://placehold.co/100x100?text=img'}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">{prod.name}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase">
                                            <BarChart3 size={12} />
                                            {prod.whatsapp_clicks} clics WhatsApp
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                     <button 
                                        onClick={() => {
                                            setEditProductData(prod);
                                            setProductImage(null);
                                            setEditProductModal(true);
                                        }}
                                        className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-primary transition-all"
                                     >
                                         <Edit size={16} />
                                     </button>
                                     <button 
                                        onClick={() => handleDeleteProduct(prod.id)}
                                        className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 transition-all"
                                     >
                                         <Trash2 size={16} />
                                     </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
            onClick={() => window.open('https://wa.me/22674846759?text=Bonjour, je souhaite contacter l\'administration.', '_blank')}
            className="w-full py-5 rounded-3xl border border-blue-100 bg-blue-50/50 font-bold text-sm text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-3"
        >
            <MessageCircle size={20} />
            Contacter l'administration
        </button>
        <button onClick={logout} className="w-full py-5 rounded-3xl border border-gray-100 font-bold text-sm text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
            <LogOut size={20} />
            Se déconnecter
        </button>
      </div>

      <button 
        onClick={() => setDeleteModal(true)}
        className="w-full py-5 rounded-3xl border border-red-50 text-red-400 hover:bg-red-50 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <Trash2 size={16} />
        Supprimer mon compte définitivement
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

                      <div className="space-y-4">
                        <div className="p-6 rounded-3xl border-2 border-primary bg-primary/5 text-primary text-center">
                            <div className="font-black text-xl mb-1">{planPrice} FCFA</div>
                            <div className="text-xs font-bold opacity-70 uppercase tracking-widest">Abonnement PRO (30 jours)</div>
                        </div>
                        <ul className="space-y-2 text-[11px] font-medium text-gray-500 pl-2">
                            <li className="flex items-center gap-2">✓ Publication de produits illimitée</li>
                            <li className="flex items-center gap-2">✓ Visibilité prioritaire</li>
                            <li className="flex items-center gap-2">✓ Commandes WhatsApp directes</li>
                        </ul>
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

      {/* Add Product Modal */}
      {addProductModal && (
          <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-xl rounded-[40px] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <button onClick={() => setAddProductModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">×</button>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Ajouter un Produit 📦</h2>
                  <p className="text-sm text-gray-400 mb-8">Remplissez les détails pour mettre votre produit en ligne.</p>
                  
                  <form onSubmit={handleAddProduct} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Nom du produit</label>
                                <input 
                                    required
                                    value={newProduct.name}
                                    placeholder="ex: iPhone 15 Pro Max" 
                                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all border-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Prix (FCFA)</label>
                                <input 
                                    required
                                    type="number"
                                    value={newProduct.price}
                                    placeholder="ex: 850000" 
                                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all border-none"
                                />
                            </div>
                      </div>

                      <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Catégorie</label>
                            <select 
                                value={newProduct.category}
                                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all border-none"
                            >
                                {categories.map((c, index) => <option key={index} value={c}>{c}</option>)}
                            </select>
                      </div>

                      <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Description</label>
                            <textarea 
                                required
                                value={newProduct.description}
                                placeholder="Décrivez votre produit..." 
                                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all border-none h-32 resize-none"
                            />
                      </div>

                      <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Image du produit</label>
                            <div className="relative">
                                <input 
                                    required
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProductImage(e.target.files[0])}
                                    className="hidden"
                                    id="product-image"
                                />
                                <label htmlFor="product-image" className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-all">
                                    {productImage ? (
                                        <span className="text-primary font-bold text-xs">{productImage.name}</span>
                                    ) : (
                                        <>
                                            <Plus size={24} className="text-gray-300" />
                                            <span className="text-gray-400 text-xs font-medium">Cliquez pour choisir une photo</span>
                                        </>
                                    )}
                                </label>
                            </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                      >
                        {loading ? "Chargement..." : "Ajouter le produit"}
                        <Package size={20} />
                      </button>
                  </form>
              </motion.div>
          </div>
      )}

      {/* Edit Product Modal */}
      {editProductModal && editProductData && (
          <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-xl rounded-[40px] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <button onClick={() => setEditProductModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">×</button>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Modifier le Produit ✏️</h2>
                  
                  <form onSubmit={handleUpdateProduct} className="space-y-6 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Nom du produit</label>
                                <input 
                                    required
                                    value={editProductData.name}
                                    placeholder="ex: iPhone 15 Pro Max" 
                                    onChange={(e) => setEditProductData({...editProductData, name: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all border-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Prix (FCFA)</label>
                                <input 
                                    required
                                    type="number"
                                    value={editProductData.price}
                                    placeholder="ex: 850000" 
                                    onChange={(e) => setEditProductData({...editProductData, price: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all border-none"
                                />
                            </div>
                      </div>

                      <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Catégorie</label>
                            <select 
                                value={editProductData.category}
                                onChange={(e) => setEditProductData({...editProductData, category: e.target.value})}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all border-none"
                            >
                                {categories.map((c, index) => <option key={index} value={c}>{c}</option>)}
                            </select>
                      </div>

                      <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Description</label>
                            <textarea 
                                required
                                value={editProductData.description || ''}
                                placeholder="Décrivez votre produit..." 
                                onChange={(e) => setEditProductData({...editProductData, description: e.target.value})}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all border-none h-32 resize-none"
                            />
                      </div>

                      <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Nouvelle Image (Optionnel)</label>
                            <div className="relative">
                                <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProductImage(e.target.files[0])}
                                    className="hidden"
                                    id="edit-product-image"
                                />
                                <label htmlFor="edit-product-image" className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-all relative overflow-hidden">
                                     {productImage ? (
                                        <span className="text-primary font-bold text-xs z-10">{productImage.name}</span>
                                     ) : (
                                         <>
                                            {editProductData.image && (
                                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                                    <img src={getImageUrl(editProductData.image)} alt="Current" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <span className="text-gray-400 text-xs font-medium z-10">Cliquez pour modifier la photo</span>
                                         </>
                                     )}
                                </label>
                            </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                      >
                        {loading ? "Mise à jour..." : "Enregistrer les modifications"}
                        <Edit size={20} />
                      </button>
                  </form>
              </motion.div>
          </div>
      )}

      {/* Delete Account Modal */}
      {deleteModal && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl relative">
                  <button onClick={() => setDeleteModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 font-black">×</button>
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                      <Trash2 size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Supprimer le compte ?</h2>
                  <p className="text-sm text-gray-400 mb-8 font-medium">Cette action est irréversible. Tous vos produits seront également supprimés.</p>
                  
                  <form onSubmit={handleDeleteAccount} className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Veuillez confirmer votre mot de passe</label>
                          <input 
                              required
                              type="password"
                              value={deletePassword}
                              placeholder="••••••••"
                              onChange={(e) => setDeletePassword(e.target.value)}
                              className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all border-none"
                          />
                      </div>
                      <button 
                        type="submit"
                        disabled={loading || !deletePassword}
                        className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all disabled:opacity-50"
                      >
                        {loading ? "Suppression..." : "Confirmer la suppression"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setDeleteModal(false)}
                        className="w-full py-4 text-gray-400 font-black text-sm hover:text-gray-900 transition-colors"
                      >
                        Annuler
                      </button>
                  </form>
              </motion.div>
          </div>
      )}
    </div>
  );
};

export default Profile;
