import { useEffect, useState } from 'react';

export default function MyProductsGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/myProducts'); // récupère tous les produits
        const data = await res.json();
        setProducts(data.data?.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <p>Loading products…</p>;
  if (!products.length) return <p>No products found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <div key={p.productId} className="border rounded shadow p-4 flex flex-col">
          <img src={p.bigImage} alt={p.nameEn} className="w-full h-48 object-cover mb-2 rounded" />
          <h3 className="text-sm font-semibold mb-1">{p.nameEn}</h3>
          <p className="text-gray-700 mb-2">${p.totalPrice}</p>
          <button className="mt-auto bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Voir le produit
          </button>
        </div>
      ))}
    </div>
  );
}
