import React, { createContext, useState, useEffect, useContext } from 'react';
import api from './services/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart from backend (if logged in) or localStorage (if guest)
  const fetchCart = async (currentUser) => {
    if (currentUser) {
      try {
        const { data } = await api.get('/cart');
        setCart(data.items || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    } else {
      const localCart = localStorage.getItem('cart');
      setCart(localCart ? JSON.parse(localCart) : []);
    }
  };

  // Fetch wishlist from backend (if logged in) or localStorage (if guest)
  const fetchWishlist = async (currentUser) => {
    if (currentUser) {
      try {
        const { data } = await api.get('/wishlist');
        setWishlist(data.products || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    } else {
      const localWishlist = localStorage.getItem('wishlist');
      setWishlist(localWishlist ? JSON.parse(localWishlist) : []);
    }
  };

  // Run initial state load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (user) {
        // Validate user session by fetching profile
        try {
          await api.get('/user/profile');
          await fetchCart(user);
          await fetchWishlist(user);
        } catch (error) {
          // Token expired or invalid
          console.warn('Session expired, logging out');
          localStorage.removeItem('userInfo');
          setUser(null);
          await fetchCart(null);
          await fetchWishlist(null);
        }
      } else {
        await fetchCart(null);
        await fetchWishlist(null);
      }
      setLoading(false);
    };
    init();
  }, [user]);

  // Auth: Login
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/user/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Logged in successfully!');
      
      // Merge guest cart with backend cart
      const guestCart = localStorage.getItem('cart');
      if (guestCart) {
        const items = JSON.parse(guestCart);
        for (const item of items) {
          if (item.product && item.product._id) {
            await api.post('/cart', { productId: item.product._id, quantity: item.quantity });
          }
        }
        localStorage.removeItem('cart');
      }

      // Merge guest wishlist
      const guestWishlist = localStorage.getItem('wishlist');
      if (guestWishlist) {
        const products = JSON.parse(guestWishlist);
        for (const prod of products) {
          if (prod && prod._id) {
            await api.post('/wishlist', { productId: prod._id });
          }
        }
        localStorage.removeItem('wishlist');
      }

      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      throw error;
    }
  };

  // Auth: Register
  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/user/register', { name, email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Registered successfully!');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw error;
    }
  };

  // Auth: Logout
  const logout = async () => {
    try {
      await api.post('/user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('userInfo');
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      setCart([]);
      setWishlist([]);
      toast.success('Logged out successfully');
    }
  };

  // Auth: Update Profile
  const updateProfile = async (name, email, password) => {
    try {
      const { data } = await api.put('/user/profile', { name, email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Profile updated successfully!');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Update profile failed';
      toast.error(msg);
      throw error;
    }
  };

  // Cart: Add
  const addToCart = async (product, quantity = 1) => {
    if (product.countInStock <= 0) {
      toast.error('Item is out of stock');
      return;
    }

    if (user) {
      try {
        const { data } = await api.post('/cart', { productId: product._id, quantity });
        setCart(data.items);
        toast.success(`Added ${product.name} to cart`);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error adding to cart');
      }
    } else {
      // LocalStorage handling for guests
      setCart((prevCart) => {
        const updated = [...prevCart];
        const existIdx = updated.findIndex((item) => item.product._id === product._id);
        if (existIdx > -1) {
          updated[existIdx].quantity += quantity;
        } else {
          updated.push({ product, quantity });
        }
        localStorage.setItem('cart', JSON.stringify(updated));
        return updated;
      });
      toast.success(`Added ${product.name} to cart (guest)`);
    }
  };

  // Cart: Update quantity
  const updateCartQty = async (productId, quantity) => {
    if (quantity < 1) return;
    if (user) {
      try {
        const { data } = await api.put('/cart', { productId, quantity });
        setCart(data.items);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error updating cart');
      }
    } else {
      setCart((prevCart) => {
        const updated = prevCart.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        );
        localStorage.setItem('cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Cart: Remove
  const removeFromCart = async (productId) => {
    if (user) {
      try {
        const { data } = await api.delete(`/cart/${productId}`);
        setCart(data.items);
        toast.success('Removed item from cart');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error removing item');
      }
    } else {
      setCart((prevCart) => {
        const updated = prevCart.filter((item) => item.product._id !== productId);
        localStorage.setItem('cart', JSON.stringify(updated));
        return updated;
      });
      toast.success('Removed item from cart');
    }
  };

  // Cart: Clear
  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
        setCart([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      setCart([]);
      localStorage.removeItem('cart');
    }
  };

  // Wishlist: Add
  const addToWishlist = async (product) => {
    if (user) {
      try {
        const { data } = await api.post('/wishlist', { productId: product._id });
        setWishlist(data.products);
        toast.success(`Saved ${product.name} to wishlist`);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error saving to wishlist');
      }
    } else {
      setWishlist((prevWishlist) => {
        const exists = prevWishlist.some((item) => item._id === product._id);
        if (exists) return prevWishlist;
        const updated = [...prevWishlist, product];
        localStorage.setItem('wishlist', JSON.stringify(updated));
        return updated;
      });
      toast.success(`Saved ${product.name} to wishlist (guest)`);
    }
  };

  // Wishlist: Remove
  const removeFromWishlist = async (productId) => {
    if (user) {
      try {
        const { data } = await api.delete(`/wishlist/${productId}`);
        setWishlist(data.products);
        toast.success('Removed from wishlist');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error removing from wishlist');
      }
    } else {
      setWishlist((prevWishlist) => {
        const updated = prevWishlist.filter((item) => item._id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(updated));
        return updated;
      });
      toast.success('Removed from wishlist');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        cart,
        wishlist,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
