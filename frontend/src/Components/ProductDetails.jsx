import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams(); // product ID
  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all products (from your backend)
        const { data } = await axios.get("http://localhost:5000/api/pro/all-products");
        const prod = data.find(p => p._id === id);
        setProduct(prod);

        // Fetch recommendations
        const recRes = await axios.get(`http://localhost:8000/recommend/${id}`);
        console.log("Recommendations:", recRes.data);

        setRecommended(recRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [id]);

  if (!product) return <p>Loading product...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{product.productName}</h2>
      <img src={product.image?.[0]} alt={product.productName} style={{ width: '300px' }} />
      <p>Seller: {product.sellerName}</p>
      <p>Price: ₹{product.price}</p>

      <h3 style={{ marginTop: "30px" }}>🔁 Recommended Products</h3>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {recommended.map(rec => (
          <div key={rec._id} style={{ border: '1px solid #ccc', padding: '10px', width: '200px' }}>
            <img src={rec.image?.[0]} alt={rec.productName} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            <h4>{rec.productName}</h4>
            <p>Seller: {rec.sellerName}</p>
            <p>₹{rec.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetails;
