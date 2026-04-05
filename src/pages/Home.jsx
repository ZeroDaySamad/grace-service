import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { products as dummyProducts } from '../utils/dummyData';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

const Home = () => {
    const [productList, setProductList] = useState(dummyProducts);
    const [categoryList, setCategoryList] = useState(["Tout", "Électronique", "Mode", "Maison", "Beauté", "Accessoires", "Autres"]);
    const [selectedCategory, setSelectedCategory] = useState("Tout");
    const [searchQuery, setSearchQuery] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('focusSearch')) {
            const container = document.getElementById('search-container');
            const searchInput = container?.querySelector('input');
            if (searchInput) {
                container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => searchInput.focus(), 500);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) setProductList(data);
            })
            .catch(err => console.log('API not available, using dummy data'));

        fetch('http://localhost:5000/api/categories')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setCategoryList(data.includes("Tout") ? data : ["Tout", ...data]);
                }
            })
            .catch(err => console.log('API not available for categories'));
    }, []);

    const filteredProducts = productList.filter(product => {
        const matchesCategory = selectedCategory === "Tout" || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = (minPrice === "" || product.price >= Number(minPrice)) &&
                             (maxPrice === "" || product.price <= Number(maxPrice));
        return matchesCategory && matchesSearch && matchesPrice;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-12">
            {/* Hero Slider Mockup */}
            <div className="relative flex items-center min-h-[300px] md:min-h-[450px] py-12 md:py-16 bg-primary-dark rounded-[40px] overflow-hidden shadow-2xl shadow-primary/10 mx-1 md:mx-0 transition-all duration-500">
                {/* Background Pattern/Imgs */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 pointer-events-none" />
                <img 
                    src="https://images.unsplash.com/photo-1546768292-fb12f6c92568?q=80&w=1200&auto=format&fit=crop" 
                    alt="Slider BG" 
                    className="absolute right-0 top-0 h-full w-[60%] object-cover hidden lg:block"
                    style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-primary-dark via-primary-dark/80 to-transparent z-10" />

                <div className="relative z-20 px-8 py-4 md:p-16 flex flex-col justify-center items-center text-center md:items-start md:text-left w-full md:max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex md:hidden items-center gap-2 font-bold text-2xl text-white mb-6"
                    >
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">WP</div>
                        <span className="tracking-tight">WhatsPlace</span>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/10 backdrop-blur-xl self-center md:self-start px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black text-primary-light mb-6 flex items-center gap-2 border border-white/10"
                    >
                        <span className="w-2 h-2 bg-primary-light rounded-full animate-pulse shadow-[0_0_10px_#25D366]" />
                        NOUVEAUTÉ EXCLUSIVE
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6"
                    >
                        Le futur de la <span className="text-primary-light">marketplace</span> est ici.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-primary-light/70 text-sm md:text-xl mb-8 line-clamp-2 md:line-clamp-none font-medium max-w-md mx-auto md:mx-0"
                    >
                        Achetez et vendez sans intermédiaires. Simplicité, sécurité et rapidité directement via WhatsApp.
                    </motion.p>
                    <div className="flex gap-4 justify-center md:justify-start">
                         <button 
                            onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-primary text-primary-dark px-8 py-4 rounded-3xl text-sm font-black shadow-xl shadow-primary/20 hover:bg-white hover:scale-105 active:scale-95 transition-all w-fit"
                         >
                            Découvrir
                         </button>
                    </div>
                </div>
            </div>

            <div className="sticky top-0 md:top-16 z-40 bg-gray-50/95 backdrop-blur-xl py-4 -mx-4 px-4 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-100 transition-all shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
                <div id="search-container" className="relative w-full md:max-w-md group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Rechercher un produit..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[28px] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm group-hover:shadow-md"
                    />
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 md:pb-0 px-1 py-1">
                    <button 
                        onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-black transition-all hover:shadow-md active:scale-95 uppercase tracking-widest shrink-0 ${
                            isFilterExpanded || minPrice || maxPrice 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-white border border-gray-100 text-gray-700 shadow-sm hover:border-primary'
                        }`}
                    >
                        <SlidersHorizontal size={16} />
                        Filtres {(minPrice || maxPrice) && "•"}
                    </button>
                    <div className="h-6 w-[1px] bg-gray-200 mx-1 shrink-0 hidden md:block" />
                    {categoryList.map((cat) => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-black uppercase tracking-widest shrink-0 transition-all ${
                                selectedCategory === cat 
                                ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105' 
                                : 'bg-white border border-gray-100 text-gray-500 hover:border-primary/50 hover:text-gray-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Price Filter Dropdown */}
                {isFilterExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-6 absolute top-[100%] left-0 z-50 mt-2 space-y-4"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix Minimum (FCFA)</label>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix Maximum (FCFA)</label>
                                <input 
                                    type="number" 
                                    placeholder="Libre"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto self-end">
                                <button 
                                    onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                                    className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                                >
                                    Réinitialiser
                                </button>
                                <button 
                                    onClick={() => setIsFilterExpanded(false)}
                                    className="flex-1 md:flex-none px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Appliquer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Products Grid Sections */}
            <div id="products-section" className="space-y-8 px-1 md:px-0 pt-4 scroll-mt-24 md:scroll-mt-40">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Produits Populaires</h2>
                        <span className="text-[10px] md:text-sm text-gray-400 font-bold uppercase tracking-widest opacity-60">Les meilleures offres sélectionnées pour vous</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-200/40 p-1.5 rounded-2xl">
                         <button className="p-2 rounded-xl bg-white shadow-sm text-primary transition-all"><LayoutGrid size={20} /></button>
                         <button className="p-2 rounded-xl text-gray-400 hover:bg-white hover:shadow-sm transition-all"><List size={20} /></button>
                    </div>
                </div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8"
                >
                    {filteredProducts.map((product) => (
                        <motion.div variants={itemVariants} key={product.id}>
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                    
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center text-gray-400 gap-6">
                            <div className="w-24 h-24 bg-gray-100 rounded-[40px] flex items-center justify-center text-gray-200">
                                <Search size={48} />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="font-black text-gray-900 text-lg">Aucun produit trouvé</p>
                                <p className="text-sm font-bold opacity-60">Essayez d'ajuster vos critères de recherche</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
            
            {/* View More Link (Footer of the grid) */}
            {filteredProducts.length > 0 && (
                <div className="pt-8 flex justify-center">
                    <button className="flex items-center gap-3 text-gray-400 hover:text-primary font-black text-xs uppercase tracking-widest transition-all py-6 px-12 rounded-full hover:bg-primary/5 active:scale-95">
                        Afficher plus
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
