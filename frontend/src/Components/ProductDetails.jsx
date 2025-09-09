import React, { useEffect, useState,useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaShoppingCart, 
  FaShoppingBag, 
  FaComments, 
  FaPaperPlane,
  FaStar,
  FaRegStar,
  FaBox,
  FaStore,
  FaTag,
  FaHeart,
  FaShare
} from 'react-icons/fa';

import { io } from 'socket.io-client';

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
  const [selectedImage, setSelectedImage] = useState(0);
  const navigate = useNavigate();
  const userId = localStorage.getItem("Id");



 const socketRef = useRef();

  // Initialize socket once
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('receiveMessage', (message) => {
      if (
        product &&
        ((message.senderId === product.sellerId && message.receiverId === userId && message.productId === id) ||
         (message.senderId === userId && message.receiverId === product.sellerId && message.productId === id))
      ) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId, id, product?.sellerId]);

  // Fetch messages when product is loaded
  useEffect(() => {
    if (!product) return;
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/messages/${userId}/${product.sellerId}/${id}`);
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [product, userId, id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!product) return;

    const messageData = {
      senderId: userId,
      receiverId: product.sellerId,
      productId: id,
      message: newMessage
    };

    try {
      // Save to DB
      await axios.post('http://localhost:5000/api/messages', messageData);

      // Emit via socket
      socketRef.current.emit('sendMessage', messageData);

      // Do NOT manually append — socket listener will handle it
      setNewMessage('');
    } catch (err) {
      console.error(err);
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
      setAddedMessage(`Only ${product.stock} item(s) available in stock.`);
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

      setAddedMessage(`Added ${quantity} item(s) to cart successfully!`);
      setTimeout(() => setAddedMessage(''), 3000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setAddedMessage("Failed to add item to cart.");
      setTimeout(() => setAddedMessage(''), 3000);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? 
        <FaStar key={i} className="text-warning" /> : 
        <FaRegStar key={i} className="text-muted" />
      );
    }
    return <span className="d-flex align-items-center">{stars}</span>;
  };

  if (loading || !product) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-muted">Loading product details...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Enhanced Header */}
      <div className="sticky-top shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button 
                onClick={() => window.history.back()} 
                className="btn btn-light me-3 rounded-pill shadow-sm"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => e.target.style.transform = 'translateX(-5px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
              >
                <FaArrowLeft className="me-2" />
                Back
              </button>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 text-white">
                  <li className="breadcrumb-item">
                    <span className="text-white-50">Products</span>
                  </li>
                  <li className="breadcrumb-item active text-white" aria-current="page">
                    {product.productName}
                  </li>
                </ol>
              </nav>
            </div>
            
          
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Product Main Section */}
        <div className="row g-5 mb-5">
          {/* Product Images */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="position-relative">
                <img 
                  src={product.image?.[selectedImage] || product.image?.[0]} 
                  alt={product.productName}
                  className="card-img-top"
                  style={{ height: '500px', objectFit: 'cover' }}
                />
                {product.stock === 0 && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                       style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <span className="badge bg-danger fs-4 p-3 rounded-pill">Out of Stock</span>
                  </div>
                )}
              </div>
              
              {/* Image Thumbnails */}
              {product.image && product.image.length > 1 && (
                <div className="card-body p-3">
                  <div className="d-flex gap-2 overflow-auto">
                    {product.image.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${product.productName} ${index + 1}`}
                        className={`rounded-3 cursor-pointer ${selectedImage === index ? 'border border-primary border-3' : ''}`}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 h-100">
              <div className="card-body p-5">
                <h1 className="display-5 fw-bold mb-3" style={{ color: '#2c3e50' }}>
                  {product.productName}
                </h1>
                
                <div className="d-flex align-items-center mb-4">
                  <FaStore className="text-primary me-2" />
                  <span className="text-muted">Sold by: </span>
                  <strong className="ms-1">{product.sellerName}</strong>
                </div>

                <div className="mb-4">
                  <span className="display-4 fw-bold text-success">₹{product.price}</span>
                  <span className="text-muted ms-2 fs-5">
                    <del>₹{Math.round(product.price * 1.2)}</del>
                  </span>
                  <span className="badge bg-success ms-2 fs-6">
                    {Math.round(((product.price * 1.2 - product.price) / (product.price * 1.2)) * 100)}% OFF
                  </span>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded-3">
                      <FaBox className="text-primary me-2" />
                      <div>
                        <small className="text-muted d-block">Stock</small>
                        <strong>{product.stock} available</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded-3">
                      <FaTag className="text-primary me-2" />
                      <div>
                        <small className="text-muted d-block">Category</small>
                        <strong>{product.category || "General"}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity and Cart Section */}
                <div className="card bg-light border-0 rounded-3 p-4 mb-4">
                  <div className="row align-items-center g-3">
                    <div className="col-md-4">
                      <label htmlFor="qty" className="form-label fw-medium">Quantity:</label>
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
                        className="form-control form-control-lg text-center fw-bold"
                        style={{ borderRadius: '15px' }}
                      />
                    </div>
                    <div className="col-md-8">
                      <div className="d-grid gap-2">
                        <button 
                          onClick={handleAddToCart} 
                          disabled={product.stock === 0}
                          className="btn btn-lg rounded-pill shadow-sm"
                          style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            color: 'white',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          <FaShoppingCart className="me-2" />
                          Add to Cart
                        </button>
                        <button 
                          onClick={() => navigate('/cart')} 
                          className="btn btn-outline-primary btn-lg rounded-pill"
                        >
                          <FaShoppingBag className="me-2" />
                          Go to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                {addedMessage && (
                  <div className={`alert ${addedMessage.includes('successfully') ? 'alert-success' : 'alert-warning'} rounded-3`}>
                    {addedMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-header bg-transparent border-0 p-4">
                <h3 className="mb-0 d-flex align-items-center">
                  <FaComments className="text-primary me-3" />
                  Message Seller
                </h3>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-8">
                    <textarea
                      rows="3"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ask something about the product..."
                      className="form-control form-control-lg"
                      style={{ borderRadius: '15px', resize: 'none' }}
                    />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button 
                      onClick={handleSendMessage}
                      className="btn btn-primary btn-lg w-100 rounded-pill"
                      disabled={!newMessage.trim()}
                    >
                      <FaPaperPlane className="me-2" />
                      Send Message
                    </button>
                  </div>
                </div>

                {/* Chat History */}
                {messages.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-3">Chat History</h5>
                    <div className="chat-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {messages.map((msg, idx) => (
                        <div key={idx} className={`d-flex mb-3 ${msg.senderId === userId ? 'justify-content-end' : 'justify-content-start'}`}>
                          <div className={`card border-0 shadow-sm ${msg.senderId === userId ? 'bg-primary text-white' : 'bg-light'}`}
                               style={{ maxWidth: '70%', borderRadius: '20px' }}>
                            <div className="card-body p-3">
                              <p className="mb-1">{msg.message}</p>
                              <small className={msg.senderId === userId ? 'text-white-50' : 'text-muted'}>
                                {new Date(msg.timestamp).toLocaleString()}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-header bg-transparent border-0 p-4">
                <h3 className="mb-0 d-flex align-items-center">
                  <FaStar className="text-warning me-3" />
                  Customer Reviews
                </h3>
              </div>
              <div className="card-body p-4">
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="row g-4">
                    {product.reviews.map((review, index) => (
                      <div key={index} className="col-md-6">
                        <div className="card border-0 bg-light rounded-3 h-100">
                          <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <strong className="text-primary">{review.userName}</strong>
                              {renderStars(review.rating)}
                            </div>
                            <p className="mb-0 fst-italic">"{review.comment}"</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaStar size={60} className="text-muted mb-3" />
                    <h5 className="text-muted">No reviews yet</h5>
                    <p className="text-muted">Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommended.length > 0 && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-header bg-transparent border-0 p-4">
                  <h3 className="mb-0">🔄 Recommended Products</h3>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    {recommended.slice(0, 4).map(rec => (
                      <div key={rec._id} className="col-lg-3 col-md-6">
                        <div 
                          className="card border-0 shadow-sm h-100 product-card"
                          style={{ 
                            cursor: 'pointer', 
                            transition: 'all 0.3s ease',
                            borderRadius: '20px'
                          }}
                          onClick={() => navigate(`/product/${rec._id}`)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                          }}
                        >
                          <div className="position-relative overflow-hidden" style={{ borderRadius: '20px 20px 0 0' }}>
                            <img 
                              src={rec.image?.[0]} 
                              alt={rec.productName}
                              className="card-img-top"
                              style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div 
                              className="position-absolute bottom-0 start-0 m-3"
                              style={{
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                                color: 'white',
                                padding: '5px 12px',
                                borderRadius: '15px',
                                fontWeight: 'bold'
                              }}
                            >
                              ₹{rec.price}
                            </div>
                          </div>
                          <div className="card-body p-3">
                            <h6 className="card-title fw-bold mb-2">{rec.productName}</h6>
                            <p className="card-text text-muted mb-0">
                              <small>Seller: {rec.sellerName}</small>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .product-card:hover .card-img-top {
          transform: scale(1.05);
        }
        
        .btn:focus {
          box-shadow: none !important;
        }
        
        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        
        .chat-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .chat-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .chat-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        .chat-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;