import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [predictedLabel, setPredictedLabel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem("Id");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/messages/${userId}/${product.sellerId}/${id}`);
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    if (product && userId) {
      fetchMessages();
    }
  }, [product, id, userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const { data } = await axios.post('http://localhost:5000/api/messages', {
        senderId: userId,
        receiverId: product.sellerId,
        productId: id,
        message: newMessage
      });
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
  try {
    const { data } = await axios.get("http://localhost:5000/api/pro/all-products");
    const prod = data.find(p => p._id === id);
    setProduct(prod);
    setLoading(false);

    const recRes = await axios.get(`http://localhost:8000/recommend/${id}`);
    
    setRecommended(Array.isArray(recRes.data) ? recRes.data : []);

    if (prod?.productName) {
      const labelRes = await axios.post("http://localhost:8000/predict-label", {
        productName: prod.productName
      });
      setPredictedLabel(labelRes.data.predictedLabel);
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    setLoading(false);
  }
};

    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!userId) {
      alert("Please log in to add items to cart.");
      return;
    }

    if (quantity > product.stock) {
      setAddedMessage(`❌ Only ${product.stock} item(s) available in stock.`);
      setTimeout(() => setAddedMessage(''), 3000);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/cart/cartItems", {
        id: userId,
        productName: product.productName,
        price: product.price,
        image: product.image,
        quantity: quantity,
        productId: product._id,
        sellerId: product.sellerId
      });

      setAddedMessage(`✅ Added ${quantity} item(s) to cart.`);
      setTimeout(() => setAddedMessage(''), 3000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setAddedMessage("❌ Failed to add item to cart.");
      setTimeout(() => setAddedMessage(''), 3000);
    }
  };

  const renderStars = (rating) => {
    return (
      <span className="stars">
        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
      </span>
    );
  };

  if (loading || !product) return <div className="loading">Loading product details...</div>;

  return (
    <div className="product-details-container">
      {/* Product Header */}
      <div className="product-header-enhanced">
        <div className="breadcrumb">
          <button onClick={() => window.history.back()} className="back-btn">← Back</button>
          <span> / Products / <strong>{product.productName}</strong></span>
        </div>

        <div className="product-header-content">
          <img src={product.image?.[0]} alt={product.productName} className="product-header-image" />
          <div className="product-header-text">
            <h1>{product.productName}</h1>
            <p className="price">₹{product.price}</p>
            <p className="short-desc">Category: <strong>{product.category || "General"}</strong></p>
            <span className="category-badge">{predictedLabel || "General"}</span>
          </div>
        </div>
      </div>

      {/* Main Details */}
      <div className="product-main">
        <div className="product-image">
          <img src={product.image?.[0]} alt={product.productName} />
        </div>
        <div className="product-info">
          <h2>{product.productName}</h2>
          <p className="seller">Sold by: <strong>{product.sellerName}</strong></p>
          <p className="price">₹{product.price}</p>
          <p className="stock">🧮 Stock Available: <strong>{product.stock}</strong></p>
          <p className="desc">Category: <strong>{product.category || "General"}</strong></p>

          <div className="quantity-cart">
            <label htmlFor="qty">Qty:</label>
            <input
              id="qty"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val <= product.stock && val >= 1) {
                  setQuantity(val);
                }
              }}
            />
            <button onClick={handleAddToCart} disabled={product.stock === 0}>🛒 Add to Cart</button>
            <button onClick={() => navigate('/cart')} className="go-to-cart-btn">🧺 Go to Cart</button>
          </div>

          {product.stock === 0 && (
            <p className="out-of-stock-msg">❌ Out of Stock</p>
          )}

          {addedMessage && <p className="cart-message">{addedMessage}</p>}
        </div>
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        <h3>💬 Message Seller</h3>
        <textarea
          rows="3"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ask something about the product..."
        />
        <button onClick={handleSendMessage}>Send Message</button>
        <div className="chat-history">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.senderId === userId ? 'buyer' : 'seller'}`}>
              <p>{msg.message}</p>
              <small>{new Date(msg.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="product-reviews">
        <h3>📝 Customer Reviews</h3>
        {product.reviews && product.reviews.length > 0 ? (
          product.reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-header">
                <strong className="username">{review.userName}</strong>
                <span className="rating">{renderStars(review.rating)}</span>
              </div>
              <p className="comment">“{review.comment}”</p>
            </div>
          ))
        ) : (
          <p className="no-review">No reviews yet. Be the first to review this product!</p>
        )}
      </div>

      {/* Recommendations */}
      <h3>🔁 Recommended Products</h3>
      <div className="recommended-section">
        {recommended.map(rec => (
          <div key={rec._id} className="recommended-card">
            <img src={rec.image?.[0]} alt={rec.productName} />
            <h4>{rec.productName}</h4>
            <p className="seller">Seller: {rec.sellerName}</p>
            <p className="price">₹{rec.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetails;
