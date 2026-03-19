// pages/products/[productId].jsx

import { getAccessToken } from '../../utils/cjAuth';
import useCart from "../../hooks/useCart";

export async function getServerSideProps({ params }) {
  const token = await getAccessToken();
  const res = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${params.productId}`, {
    headers: { 'CJ-Access-Token': token }
  });
  const data = await res.json();
  console.log("Product data fetched successfully:", data);

  if (!data.result) return { notFound: true };

  return {
    props: {
      product: data.data
    }
  };
}

export default function ProductDetail({ product }) {
  const { addToCart } = useCart();
 

   // parser les images si c'est une string JSON
  const images = Array.isArray(product.productImage)
    ? product.productImage
    : JSON.parse(product.productImage);

  if (!product) return <p>Produit introuvable</p>;

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h1>{product.productNameEn}</h1>
      
   <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={product.productNameEn}
            style={{ height: 300, objectFit: "cover" }}
          />
        ))}
      </div>

      <p><strong>Prix:</strong> ${product.sellPrice}</p>
      <p><strong>SKU:</strong> {product.productSku}</p>
      <p><strong>Poids:</strong> {product.productWeight} g</p>
      <p><strong>Type:</strong> {product.productType}</p>
      <p><strong>Créé le:</strong> {new Date(product.createrTime).toLocaleString()}</p>

      {/* Variantes */}
      {product.variants && product.variants.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Variantes :</h3>
          <ul>
            {product.variants.map(v => (
              <li key={v.vid}>
                {v.variantNameEn || v.variantName} - {v.variantSellPrice}$
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer', background: "#0070f3", color: "#fff", border: "none", borderRadius: 5 }}
        onClick={() => addToCart(product)}
      >
        Ajouter au panier
      </button>
    </div>
  );
}
