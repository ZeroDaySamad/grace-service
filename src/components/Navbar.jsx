import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, User, PlusCircle, LogIn, Search, LayoutGrid, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/heroassets/Logo dynamique de Grace Service.png';

const Navbar = () => {
    const { user, isAuthenticated } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const handleSearchClick = () => {
        if (location.pathname === '/') {
            const container = document.getElementById('search-container');
            const searchInput = container?.querySelector('input');
            if (searchInput) {
                container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => searchInput.focus(), 500);
            }
        } else {
            navigate('/?focusSearch=true');
        }
    };

    return (
        <>
            {/* Desktop Navbar (Top) */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 hidden md:flex items-center justify-between px-8">
                <NavLink to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <img src={logo} alt="Grace Service Logo" className="w-10 h-10 object-contain" />
                    <span className="tracking-tight">Grace Service</span>
                </NavLink>
                
                <div className="flex items-center gap-8">
                    <NavLink to="/#accueil" className="flex items-center gap-2 text-sm font-medium transition-colors text-gray-500 hover:text-primary">
                        <Home size={20} />
                        Accueil
                    </NavLink>
                    <NavLink to="/#products-section" className="flex items-center gap-2 text-sm font-medium transition-colors text-gray-500 hover:text-primary">
                        <LayoutGrid size={20} />
                        Produits
                    </NavLink>
                    <NavLink to="/#contact" className="flex items-center gap-2 text-sm font-medium transition-colors text-gray-500 hover:text-primary">
                        <MessageCircle size={20} />
                        Contact
                    </NavLink>
                    <NavLink to="/cart" className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
                        <div className="relative">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">{cartCount}</span>}
                        </div>
                        Panier
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
                        {isAuthenticated ? <User size={20} /> : <LogIn size={20} />}
                        {isAuthenticated ? (user.prenom || 'Mon Profil') : 'Connexion'}
                    </NavLink>
                </div>

                <div className="flex items-center gap-4">
                     <NavLink to="/profile?action=add-product" className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-primary-dark transition-all">
                        <PlusCircle size={18} />
                        Vendre
                     </NavLink>
                </div>
            </nav>

            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-40 flex md:hidden items-center justify-around px-4 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
                <NavLink to="/#accueil" className="flex-1 flex flex-col items-center gap-1 transition-all text-gray-400 hover:text-primary">
                    <Home size={20} />
                    <span className="text-[10px] font-bold">Accueil</span>
                </NavLink>

                <NavLink to="/#products-section" className="flex-1 flex flex-col items-center gap-1 transition-all text-gray-400 hover:text-primary">
                    <LayoutGrid size={20} />
                    <span className="text-[10px] font-bold">Produits</span>
                </NavLink>

                <div className="relative -top-6 px-2">
                    <NavLink to="/profile?action=add-product" className="w-14 h-14 bg-primary rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-primary/30 ring-4 ring-white">
                        <PlusCircle size={32} strokeWidth={2.5} />
                    </NavLink>
                </div>

                <NavLink to="/cart" className={({ isActive }) => `flex-1 flex flex-col items-center gap-1 transition-all relative ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <div className="relative">
                        <ShoppingCart size={20} />
                        {cartCount > 0 && <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{cartCount}</span>}
                    </div>
                    <span className="text-[10px] font-bold">Panier</span>
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => `flex-1 flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    {isAuthenticated ? <User size={20} /> : <LogIn size={20} />}
                    <span className="text-[10px] font-bold">{isAuthenticated ? 'Profil' : 'Connect'}</span>
                </NavLink>
            </nav>
        </>
    );
};

export default Navbar;
