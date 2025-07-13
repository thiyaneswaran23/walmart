import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  const getStatusBadge = (index) => {
    const statuses = ['success', 'warning', 'info', 'primary'];
    const statusTexts = ['Delivered', 'Processing', 'Shipped', 'Confirmed'];
    const badgeClass = statuses[index % statuses.length];
    const statusText = statusTexts[index % statusTexts.length];
    
    return <span className={`badge bg-${badgeClass} fs-6`}>{statusText}</span>;
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="text-muted">Loading your orders...</h4>
                <p className="text-muted mb-0">Please wait while we fetch your order history</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-cart-x display-1 text-muted"></i>
                </div>
                <h3 className="card-title text-dark mb-3">No Orders Found</h3>
                <p className="card-text text-muted mb-4">
                  Looks like you haven't placed any orders yet! Start shopping to see your orders here.
                </p>
                <button className="btn btn-primary btn-lg px-5">
                  <i className="bi bi-shop me-2"></i>
                  Start Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <div className="container">
        {/* Header Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="text-center text-white">
              <h1 className="display-4 fw-bold mb-3">
                <i className="bi bi-bag-check me-3"></i>
                My Orders
              </h1>
              <p className="lead mb-0">Track and manage all your purchases in one place</p>
              <div className="row mt-4">
                <div className="col-md-4">
                  <div className="text-center">
                    <h3 className="fw-bold">{orders.length}</h3>
                    <p className="mb-0">Total Orders</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <h3 className="fw-bold">₹{orders.reduce((sum, order) => sum + order.total, 0)}</h3>
                    <p className="mb-0">Total Spent</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <h3 className="fw-bold">{orders.reduce((sum, order) => sum + (order.cartItems?.length || 0), 0)}</h3>
                    <p className="mb-0">Items Purchased</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="row g-4">
          {orders.map((order, index) => (
            <div key={order._id} className="col-12 col-lg-6 col-xl-4">
              <div className="card h-100 border-0 shadow-lg" style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                <div className="card-header bg-white border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title mb-1 text-primary fw-bold">
                        <i className="bi bi-receipt me-2"></i>
                        Order #{String(index + 1).padStart(3, '0')}
                      </h5>
                      <small className="text-muted">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(order.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </div>
                    {getStatusBadge(index)}
                  </div>
                </div>

                <div className="card-body">
                  {/* Items Section */}
                  <div className="mb-4">
                    <h6 className="fw-bold text-dark mb-3">
                      <i className="bi bi-box me-2 text-primary"></i>
                      Order Items ({(order.cartItems || []).length})
                    </h6>
                    <div className="border rounded p-3 bg-light">
                      {(order.cartItems || []).slice(0, 3).map((item, i) => (
                        <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-dark fw-medium">
                            {(item.productName || item.name || 'Unnamed Product')}
                          </span>
                          <span className="badge bg-secondary">×{item.quantity}</span>
                        </div>
                      ))}
                      {(order.cartItems || []).length > 3 && (
                        <div className="text-center mt-2">
                          <small className="text-muted">
                            +{(order.cartItems || []).length - 3} more items
                          </small>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4">
                    <h6 className="fw-bold text-dark mb-3">
                      <i className="bi bi-person me-2 text-primary"></i>
                      Delivery Information
                    </h6>
                    <div className="bg-light rounded p-3">
                      <div className="row g-2">
                        <div className="col-12">
                          <strong className="text-dark">{order.userName}</strong>
                        </div>
                        <div className="col-12">
                          <small className="text-muted">
                            <i className="bi bi-envelope me-1"></i>
                            {order.userEmail}
                          </small>
                        </div>
                        <div className="col-12">
                          <small className="text-muted">
                            <i className="bi bi-geo-alt me-1"></i>
                            {order.userAddress}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary Footer */}
                <div className="card-footer bg-white border-0 pt-0">
                  <div className="border-top pt-3">
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <small className="text-muted">Subtotal:</small>
                      </div>
                      <div className="col-6 text-end">
                        <small className="fw-medium">₹{order.subtotal}</small>
                      </div>
                    </div>
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <small className="text-muted">Discount:</small>
                      </div>
                      <div className="col-6 text-end">
                        <small className="text-success fw-medium">{order.discount}%</small>
                      </div>
                    </div>
                    <div className="row g-2">
                      <div className="col-6">
                        <strong className="text-dark">Total:</strong>
                      </div>
                      <div className="col-6 text-end">
                        <strong className="text-primary fs-5">₹{order.total}</strong>
                      </div>
                    </div>
                    
                   
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

       
      </div>
    </div>
  );
};

export default MyOrders;