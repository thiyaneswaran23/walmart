import { useEffect, useState } from 'react';
import axios from 'axios';
import './Cart.css';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
const navigate = useNavigate();
    useEffect(() => {
        const fetchCart = async () => {
            const id = localStorage.getItem('Id');
            try {
                const res = await axios.get(`http://localhost:5000/api/cart/cartItems/${id}`);
            
                const itemsWithQuantity = res.data.map(item => ({
                    ...item,
                    quantity: 1
                }));
                setCartItems(itemsWithQuantity);
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
        console.error("api error ", err);
    }
};

    const handleQuantityChange = (index, newQuantity) => {
        const updatedCart = [...cartItems];
        updatedCart[index].quantity = Number(newQuantity);
        setCartItems(updatedCart);
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    const discount = 20;
    const total = subtotal - discount;

    return (
        <div className="cart-container">
            <div className="cart-left">
                <h2>Your Cart</h2>
                <div className="cart-items">
                    {cartItems.map((item, index) => (
                        <div key={index} className="cart-card">
                            <img src={item.image[0]} alt={item.productName} />
                            <div className="cart-info">
                                <h3>{item.productName}</h3>
                                <p>Price: ${item.price.toFixed(2)}</p>
                                <div className="cart-actions">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleQuantityChange(index, e.target.value)
                                        }
                                    />
                                  <button
  className="remove-icon-btn"
  onClick={() => handleRemoveItem(item._id)}
  title="Remove Item"
>
  <FaTrash />
</button>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cart-right">
                <h3>Order Summary</h3>
                <div className="summary-line">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                </div>
                <div className="summary-line total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <input type="text" placeholder="Enter discount code" className="discount-input" />
                

 <button
        className="checkout-btn"
        onClick={() =>
            navigate('/order', {
                state: {
                    cartItems,
                    subtotal,
                    discount,
                    total
                }
            })
        }
    >
        Proceed to Checkout
    </button>
            </div>
        </div>
    );
}

export default Cart;
