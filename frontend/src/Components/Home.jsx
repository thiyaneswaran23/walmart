import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { FaCartPlus, FaSearch, FaMicrophone, FaUser, FaSignOutAlt, FaBars, FaShoppingBag } from 'react-icons/fa';
import { FaBox } from 'react-icons/fa';

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
        sellerId: product.sellerId
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
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Enhanced Header */}
      <header className="sticky-top shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container-fluid py-3">
          <div className="row align-items-center">
            {/* Brand */}
            <div className="col-lg-2 col-md-3 col-sm-4">
              <div className="d-flex align-items-center">
                <FaShoppingBag className="text-white me-2" size={28} />
                <h2 className="mb-0 text-white fw-bold">SmartShop</h2>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="col-lg-8 col-md-6 col-sm-8">
              <div className="row g-2">
                {/* Enhanced Search Bar */}
                <div className="col-lg-5 col-md-12 position-relative">
                  <div className="input-group shadow-sm">
                    <input
                      type="text"
                      className="form-control form-control-lg border-0"
                      placeholder="Search amazing products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={handleSearchFocus}
                      style={{ borderRadius: '25px 0 0 25px' }}
                    />
                    <button
                      className="btn btn-light border-0 px-3"
                      onClick={() => recognitionRef.current && recognitionRef.current.start()}
                      title="Voice Search"
                      style={{ borderLeft: '1px solid #dee2e6' }}
                    >
                      <FaMicrophone className="text-primary" />
                    </button>
                    <button
                      className="btn btn-warning border-0 px-4"
                      onClick={handleSetSearch}
                      title="Search"
                      style={{ borderRadius: '0 25px 25px 0' }}
                    >
                      <FaSearch className="text-white" />
                    </button>
                  </div>

                  {/* Enhanced Recent Searches Dropdown */}
                  {showDropdown && recentSearches.length > 0 && (
                    <div className="position-absolute w-100 bg-white border-0 rounded-3 shadow-lg mt-2" style={{ zIndex: 1050 }}>
                      <div className="p-2">
                        <small className="text-muted fw-bold px-3">Recent Searches</small>
                        <ul className="list-unstyled mb-0 mt-2">
                          {recentSearches.map((term, index) => (
                            <li key={index}>
                              <button
                                className="btn btn-light w-100 text-start py-2 px-3 mb-1 rounded-2 border-0"
                                onClick={() => {
                                  setSearchTerm(term);
                                  setShowDropdown(false);
                                  handleSetSearch();
                                }}
                                style={{ transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                              >
                                <FaSearch className="me-2 text-muted" size={12} />
                                {term}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Seller Filter */}
                <div className="col-lg-3 col-md-6">
                  <select 
                    className="form-select form-select-lg border-0 shadow-sm"
                    onChange={(e) => fetchBySellerName(e.target.value)}
                    style={{ borderRadius: '15px' }}
                  >
                    <option value="">🏪 All Sellers</option>
                    {sellers.map((seller, index) => (
                      <option key={index} value={seller}>{seller}</option>
                    ))}
                  </select>
                </div>

                {/* Enhanced Sort Dropdown */}
                <div className="col-lg-4 col-md-6">
                  <select 
                    className="form-select form-select-lg border-0 shadow-sm"
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{ borderRadius: '15px' }}
                  >
                    <option value="">💰 Sort by Price</option>
                    <option value="lowToHigh">💸 Low to High</option>
                    <option value="highToLow">💎 High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Enhanced Header Icons */}
            <div className="col-lg-2 col-md-3 col-sm-12 text-end">
              <div className="d-flex align-items-center justify-content-end gap-2">
                {/* Enhanced Cart Button */}
                <button 
                  className="btn btn-light btn-lg position-relative shadow-sm me-2"
                  onClick={handleCartClick}
                  style={{ borderRadius: '20px', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <FaCartPlus className="me-2" />
                  Cart
                  {cart.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow">
                      {cart.length}
                      <span className="visually-hidden">items in cart</span>
                    </span>
                  )}
                </button>

                {/* Enhanced Profile Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-light btn-lg shadow-sm"
                    onClick={() => setProfile(!profile)}
                    aria-expanded={profile}
                    style={{ borderRadius: '50%', width: '50px', height: '50px', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <FaBars />
                  </button>

                  {profile && (
                    <div className="dropdown-menu dropdown-menu-end show position-absolute shadow-lg border-0 rounded-3 p-2" 
                         style={{ zIndex: 1050, minWidth: '200px', right: '0', top: '100%' }}>
                      <button 
                        className="dropdown-item d-flex align-items-center py-3 px-3 rounded-2 mb-1"
                        onClick={() => {
                          navigate('/profile');
                          setProfile(false);
                        }}
                        style={{ transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <FaUser className="me-3 text-primary" />
                        <span className="fw-medium">My Profile</span>
                      </button>
                      <hr className="dropdown-divider my-2" />
                            <button 
        className="dropdown-item d-flex align-items-center py-3 px-3 rounded-2 mb-1"
        onClick={() => {
          navigate('/myorders');
          setProfile(false);
        }}
        style={{ transition: 'all 0.2s' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent' }
      >
        <FaBox className="me-3 text-success" />
        <span className="fw-medium">My Orders</span>
      </button>

      <hr className="dropdown-divider my-2" />

                      <button 
                        className="dropdown-item d-flex align-items-center py-3 px-3 rounded-2 text-danger"
                        onClick={() => {
                          handleLogout();
                          setProfile(false);
                        }}
                        style={{ transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#fff5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <FaSignOutAlt className="me-3" />
                        <span className="fw-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="container-fluid py-5">
        {[...(search ? filteredProducts : products)]
          .sort((a, b) => {
            if (sortOrder === 'lowToHigh') return a.price - b.price;
            if (sortOrder === 'highToLow') return b.price - a.price;
            return 0;
          }).length > 0 ? (
          <div className="row g-4">
            {[...(search ? filteredProducts : products)]
              .sort((a, b) => {
                if (sortOrder === 'lowToHigh') return a.price - b.price;
                if (sortOrder === 'highToLow') return b.price - a.price;
                return 0;
              })
              .map((prod) => (
                <div key={prod._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                  <div 
                    className="card h-100 border-0 shadow-sm product-card position-relative overflow-hidden"
                    style={{ 
                      cursor: 'pointer', 
                      transition: 'all 0.3s ease',
                      borderRadius: '20px'
                    }}
                    onClick={() => navigate(`/product/${prod._id}`)}
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
                        src={prod.image?.[0]} 
                        alt={prod.productName}
                        className="card-img-top"
                        style={{ 
                          height: '250px', 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                      
                      {/* Enhanced Add to Cart Button */}
                      <button
                        className="btn btn-primary position-absolute shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(prod);
                        }}
                        title="Add to Cart"
                        style={{ 
                          top: '15px', 
                          right: '15px',
                          width: '50px', 
                          height: '50px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                        }}
                      >
                        <FaCartPlus size={18} />
                      </button>

                      {/* Price Badge */}
                      <div 
                        className="position-absolute bottom-0 start-0 m-3"
                        style={{
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                          color: 'white',
                          padding: '8px 15px',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          fontSize: '18px',
                          boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                        }}
                      >
                        ₹{prod.price}
                      </div>
                    </div>

                    <div className="card-body p-4">
                      <h5 className="card-title fw-bold mb-2" style={{ color: '#2c3e50' }}>
                        {prod.productName}
                      </h5>
                      <p className="card-text text-muted mb-0">
                        <small>
                          <strong>Seller:</strong> {prod.sellerName}
                        </small>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="card border-0 shadow-lg d-inline-block p-5" style={{ borderRadius: '20px' }}>
              <div className="card-body">
                <FaSearch size={60} className="text-muted mb-4" />
                <h3 className="text-muted mb-3">No Products Found</h3>
                <p className="text-muted mb-0">
                  Try adjusting your search terms or browse all products
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .product-card:hover .card-img-top {
          transform: scale(1.05);
        }
        
        .btn:focus {
          box-shadow: none !important;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        
        .dropdown-menu {
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default CustomerHome;