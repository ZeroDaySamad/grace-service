import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, ShoppingCart, Star, ShieldCheck, Clock, UserCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import API_URL from '../utils/config';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setProduct(data);
        } else {
          setProduct(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-bold">Chargement du produit...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <h1 className="text-2xl font-bold">Produit non trouvé</h1>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-8 py-3 rounded-full font-bold">Retour à l'accueil</button>
      </div>
    );
  }

  const sellerPhone = product.sellerPhone || (product.seller && product.seller.phone) || "22600000000";
  const sellerName = product.sellerName || (product.seller && product.seller.name) || "Vendeur";
  const sellerAvatar = product.sellerAvatar || (product.seller && product.seller.avatar) || "https://api.dicebear.com/7.x/avataaars/svg?seed=seller";

  let phone = sellerPhone.replace(/\D/g, '');
  if (phone.length === 8) phone = '226' + phone;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent('Bonjour, je suis intéressé par votre produit : ' + product.name + ' (ID: ' + product.id + ')')}`;

  const getImageUrl = (img) => {
      if (!img) return 'https://placehold.co/600x600?text=Image+Indisponible';
      if (img.startsWith('http')) return img;
      return `${API_URL.replace('/api', '')}${img}`;
  };

  const handleWhatsAppOrder = async (e) => {
      e.preventDefault();
      try {
          await fetch(`${API_URL}/products/${product.id}/click`, { method: 'POST' });
      } catch (err) {
          console.error('Analytics failed', err);
      }
      window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="animate-in slide-in-from-right duration-500 max-w-5xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')} 
        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-primary font-bold text-sm transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <ArrowLeft size={18} />
        </div>
        Boutique
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Images Column */}
        <div className="space-y-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative group"
            >
                <img 
                    src={getImageUrl(product.image)} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    onError={(e) => e.target.src = 'https://placehold.co/600x600?text=Image+Indisponible'}
                />
                
                {/* Image controls mockup */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    <div className="w-10 h-2 bg-primary rounded-full shadow-lg" />
                    <div className="w-2 h-2 bg-white/50 rounded-full" />
                    <div className="w-2 h-2 bg-white/50 rounded-full" />
                </div>
            </motion.div>
            
            {/* Gallery Mockup */}
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all grayscale hover:grayscale-0">
                        <img 
                            src={getImageUrl(product.image)} 
                            alt="Thumb" 
                            className="w-full h-full object-cover" 
                            onError={(e) => e.target.src = 'https://placehold.co/100x100?text=img'}
                        />
                    </div>
                ))}
            </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                    {product.category}
                </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>
            
            <div className="text-3xl font-black text-primary mb-8">
                {product.price.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-6 shadow-sm mb-8">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Description</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
                
                {/* Condition and Delivery removed as requested */}
            </div>

            {/* Seller Section */}
            <div className="bg-gray-100/50 rounded-3xl p-6 mb-8 border border-white flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img 
                            src={getImageUrl(sellerAvatar)} 
                            alt={sellerName} 
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white" 
                            onError={(e) => e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'}
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-white">
                            <UserCheck size={10} />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Vendeur vérifié</span>
                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{sellerName}</h4>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            {product.seller?.rating || 4.8} / 5.0
                        </div>
                    </div>
                </div>
                <Link to={`/seller/${product.sellerId}`} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-primary shadow-sm hover:shadow-md transition-all">
                    <ChevronRight size={20} />
                </Link>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button 
                    onClick={() => addToCart(product)}
                    className="cursor-pointer flex-1 bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
                >
                    <ShoppingCart size={20} />
                    Ajouter au Panier
                </button>
                <button 
                    onClick={handleWhatsAppOrder}
                    className="cursor-pointer flex-1 bg-primary text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <MessageCircle size={20} />
                    Contacter le vendeur
                </button>
            </div>
            
            {/* Safety hint */}
            <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-600 shrink-0 mt-1">
                    <ShieldCheck size={16} />
                 </div>
                 <div className="flex flex-col">
                    <span className="font-bold text-yellow-800 text-xs">Conseil de sécurité</span>
                    <p className="text-[10px] text-yellow-700/80 leading-snug">Ne payez jamais à l'avance. Rencontrez le vendeur dans un lieu public pour vérifier le produit.</p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// ChevronRight removed from here as it's imported now

export default ProductDetail;
