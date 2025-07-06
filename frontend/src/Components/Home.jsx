import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import './customerhome.css';
import { FaCartPlus, FaSearch } from 'react-icons/fa';
import ham from '../assets/ham5.png';

function CustomerHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [profile, setProfile] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setSearch(true);
        handleSetSearch();
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('SpeechRecognition API not supported in this browser.');
    }
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/pro/unique-sellers')
      .then(res => setSellers(res.data))
      .catch(err => console.error('Error fetching sellers:', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleAddToCart = async (product) => {
  const alreadyInCart = cart.some((item) => item._id === product._id);
  if (!alreadyInCart) {
    setCart([...cart, product]);

    const userId = localStorage.getItem("Id");

    axios.post("http://localhost:5000/api/cart/cartItems", {
      id: userId,
      productId: product._id,
      productName: product.productName,
      price: product.price,
      image: product.image,
      quantity: 1,
      sellerId: product.sellerId// ✅ include sellerId here
    })
      .then((res) => alert(res.data.message))
      .catch((err) => console.log(err));
  } else {
    alert('Product already in cart');
  }
};


  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/pro/all-products', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  const filteredProducts = products
    .filter((product) => product.productName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'lowToHigh') return a.price - b.price;
      if (sortOrder === 'highToLow') return b.price - a.price;
      return 0;
    });

  useEffect(() => {
    if (searchTerm === '') {
      setSearch(false);
      setShowDropdown(false);
    }
  }, [searchTerm]);

  const handleSetSearch = async () => {
    setSearch(true);
    setShowDropdown(false);
    const id = localStorage.getItem("Id");
    axios.post("http://localhost:5000/api/pro/search", { searchTerm, id })
      .then((res) => console.log(res.data))
      .catch(err => console.log(err));
  };

  const handleSearchFocus = async () => {
    const id = localStorage.getItem("Id");
    try {
      const res = await axios.get(`http://localhost:5000/api/pro/recent-searches/${id}`);
      setRecentSearches(res.data);
      setShowDropdown(true);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBySellerName = async (sellerName) => {
    if (!sellerName) {
      axios.get('http://localhost:5000/api/pro/all-products')
        .then(res => setProducts(res.data))
        .catch(err => console.log(err));
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/pro/products-by-seller/${sellerName}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products by seller:', err);
      setProducts([]);
    }
  };

  return (
    <div className="customer-home-container">
      <header className="custom-home-header">
        <div className="customer-header">
          <h2>SmartShop</h2>
        </div>

        <div className="search-sort-wrapper">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
            />
            <button
              className="voice-btn"
              onClick={() => recognitionRef.current && recognitionRef.current.start()}
              title="Voice Search"
            >
              🎙️
            </button>
            <button
              className="search-icon-btn"
              onClick={handleSetSearch}
              title="Search"
            >
              <FaSearch />
            </button>

          
          </div>
           {showDropdown && recentSearches.length > 0 && (
              <ul className="recent-search-dropdown">
                {recentSearches.map((term, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSearchTerm(term);
                      setShowDropdown(false);
                      handleSetSearch();
                    }}
                  >
                    {term}
                  </li>
                ))}
              </ul>
            )}
        

          <div className="seller-filter">
            <select onChange={(e) => fetchBySellerName(e.target.value)}>
              <option value="">All Sellers</option>
              {sellers.map((seller, index) => (
                <option key={index} value={seller}>{seller}</option>
              ))}
            </select>
          </div>

          <div className="sort-dropdown">
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="">Sort by</option>
              <option value="lowToHigh">Low to High</option>
              <option value="highToLow">High to Low</option>
            </select>
          </div>
        </div>

        <div className="header-icons">
          <button className="cart-button" onClick={handleCartClick}>
            🛒 Cart ({cart.length})
          </button>
          <div className="hamburger-icon" onClick={() => setProfile(!profile)}>
            <img src={ham} alt="Menu" />
          </div>
        </div>

        {profile && (
          <div className="profile-dropdown">
            <button className="profile-option" onClick={() => navigate('/profile')}>
              👤 Profile
            </button>
            <button className="profile-option logout-btn" onClick={handleLogout}>
              🔓 Logout
            </button>
          </div>
        )}
      </header>

      <main className="product-grid">
  {[...(search ? filteredProducts : products)]
    .sort((a, b) => {
      if (sortOrder === 'lowToHigh') return a.price - b.price;
      if (sortOrder === 'highToLow') return b.price - a.price;
      return 0;
    }).length > 0 ? (
      [...(search ? filteredProducts : products)]
        .sort((a, b) => {
          if (sortOrder === 'lowToHigh') return a.price - b.price;
          if (sortOrder === 'highToLow') return b.price - a.price;
          return 0;
        })
        .map((prod) => (
          <div
            key={prod._id}
            className="product-card"
            onClick={() => navigate(`/product/${prod._id}`)}
          >
            <img src={prod.image?.[0]} alt={prod.productName} />
            <h3>{prod.productName}</h3>
            <p>Seller: {prod.sellerName}</p>
            <p>₹{prod.price}</p>
            <button
              className="icon-cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(prod);
              }}
              title="Add to Cart"
            >
              <FaCartPlus />
            </button>
          </div>
        ))
    ) : (
      <div className="no-products">No matching products found</div>
    )}
</main>

    </div>
  );
}

export default CustomerHome;
