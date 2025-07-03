import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import './customerhome.css';
import { FaCartPlus, FaSearch } from 'react-icons/fa';
import ham from '../assets/ham5.png'

function CustomerHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState(''); 
  const [cart, setCart] = useState([]);
  const[search,setSearch]=useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
 
  const[profile,setProfile]=useState(false);
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
      axios.post("http://localhost:5000/api/cart/cartItems", { ...product, id: id,productId:product._id })
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
    axios.post("http://localhost:5000/api/pro/search", { searchTerm, id: id })
      .then((res) => {
        console.log(res.data);
      })
      .catch(err => console.log(err));
  }
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

  return (
    <div className="customer-home-container">
      <div className="custom-home-header">
        <div className="customer-header">
          <h2>Welcome to SmartShop</h2>
        </div>

        <div className="search-sort-container">
          <div className="search-bar" style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
            />
            <button onClick={handleSetSearch} className="search-icon-btn">
              <FaSearch />
            </button>

            {showDropdown && recentSearches.length > 0 && (
              <ul className="recent-search-dropdown">
                {recentSearches.map((term, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSearchTerm(term);
                      setShowDropdown(false);
                      handleSetSearch(); // 👈 optional: trigger search after selecting
                    }}
                  >
                    {term}
                  </li>
                ))}
              </ul>
            )}
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
              <div className="header-icons">
  <button className="cart-button" onClick={handleCartClick}>
    🛒 Cart ({cart.length})
  </button>
  <div className="hamburger-icon" onClick={() => setProfile(!profile)}>
    <img src={ham} alt="Menu" />
  </div>
</div>


        <div className="header-buttons">
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

        </div>
      </div>

     <div className="product-grid">
  {(search ? filteredProducts : products).length > 0 ? (
     filteredProducts.map((prod) => (
      <div key={prod._id} className="product-card" onClick={() => navigate(`/product/${prod._id}`)} style={{ cursor: 'pointer' }}>
  <img src={prod.image?.[0]} alt={prod.productName} />
  <h3>{prod.productName}</h3>
  <p>Seller: {prod.sellerName}</p>
  <p>₹{prod.price}</p>
  <button
    className="icon-cart-btn"
    onClick={(e) => {
      e.stopPropagation(); // prevent click from triggering navigation
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
</div>

    </div>
  );
}

export default CustomerHome;
