import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash as Trash3Fill, Check as CartCheck, Plus, Hash as Dash } from 'lucide-react';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCart = async () => {
            const id = localStorage.getItem('Id');
            try {
                const res = await axios.get(`http://localhost:5000/api/cart/cartItems/${id}`);
                setCartItems(res.data);
                console.log(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchCart();
    }, []);

    const handleRemoveItem = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/cart/cartItems/${id}`);
            setCartItems(prevItems => prevItems.filter(item => item._id !== id));
        } catch (err) {
            console.error("API error ", err);
        }
    };

    const handleCheckout = async () => {
        const userId = localStorage.getItem("Id");

        try {
            const profileRes = await axios.get(`http://localhost:5000/api/profile/${userId}`);
            const userAddress = profileRes.data.address;

            if (!userAddress || userAddress.trim() === "") {
                alert("Please complete your profile with an address before checkout.");
                navigate('/profile');
                return;
            }

            await axios.post(`http://localhost:5000/api/cart/checkout/${userId}`);

            navigate('/order', {
                state: {
                    cartItems,
                    subtotal,
                    discount,
                    total
                }
            });

        } catch (err) {
            console.error('Checkout failed:', err);
            alert('Checkout failed');
        }
    };

    const handleQuantityChange = (index, newQuantity) => {
        const updatedCart = [...cartItems];
        updatedCart[index].quantity = Number(newQuantity);
        setCartItems(updatedCart);
    };

    const incrementQuantity = (index) => {
        const updatedCart = [...cartItems];
        updatedCart[index].quantity += 1;
        setCartItems(updatedCart);
    };

    const decrementQuantity = (index) => {
        const updatedCart = [...cartItems];
        if (updatedCart[index].quantity > 1) {
            updatedCart[index].quantity -= 1;
            setCartItems(updatedCart);
        }
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    const discount = 20;
    const total = subtotal - discount;

    return (
        <div className="container-fluid bg-light min-vh-100 py-5">
            <div className="container">
                <div className="row">
                    <div className="col-12 mb-4">
                        <div className="text-center">
                            <h1 className="display-4 fw-bold text-primary mb-2">
                                <CartCheck className="me-3" size={48} />
                                Your Shopping Cart
                            </h1>
                            <p className="lead text-muted">Review your items before checkout</p>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Cart Items Section */}
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0 fw-semibold">
                                    Cart Items ({cartItems.length})
                                </h4>
                            </div>
                            <div className="card-body p-0">
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-5">
                                        <CartCheck size={64} className="text-muted mb-3" />
                                        <h5 className="text-muted">Your cart is empty</h5>
                                        <p className="text-muted">Add some items to get started!</p>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {cartItems.map((item, index) => (
                                            <div key={index} className="list-group-item border-0">
                                                <div className="row align-items-center g-3">
                                                    <div className="col-md-2">
                                                        <img 
                                                            src={item.image[0]} 
                                                            alt={item.productName}
                                                            className="img-fluid rounded shadow-sm"
                                                            style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <h6 className="mb-1 fw-semibold">{item.productName}</h6>
                                                        <p className="mb-0 text-success fw-bold fs-5">
                                                            ${item.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="input-group input-group-sm">
                                                            <button 
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => decrementQuantity(index)}
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Dash size={16} />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                                className="form-control text-center fw-semibold"
                                                                style={{ maxWidth: '80px' }}
                                                            />
                                                            <button 
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => incrementQuantity(index)}
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <p className="mb-0 fw-bold text-primary fs-5">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="col-md-1">
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleRemoveItem(item._id)}
                                                            title="Remove Item"
                                                        >
                                                            <Trash3Fill size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Section */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
                            <div className="card-header bg-success text-white">
                                <h4 className="mb-0 fw-semibold">Order Summary</h4>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="text-muted">Subtotal</span>
                                    <span className="fw-semibold fs-5">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="text-muted">Discount</span>
                                    <span className="text-success fw-semibold fs-5">-${discount.toFixed(2)}</span>
                                </div>
                                <hr className="my-3" />
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="fw-bold fs-4">Total</span>
                                    <span className="fw-bold fs-4 text-primary">${total.toFixed(2)}</span>
                                </div>
                                
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-primary btn-lg fw-semibold py-3"
                                        onClick={handleCheckout}
                                        disabled={cartItems.length === 0}
                                    >
                                        <CartCheck className="me-2" size={20} />
                                        Proceed to Checkout
                                    </button>
                                </div>
                                
                                <div className="mt-3 text-center">
                                    <small className="text-muted">
                                        🔒 Secure checkout with SSL encryption
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Promotional Card */}
                        <div className="card shadow-sm border-0 mt-4">
                            <div className="card-body bg-light text-center">
                                <div className="badge bg-warning text-dark mb-2">Special Offer</div>
                                <h6 className="fw-semibold">Free Shipping</h6>
                                <p className="mb-0 small text-muted">
                                    On orders over $50. Your order qualifies!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;