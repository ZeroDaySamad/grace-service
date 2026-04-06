import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronRight, LayoutGrid, List, Plus, Minus } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useLocation } from 'react-router-dom';
import Contact from './Contact';
import heroImg1 from '../assets/heroassets/img1.webp';
import heroImg2 from '../assets/heroassets/img2.jpg';
import heroImg3 from '../assets/heroassets/img3.jpg';
import logo from '../assets/heroassets/Logo dynamique de Grace Service.png';
import API_URL from '../utils/config';

const heroImages = [heroImg1, heroImg2, heroImg3];

const Home = () => {
    const [productList, setProductList] = useState([]);
    const [categoryList, setCategoryList] = useState(["Tout", "Électronique", "Mode", "Maison", "Beauté", "Accessoires", "Autres"]);
    const [selectedCategory, setSelectedCategory] = useState("Tout");
    const [searchQuery, setSearchQuery] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const [heroImageIdx, setHeroImageIdx] = useState(0);
    const [activeStep, setActiveStep] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroImageIdx(prev => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        { 
            id: 1, 
            title: "Le lancement de commande", 
            desc: "Parcourez notre catalogue et cliquez sur 'Commander'. Vous serez alors redirigé automatiquement vers WhatsApp pour finaliser votre achat de façon sécurisée directement avec le vendeur."
        },
        { 
            id: 2, 
            title: "La vente sur Grace Service", 
            desc: "Activez votre compte Vendeur PRO en un clic pour lister vos produits, afficher vos prix et recevoir directement les détails de commande des clients intéressés."
        },
        { 
            id: 3, 
            title: "Contacter l'administration", 
            desc: "Si vous rencontrez le moindre problème ou avez besoin d'aide concernant une commande ou la création d'une boutique, n'hésitez pas à nous contacter directement depuis la rubrique Contact ci-dessous pour de meilleures explications."
        }
    ];

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

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery, minPrice, maxPrice]);

    useEffect(() => {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: 12,
            category: selectedCategory,
            search: searchQuery,
            minPrice,
            maxPrice
        });

        fetch(`${API_URL}/products?${queryParams}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.products) {
                    setProductList(data.products);
                    setPagination(data.pagination);
                } else {
                    setProductList([]);
                }
            })
            .catch(err => {
                console.log('API not available');
                setProductList([]);
            })
            .finally(() => setIsLoading(false));

        // Categories fetch only once (or could be moved but Tout is always there)
        if (categoryList.length <= 7) {
            fetch(`${API_URL}/categories`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        setCategoryList(data.includes("Tout") ? data : ["Tout", ...data]);
                    }
                })
                .catch(err => console.log('API not available for categories'));
        }
    }, [currentPage, selectedCategory, searchQuery, minPrice, maxPrice]);

    const filteredProducts = productList; // Now filtered on server side

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

    const getImageUrl = (img) => {
        if (!img) return 'https://placehold.co/600x600?text=Image+Indisponible';
        if (img.startsWith('http')) return img;
        return `${API_URL.replace('/api', '')}${img}`;
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-12">
            {/* Hero Slider Mockup */}
            <div id="accueil" className="relative flex items-center min-h-[300px] md:min-h-[450px] py-12 md:py-16 bg-primary-dark rounded-[40px] overflow-hidden shadow-2xl shadow-primary/10 mx-1 md:mx-0 transition-all duration-500">
                {/* Background Pattern/Imgs */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 pointer-events-none" />
                <AnimatePresence>
                    <motion.img 
                        key={heroImageIdx}
                        src={heroImages[heroImageIdx]}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        alt="Slider BG" 
                        className="absolute right-0 top-0 h-full w-[60%] object-cover hidden lg:block"
                        style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-primary-dark via-primary-dark/80 to-transparent z-10" />

                <div className="relative z-20 px-8 py-4 md:p-16 flex flex-col justify-center items-center text-center md:items-start md:text-left w-full md:max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex md:hidden items-center gap-2 font-bold text-2xl text-white mb-6"
                    >
                        <img src={logo} alt="Grace Service Logo" className="w-10 h-10 object-contain shadow-lg" />
                        <span className="tracking-tight">Grace Service</span>
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
                            className="bg-primary text-primary-dark px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:bg-white hover:scale-105 active:scale-95 transition-all w-fit"
                         >
                            Découvrir
                         </button>
                    </div>
                </div>
            </div>

            {/* How it works Section */}
            <div className="max-w-4xl mx-auto px-4 md:px-0 pt-8 md:pt-12 pb-8">
                <h2 className="text-3xl font-black text-blue-900 text-center mb-10 tracking-tight">Comment ça fonctionne ?</h2>
                <div className="space-y-4">
                    {steps.map((step) => (
                        <div key={step.id} className="bg-[#f8fbff] rounded-2xl border border-[#e2e8f0]/40 overflow-hidden transition-all duration-300 shadow-sm cursor-pointer">
                            <div 
                                className="p-4 md:p-5 flex items-center justify-between hover:bg-white"
                                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg shrink-0">
                                        {step.id}
                                    </div>
                                    <h3 className="font-bold text-[#1D3557] md:text-lg">{step.title}</h3>
                                </div>
                                <div className="text-blue-600 px-2 shrink-0">
                                    {activeStep === step.id ? <Minus strokeWidth={2.5} size={22} /> : <Plus strokeWidth={2.5} size={22} />}
                                </div>
                            </div>
                            <AnimatePresence>
                                {activeStep === step.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-5 md:pl-[80px] md:pr-10 pb-6 text-sm text-[#5C6D85] font-medium overflow-hidden leading-relaxed cursor-default"
                                    >
                                        {step.desc}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
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
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-categories w-full pb-3 md:pb-2 px-1 pt-1">
                    <button 
                        onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                        className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-black transition-all hover:shadow-md active:scale-95 uppercase tracking-widest shrink-0 ${
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
                            className={`cursor-pointer px-5 py-2.5 rounded-full text-xs md:text-sm font-black uppercase tracking-widest shrink-0 transition-all ${
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
                        className="w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-6 absolute top-[100%] left-0 z-50 mt-2 space-y-4 cursor-default"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catégorie</label>
                                <select 
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                                >
                                    {categoryList.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
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
                                    onClick={() => { setMinPrice(""); setMaxPrice(""); setSelectedCategory("Tout"); }}
                                    className="cursor-pointer px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                                >
                                    Réinitialiser
                                </button>
                                <button 
                                    onClick={() => setIsFilterExpanded(false)}
                                    className="cursor-pointer flex-1 md:flex-none px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Appliquer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Products Grid Sections */}
            <div id="products-section" className="space-y-8 px-1 md:px-0 pt-8 scroll-mt-24 md:scroll-mt-40">
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
            
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="pt-12 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={currentPage === 1 || isLoading}
                            onClick={() => {
                                setCurrentPage(prev => Math.max(1, prev - 1));
                                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-white border border-gray-100 text-gray-900 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Précédent
                        </button>
                        
                        <div className="flex items-center gap-1 mx-2">
                            {[...Array(pagination.totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                // Basic logic to show limited page numbers if there are many
                                if (
                                    pagination.totalPages <= 7 || 
                                    pageNum === 1 || 
                                    pageNum === pagination.totalPages || 
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button 
                                            key={pageNum}
                                            onClick={() => {
                                                setCurrentPage(pageNum);
                                                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                                                currentPage === pageNum 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                                : 'bg-white border border-gray-100 text-gray-500 hover:border-primary/50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (
                                    (pageNum === currentPage - 2 && pageNum > 1) || 
                                    (pageNum === currentPage + 2 && pageNum < pagination.totalPages)
                                ) {
                                    return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button 
                            disabled={currentPage === pagination.totalPages || isLoading}
                            onClick={() => {
                                setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1));
                                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Suivant
                        </button>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Page {currentPage} sur {pagination.totalPages} • Total {pagination.total} produits
                    </p>
                </div>
            )}

            {/* Contact Section */}
            <div id="contact" className="pt-16 pb-12 scroll-mt-20">
                <Contact />
            </div>
        </div>
    );
};

export default Home;
