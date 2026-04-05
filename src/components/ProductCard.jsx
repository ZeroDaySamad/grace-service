import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const sellerPhone = product.seller?.phone || product.sellerPhone || "+22600000000";
  const whatsappUrl = `https://wa.me/${sellerPhone}?text=Bonjour, je suis intéressé par votre produit : ${product.name} (ID: ${product.id})`;

  const handleWhatsAppClick = async (e) => {
    e.preventDefault();
    try {
        await fetch(`http://localhost:5000/api/products/${product.id}/click`, { method: 'POST' });
    } catch (err) {
        console.error('Analytics failed', err);
    }
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative flex flex-col h-full">
      {/* Action Area top right (if needed) */}

      {/* Image Gallery Mockup */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50 shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.isFeatured && (
          <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-widest border border-white/20">
            SÉLECTION TOP
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">{product.category}</span>
                <div className="flex items-center gap-1 text-[10px] font-black text-gray-700 bg-gray-50 px-2 py-1 rounded-lg">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    {product.seller?.rating || 4.5}
                </div>
            </div>

            {/* Title */}
            <Link to={`/product/${product.id}`} className="block">
                <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-1 leading-tight">{product.name}</h3>
            </Link>

            {/* Price */}
            <div className="font-black text-lg text-primary">
                {product.price.toLocaleString('fr-FR')} <span className="text-[10px] uppercase opacity-70">FCFA</span>
            </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
             <button 
                onClick={(e) => { e.preventDefault(); addToCart(product); }}
                className="flex-1 bg-gray-900 text-white py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-95"
             >
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">Panier</span>
             </button>
             
             <button 
                onClick={handleWhatsAppClick}
                className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:scale-105 active:scale-90"
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
