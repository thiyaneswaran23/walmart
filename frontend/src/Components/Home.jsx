import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import './customerhome.css';
import { FaCartPlus, FaSearch } from 'react-icons/fa';


function CustomerHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState(''); 
  const [cart, setCart] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const handleCartClick = () => {
    console.log('Cart:', cart);
    navigate('/cart');
  };

  const handleAddToCart = async (product) => {
    const alreadyInCart = cart.some((item) => item._id === product._id);
    if (!alreadyInCart) {
      setCart([...cart, product]);
      const id = localStorage.getItem("Id");
      axios.post("http://localhost:5000/api/cart/cartItems", { ...product, id: id })
        .then((res) => {
          console.log(res.data);
          alert(res.data.message);
        })
        .catch(err => console.log(err));
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

  const filteredProducts = products
    .filter((product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'lowToHigh') {
        return a.price - b.price;
      } else if (sortOrder === 'highToLow') {
        return b.price - a.price;
      } else {
        return 0; 
      }
    });

  return (
    <div className="customer-home-container">
      <div className="custom-home-header">
        <div className="customer-header">
          <h2>Welcome to SmartShop</h2>
        </div>

        <div className="search-sort-container">
<div className="search-bar">
  <input
    type="text"
    placeholder="Search products"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <button className="search-icon-btn">
    <FaSearch />
  </button>
</div>

          <div className="sort-dropdown">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">All</option>
              <option value="lowToHigh">Low to High</option>
              <option value="highToLow">High to Low</option>
            </select>
          </div>
        </div>

        <div className="header-buttons">
          <button onClick={handleCartClick}>🛒 Cart ({cart.length})</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
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
              <button
                className="icon-cart-btn"
                onClick={() => handleAddToCart(prod)}
                title="Add to Cart"
              >
                <FaCartPlus />
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
