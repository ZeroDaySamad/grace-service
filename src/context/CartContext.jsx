import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const API_URL = 'http://localhost:5000/api';

  // Load from LocalStorage or DB
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        try {
          const res = await fetch(`${API_URL}/cart/${user.id}`);
          const data = await res.json();
          if (data && Array.isArray(data)) setCartItems(data);
        } catch (err) {
          console.error('Failed to fetch from DB', err);
        }
      } else {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) setCartItems(JSON.parse(savedCart));
      }
    };
    fetchCart();
  }, [user, isAuthenticated]);

  // Handle Syncing when guest logs in
  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated && cartItems.length > 0) {
        // Simple heuristic: if we have items in memory and just logged in, sync them
        try {
          await fetch(`${API_URL}/cart/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, items: cartItems })
          });
          // After sync, get fresh from DB
          const res = await fetch(`${API_URL}/cart/${user.id}`);
          const data = await res.json();
          setCartItems(data);
          localStorage.removeItem('cart');
        } catch (err) {
          console.error('Failed to sync cart', err);
        }
      }
    };
    syncCart();
  }, [isAuthenticated]);

  const addToCart = async (product) => {
    if (isAuthenticated) {
      try {
        await fetch(`${API_URL}/cart/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId: product.id, quantity: 1 })
        });
        // Refetch fresh state
        const res = await fetch(`${API_URL}/cart/${user.id}`);
        const data = await res.json();
        setCartItems(data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        const newCart = existing 
          ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
          : [...prev, { ...product, quantity: 1 }];
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const removeFromCart = async (id) => {
    if (isAuthenticated) {
      // In a real app, delete from DB. For now, backend sync will handle it.
      setCartItems(prev => prev.filter(item => item.productId !== id));
    } else {
      setCartItems(prev => {
        const newCart = prev.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const updateQuantity = (id, delta) => {
    // Optimistic UI for now
    setCartItems(prev => prev.map(item => {
      const matchId = isAuthenticated ? item.productId : item.id;
      if (matchId === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    if (!isAuthenticated) localStorage.removeItem('cart');
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
