// hooks/useCart.js

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function useCart() {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null);

  // 🔹 Charger le panier et cartId au montage
  useEffect(() => {
    let id = localStorage.getItem("cartId");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("cartId", id);
    }
    setCartId(id);

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }
  }, []);

  // 🔹 Sauvegarde locale + synchro BDD
  useEffect(() => {
    if (!cartId) return;

    localStorage.setItem("cart", JSON.stringify(cart));

    const payloadItems = cart.map((item) => ({
  productId: item.product?.pid || item.productId, // prends pid si présent
  variantId: item.variantId || null,
  qty: item.qty,
  productNameEn: item.productNameEn || item.product?.productNameEn || "",
  sellPrice: item.sellPrice || item.product?.sellPrice || 0,
  product: item.product || {},
}));


    fetch("/api/carts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartId, items: payloadItems }),
    }).catch(console.error);
  }, [cart, cartId]);

  // 🔹 Ajouter un produit
  const addToCart = (product, variantId = null, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.productId === product.productId && item.variantId === variantId
      );

      if (existing) {
        // déjà dans le panier → on incrémente la qty
        return prev.map((item) =>
          item.productId === product.productId && item.variantId === variantId
            ? { ...item, qty: item.qty + qty }
            : item
        );
      } else {
        // nouveau produit → on stocke toujours nom + prix
        return [
          ...prev,
          {
            productId: product.pid, // pas productId
            variantId,
            qty,
            productNameEn: product.productNameEn || "",
            sellPrice: product.sellPrice || product.price || 0,
            product, // garde tout
          },
        ];
      }
    });
    console.log("🛒 addToCart product:", product);
  };

  // 🔹 Supprimer un produit
  const removeFromCart = (productId, variantId = null) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  // 🔹 Vider le panier complètement
  const clearCart = () => {
    setCart([]);
  };

  return { cart, addToCart, removeFromCart, clearCart, cartId };
}
