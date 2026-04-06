import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, MessageCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_URL from '../utils/config';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  const handleWhatsAppOrder = () => {
    const itemsList = cartItems.map(item => `- ${item.quantity}x ${item.name} (${item.price.toLocaleString()} FCFA)`).join('\n');
    const message = `Bonjour, je souhaite commander les articles suivants :\n\n${itemsList}\n\n*Total : ${totalPrice.toLocaleString()} FCFA*`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/+22670000000?text=${encodedMessage}`, '_blank');
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/200x200?text=img';
    if (img.startsWith('http')) return img;
    return `${API_URL.replace('/api', '')}${img}`;
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

      <div className="max-w-2xl mx-auto space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm group animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 mb-1">{item.name}</h3>
                  <div className="text-primary font-black text-base">
                      {item.price.toLocaleString()} <span className="text-[10px] uppercase opacity-70">FCFA</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {/* Quantity */}
                  <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 hover:text-primary shadow-sm hover:shadow-md transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 hover:text-primary shadow-sm hover:shadow-md transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Individual Order Button */}
            <button 
                onClick={async () => {
                    // The product id — use productId for DB cart, id for guest cart
                    const productId = item.productId || item.id;
                    // 1. Track the click in the backend (increments whatsapp_clicks)
                    try {
                        await fetch(`${API_URL}/products/${productId}/click`, { method: 'POST' });
                    } catch (err) {
                        console.error('Click tracking failed', err);
                    }
                    // 2. Open WhatsApp with the vendor's number
                    let phone = item.sellerPhone ? item.sellerPhone.replace(/\D/g, '') : '';
                    if (phone.length === 8) phone = '226' + phone;
                    if (!phone) phone = '22600000000';
                    const message = `Bonjour, je souhaite commander : ${item.quantity}x ${item.name} (${item.price.toLocaleString()} FCFA)`;
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                    // 3. Remove from cart
                    removeFromCart(item.id);
                }}
                className="mt-4 w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
                <MessageCircle size={18} />
                Commander cet article
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cart;
