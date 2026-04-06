import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Heart, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import API_URL from '../utils/config';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const sellerPhone = product.seller?.phone || product.sellerPhone || "22600000000";
  let phone = sellerPhone.replace(/\D/g, '');
  if (phone.length === 8) phone = '226' + phone;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent('Bonjour, je suis intéressé par votre produit : ' + product.name + ' (ID: ' + product.id + ')')}`;

  const handleWhatsAppClick = async (e) => {
    e.preventDefault();
    try {
        await fetch(`${API_URL}/products/${product.id}/click`, { method: 'POST' });
    } catch (err) {
        console.error('Analytics failed', err);
    }
    window.open(whatsappUrl, '_blank');
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/400x400?text=Indisponible';
    if (img.startsWith('http')) return img;
    return `${API_URL.replace('/api', '')}${img}`;
  };

  return (
    <div onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative flex flex-col h-full">
      {/* Action Area top right (if needed) */}

      {/* Image Gallery Mockup */}
      <div className="block relative aspect-square overflow-hidden bg-gray-50 shrink-0">
        <img 
          src={getImageUrl(product.image)} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => e.target.src = 'https://placehold.co/400x400?text=Indisponible'}
        />
        {product.isFeatured && (
          <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-widest border border-white/20">
            SÉLECTION TOP
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
            {/* Category, Rating & City */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">{product.category}</span>
                    <div className="flex items-center gap-1 text-[10px] font-black text-gray-700 bg-gray-50 px-2 py-1 rounded-lg">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        {product.seller?.rating || 4.5}
                    </div>
                </div>
                {product.ville && product.ville !== 'NULL' && product.ville !== 'null' && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                        {product.ville}
                    </div>
                )}
            </div>

            {/* Title */}
            <div className="block">
                <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-1 leading-tight">{product.name}</h3>
            </div>

            {/* Price */}
            <div className="font-black text-lg text-primary">
                {product.price.toLocaleString('fr-FR')} <span className="text-[10px] uppercase opacity-70">FCFA</span>
            </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
             <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                className="cursor-pointer flex-1 bg-gray-900 text-white py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-95"
             >
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">Panier</span>
             </button>
             
             <button 
                onClick={(e) => { e.stopPropagation(); handleWhatsAppClick(e); }}
                className="cursor-pointer w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:scale-105 active:scale-90"
                title="Commander via WhatsApp"
             >
                <MessageCircle size={22} />
             </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
