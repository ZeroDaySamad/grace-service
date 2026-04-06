import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock submission
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-primary/10">
                    <MessageCircle size={14} />
                    Besoin d'aide ?
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">Nous sommes à votre <span className="text-primary">écoute</span>.</h1>
                <p className="text-gray-400 text-lg font-medium">Une question, un partenariat ou un problème technique ? Notre équipe vous répond sous 24h.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Contact Info Cards */}
                <div className="lg:col-span-5 space-y-6">
                    {[
                        { icon: Phone, title: 'Téléphone / WhatsApp', detail: '+226 74 84 67 59', color: 'emerald' }
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-xl shadow-gray-100 flex items-center gap-6 group hover:border-primary/20 transition-all"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-${item.color === 'primary' ? 'primary' : item.color + '-50'} text-${item.color === 'primary' ? 'white' : item.color + '-500'} flex items-center justify-center shrink-0 shadow-lg shadow-${item.color}/10 group-hover:scale-110 transition-transform`}>
                                <item.icon size={24} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.title}</p>
                                <p className="text-sm md:text-base font-black text-gray-900">{item.detail}</p>
                            </div>
                        </motion.div>
                    ))}

                    <div className="bg-primary-dark rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-xl font-black">Support Prioritaire</h3>
                            <p className="text-primary-light/70 text-sm font-medium">Vous êtes un vendeur PRO ? Contactez l'administrateur directement via votre tableau de bord pour une assistance en moins d'une heure.</p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-7">
                    <div className="bg-white p-8 md:p-12 rounded-[48px] border border-gray-100 shadow-2xl shadow-gray-200/50">
                        {submitted ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-20 gap-6">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center">
                                    <ShieldCheck size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900">Message reçu !</h3>
                                    <p className="text-gray-400 font-medium whitespace-pre-wrap">Merci de nous avoir contacté. Nous reviendrons vers vous très prochainement.</p>
                                </div>
                                <button onClick={() => setSubmitted(false)} className="text-primary font-black text-xs uppercase tracking-widest hover:underline">Envoyer un autre message</button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Votre Nom Complet</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="ex: Jean Dupont"
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email de contact</label>
                                        <input 
                                            required
                                            type="email" 
                                            placeholder="ex: jean@email.com"
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Objet</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Comment pouvons-nous vous aider ?"
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Message</label>
                                    <textarea 
                                        required
                                        rows="5"
                                        placeholder="Tapez votre message ici..."
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Envoyer le message
                                    <Send size={18} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
