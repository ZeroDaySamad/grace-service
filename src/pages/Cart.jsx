import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, MessageCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  const handleWhatsAppOrder = () => {
    const itemsList = cartItems.map(item => `- ${item.quantity}x ${item.name} (${item.price.toLocaleString()} FCFA)`).join('\n');
    const message = `Bonjour, je souhaite commander les articles suivants :\n\n${itemsList}\n\n*Total : ${totalPrice.toLocaleString()} FCFA*`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/+22670000000?text=${encodedMessage}`, '_blank');
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
            <ShoppingBag size={40} />
        </div>
        <div className="text-center">
            <h1 className="text-xl font-black text-gray-900 mb-2">Votre panier est vide</h1>
            <p className="text-gray-400 text-sm">Il semble que vous n'avez pas encore fait votre choix.</p>
        </div>
        <Link to="/" className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            Commencer mes achats
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">Mon Panier</h1>
        <button onClick={clearCart} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors">
            Vider le panier
        </button>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-sm group">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs md:text-sm text-gray-900 truncate mb-0.5">{item.name}</h3>
                    <div className="text-primary font-black text-sm">
                        {item.price.toLocaleString()} <span className="text-[10px]">FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Quantity + Delete - Moves below on small mobile */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                  <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-gray-500 hover:text-primary shadow-sm active:scale-90 transition-all"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-gray-500 hover:text-primary shadow-sm active:scale-90 transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
            <h3 className="font-black text-gray-900 mb-4 uppercase text-[10px] tracking-widest">Résumé</h3>
            
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Sous-total</span>
                    <span className="font-bold text-gray-900">{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Livraison</span>
                    <span className="text-green-500 font-bold italic text-xs">Calculé par le vendeur</span>
                </div>
                <div className="h-px bg-gray-100 w-full" />
                <div className="flex justify-between items-end">
                    <span className="text-gray-900 font-black text-sm">Total</span>
                    <div className="text-xl font-black text-primary">{totalPrice.toLocaleString()} <span className="text-xs">FCFA</span></div>
                </div>
            </div>

            <button 
                onClick={handleWhatsAppOrder}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 group"
            >
                <MessageCircle size={18} />
                Commander sur WhatsApp
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="mt-3 text-[10px] text-gray-400 text-center leading-relaxed font-medium">
                En cliquant sur commander, vous serez redirigé vers WhatsApp pour finaliser la transaction avec le vendeur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
