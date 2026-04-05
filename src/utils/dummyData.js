export const products = [
  {
    id: 1,
    name: "iPhone 15 Pro Max - 256GB",
    price: 950000,
    category: "Électronique",
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop",
    description: "iPhone 15 Pro Max neuf, scellé. Couleur Titane Naturel. Garantie Apple 1 an.",
    seller: {
      name: "Abdoulaye Koné",
      phone: "+22670000001",
      avatar: "https://i.pravatar.cc/150?u=abdou",
      rating: 4.8
    },
    isFeatured: true
  },
  {
    id: 2,
    name: "MacBook Air M2 13-inch",
    price: 1550000,
    category: "Électronique",
    image: "https://images.unsplash.com/photo-1611186871348-b1ec696e520b?q=80&w=800&auto=format&fit=crop",
    description: "MacBook Air M2, 8GB RAM, 256GB SSD. État comme neuf, utilisé 3 mois.",
    seller: {
      name: "Saliou Diop",
      phone: "+22670000002",
      avatar: "https://i.pravatar.cc/150?u=saliou",
      rating: 4.5
    },
    isFeatured: true
  },
  {
    id: 3,
    name: "Nike Air Max 270",
    price: 45000,
    category: "Mode",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
    description: "Chaussures Nike Originales. Pointures disponibles : 40, 41, 42, 43.",
    seller: {
      name: "Fatim Keita",
      phone: "+22670000003",
      avatar: "https://i.pravatar.cc/150?u=fatim",
      rating: 4.9
    },
    isFeatured: false
  },
  {
    id: 4,
    name: "Montre Connectée Samsung Galaxy Watch 6",
    price: 135000,
    category: "Accessoires",
    image: "https://images.unsplash.com/photo-1508685096489-7abac8f9ba39?q=80&w=800&auto=format&fit=crop",
    description: "Galaxy Watch 6 neuve. Suivi santé complet, autonomie 40h.",
    seller: {
      name: "Moussa Traoré",
      phone: "+22670000004",
      avatar: "https://i.pravatar.cc/150?u=moussa",
      rating: 4.2
    },
    isFeatured: false
  },
  {
    id: 5,
    name: "Ensemble Canapé Moderne 5 Places",
    price: 450000,
    category: "Maison",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop",
    description: "Canapé en velours gris top qualité. Livraison gratuite à Ouagadougou.",
    seller: {
      name: "Oumar Sawadogo",
      phone: "+22670000005",
      avatar: "https://i.pravatar.cc/150?u=oumar",
      rating: 4.7
    },
    isFeatured: true
  }
];

export const categories = [
  "Tout", "Électronique", "Mode", "Maison", "Beauté", "Accessoires"
];
