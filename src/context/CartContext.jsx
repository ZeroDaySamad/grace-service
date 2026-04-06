import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import API_URL from '../utils/config';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);

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
    // Find the cart item ID if we only passed product ID
    const itemToRemove = cartItems.find(item => item.id === id || item.productId === id);
    if (!itemToRemove) return;

    if (isAuthenticated) {
      setCartItems(prev => prev.filter(item => item.id !== itemToRemove.id));
      try {
        await fetch(`${API_URL}/cart/item/${itemToRemove.id}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
    } else {
      setCartItems(prev => {
        const newCart = prev.filter(item => item.id !== id && item.productId !== id);
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const updateQuantity = async (id, delta) => {
    const itemToUpdate = cartItems.find(item => item.id === id || item.productId === id);
    if (!itemToUpdate) return;
    
    const newQuantity = Math.max(1, itemToUpdate.quantity + delta);
    
    // Optimistic UI
    setCartItems(prev => prev.map(item => {
      if (item.id === id || item.productId === id) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));

    if (isAuthenticated) {
      try {
        await fetch(`${API_URL}/cart/item/${itemToUpdate.id}`, { 
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ quantity: newQuantity })
        });
      } catch (err) {
         console.error(err);
      }
    } else {
      setTimeout(() => {
        setCartItems(prev => {
          localStorage.setItem('cart', JSON.stringify(prev));
          return prev;
        });
      }, 0);
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (isAuthenticated) {
       try {
           await fetch(`${API_URL}/cart/clear/${user.id}`, { method: 'DELETE' });
       } catch(err) {
           console.error(err);
       }
    } else {
       localStorage.removeItem('cart');
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
