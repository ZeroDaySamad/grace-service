import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import logo from '../assets/heroassets/Logo dynamique de Grace Service.png';

// Inline SVG social icons (lucide-react doesn't include social platform icons)
const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
);
const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
);
const TwitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
);

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 font-black text-2xl text-primary">
                            <img src={logo} alt="Grace Service Logo" className="w-10 h-10 object-contain shadow-lg shadow-primary/20" />
                            <span className="tracking-tight">Grace Service</span>
                        </Link>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            La première marketplace sans intermédiaires au Burkina. Achetez et vendez en toute simplicité directement via WhatsApp.
                        </p>
                        <div className="flex items-center gap-4">
                            {[FacebookIcon, InstagramIcon, TwitterIcon].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px] mb-8">Navigation</h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Accueil', path: '/#accueil' },
                                { label: 'Mon Panier', path: '/cart' },
                                { label: 'Contactez-nous', path: '/#contact' },
                                { label: 'Mon Profil', path: '/profile' },
                                { label: 'Vendre un article', path: '/profile' }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-2 group">
                                        <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px] mb-8">Support</h4>
                        <ul className="space-y-4">
                            {[
                                'Comment ça marche',
                                'Conditions d\'utilisation',
                                'Politique de confidentialité',
                                'Aide & FAQ'
                            ].map((item, i) => (
                                <li key={i}>
                                    <button className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                                        {item}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px] mb-8">Contact</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Localisation</p>
                                    <p className="text-sm font-bold text-gray-900">Ouagadougou, Burkina Faso</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp Support</p>
                                    <p className="text-sm font-bold text-gray-900">+226 74 84 67 59</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs font-bold text-gray-400">
                        © {new Date().getFullYear()} Grace Service. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Marketplace Sécurisée</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
