import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import './customerhome.css';

function CustomerHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const handleCartClick = () => {
    console.log('Cart:', cart);
    alert(`Cart contains ${cart.length} item(s).`);
  };

  const handleAddToCart = (product) => {
    const alreadyInCart = cart.some((item) => item._id === product._id);
    if (!alreadyInCart) {
      setCart([...cart, product]);
    } else {
      alert('Product already in cart');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    axios.get('http://localhost:5000/api/pro/all-products', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
      });
  }, []);

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customer-home-container">
      <div className="customer-header">
        <h2>Welcome to SmartShop</h2>
        <div className="header-buttons">
          <button onClick={handleCartClick}>🛒 Cart ({cart.length})</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((prod) => (
            <div key={prod._id} className="product-card">
              <img
                 src={prod.image?.[0]}
                alt={prod.productName}
              />
              <h3>{prod.productName}</h3>
              <p>Seller: {prod.sellerName}</p>
              <p>₹{prod.price}</p>
              <button className="add-cart-btn" onClick={() => handleAddToCart(prod)}>
                Add to Cart
              </button>
            </div>
          ))
        ) : (
          <div className="no-products">No matching products found</div>
        )}
      </div>
    </div>
  );
}

export default CustomerHome;
