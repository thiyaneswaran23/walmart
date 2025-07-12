import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleFetchOrders = async () => {
    const userId = localStorage.getItem('Id');
    const token = localStorage.getItem('token');

    try {
      const res = await axios.get(`http://localhost:5000/api/pro/orders/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchOrders();
  }, []);

  return (
    <div className="orders-container">
      <h2 className="orders-title">My Orders</h2>

      {loading ? (
        <div className="orders-loading">Loading your orders...</div>
      ) : orders.length > 0 ? (
        <div className="orders-grid">
          {orders.map((order, index) => (
            <div key={order._id} className="order-card">
              <div className="order-card-body">
                <h5 className="order-id">Order #{index + 1}</h5>
                <p className="order-date">
                  <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                </p>

                <h6 className="order-items-title">Items:</h6>
                <ul className="order-items-list">
                  {(order.cartItems || []).map((item, i) => (
                    <li key={i}>
                      {(item.productName || item.name || 'Unnamed')} × {item.quantity}
                    </li>
                  ))}
                </ul>

                <div className="order-user-info">
                  <p><strong>Name:</strong> {order.userName}</p>
                  <p><strong>Email:</strong> {order.userEmail}</p>
                  <p><strong>Address:</strong> {order.userAddress}</p>
                </div>

                <hr className="order-divider" />

                <div className="order-summary">
                  <p><strong>Subtotal:</strong> ₹{order.subtotal}</p>
                  <p><strong>Discount:</strong> {order.discount}%</p>
                  <p className="order-total"><strong>Total:</strong> ₹{order.total}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="orders-empty">
          <p>No orders found. Looks like you haven't placed any yet!</p>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
