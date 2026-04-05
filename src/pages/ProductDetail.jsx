import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, ShoppingCart, Star, ShieldCheck, Truck, Clock, UserCheck } from 'lucide-react';
import { products } from '../utils/dummyData';
import { motion } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <h1 className="text-2xl font-bold">Produit non trouvé</h1>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-8 py-3 rounded-full font-bold">Retour à l'accueil</button>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${product.seller.phone}?text=Bonjour, je suis intéressé par votre produit : ${product.name} (ID: ${product.id})`;

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
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                
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
                        <img src={product.image} alt="Thumb" className="w-full h-full object-cover" />
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
                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400">Vues</span>
                        <span className="text-sm font-black text-gray-900">1.2k+</span>
                    </div>
                </div>
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
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-500 uppercase">État</span>
                            <span className="text-xs font-bold text-gray-900">Neuf</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                            <Clock size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-orange-500 uppercase">Livraison</span>
                            <span className="text-xs font-bold text-gray-900">24H Chrono</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seller Section */}
            <div className="bg-gray-100/50 rounded-3xl p-6 mb-8 border border-white flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img src={product.seller.avatar} alt={product.seller.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-white">
                            <UserCheck size={10} />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Vendeur vérifié</span>
                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{product.seller.name}</h4>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            {product.seller.rating} / 5.0
                        </div>
                    </div>
                </div>
                <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-primary shadow-sm hover:shadow-md transition-all">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button className="flex-1 bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                    <ShoppingCart size={20} />
                    Ajouter au Panier
                </button>
                <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 bg-primary text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                    <MessageCircle size={20} />
                    Commander (WhatsApp)
                </a>
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

const ChevronRight = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

export default ProductDetail;
