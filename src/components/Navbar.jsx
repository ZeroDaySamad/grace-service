import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, User, PlusCircle, LogIn, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">WP</div>
                    <span>WhatsPlace</span>
                </NavLink>
                
                <div className="flex items-center gap-8">
                    <NavLink to="/" className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
                        <Home size={20} />
                        Accueil
                    </NavLink>
                    <NavLink to="/cart" className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
                        <ShoppingCart size={20} />
                        Panier
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
                        {isAuthenticated ? <User size={20} /> : <LogIn size={20} />}
                        {isAuthenticated ? (user.prenom || 'Mon Profil') : 'Connexion'}
                    </NavLink>
                </div>

                <div className="flex items-center gap-4">
                     <NavLink to="/profile" className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-primary-dark transition-all">
                        <PlusCircle size={18} />
                        Vendre
                     </NavLink>
                </div>
            </nav>

            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-40 flex md:hidden items-center justify-around px-4 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
                <button 
                    onClick={handleSearchClick}
                    className="flex-1 flex flex-col items-center gap-1 text-gray-400"
                >
                    <Search size={20} />
                    <span className="text-[10px] font-bold">Recherche</span>
                </button>

                <NavLink to="/" className={({ isActive }) => `flex-1 flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <Home size={20} />
                    <span className="text-[10px] font-bold">Accueil</span>
                </NavLink>

                <div className="relative -top-6 px-2">
                    <NavLink to="/profile" className="w-14 h-14 bg-primary rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-primary/30 ring-4 ring-white">
                        <PlusCircle size={32} strokeWidth={2.5} />
                    </NavLink>
                </div>

                <NavLink to="/cart" className={({ isActive }) => `flex-1 flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <ShoppingCart size={20} />
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
