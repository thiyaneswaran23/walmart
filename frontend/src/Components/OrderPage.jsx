import './Cart.css';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState, useEffect } from 'react';
import axios from 'axios';

function OrderPage() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const cartItems = state?.cartItems || [];
    const subtotal = parseFloat(state?.subtotal || 0);
    const discount = parseFloat(state?.discount || 0);
    const total = parseFloat(state?.total || 0);

    const [userName, setUserName] = useState('N/A');
    const [userEmail, setUserEmail] = useState('N/A');
    const [userAddress, setUserAddress] = useState('N/A');
    const [userId, setUserId] = useState(null);

    const [reviewText, setReviewText] = useState({});
    const [ratings, setRatings] = useState({});
    const [messages, setMessages] = useState({});
    const [activeReviewProductId, setActiveReviewProductId] = useState(null);

    useEffect(() => {
        setUserName(localStorage.getItem('Name') || 'N/A');
        setUserEmail(localStorage.getItem('email') || 'N/A');
        setUserAddress(localStorage.getItem('address') || 'N/A');
        setUserId(localStorage.getItem('Id'));
    }, []);

    const handleBackToCart = () => {
        navigate('/cart');
    };

    const generatePDF = async () => {
        const input = document.getElementById('receipt');
        if (!input) {
            alert('Receipt element not found.');
            return;
        }

        try {
            const canvas = await html2canvas(input, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('OrderReceipt.pdf');
            alert('PDF receipt downloaded successfully!');
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Failed to generate the receipt.');
        }
    };

 const handleSubmitReview = async (productId) => {
  const rating = ratings[productId];
  const comment = reviewText[productId];

  // Basic validation
  if (!rating || !comment) {
    setMessages((prev) => ({
      ...prev,
      [productId]: '❗ Please provide both rating and comment.',
    }));
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('Id');      
    const userName = localStorage.getItem('Name');     

    const response = await axios.post(
      `http://localhost:5000/api/pro/review/${productId}`,
      {
        userId,
        userName,
        rating,
        comment,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      setMessages((prev) => ({
        ...prev,
        [productId]: 'Review submitted successfully!',
      }));
      setReviewText((prev) => ({ ...prev, [productId]: '' }));
      setRatings((prev) => ({ ...prev, [productId]: '' }));
      setActiveReviewProductId(null);
    } else {
      setMessages((prev) => ({
        ...prev,
        [productId]: response.data.message || 'Error submitting review.',
      }));
    }

    console.log("Submitting review:", { productId, rating, comment });

  } catch (error) {
    console.error('Review error:', error);
    const errorMessage = error.response?.data?.message || 'Failed to submit review.';
    setMessages((prev) => ({
      ...prev,
      [productId]: errorMessage,
    }));
  }
};


    const handleStarClick = (productId, starValue) => {
        setRatings((prev) => ({ ...prev, [productId]: starValue }));
    };

    const renderStars = (productId) => {
        const selectedRating = ratings[productId] || 0;
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={star <= selectedRating ? 'star selected' : 'star'}
                        onClick={() => handleStarClick(productId, star)}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <>
            <div id="receipt" className="cart-container">
                <div className="cart-left">
                    <h2>Order Confirmation</h2>
                    <p>Thank you for your purchase!</p>
                    <p>Your order has been placed successfully.</p>

                    <h3>Customer Details</h3>
                    <p><strong>Name:</strong> {userName}</p>
                    <p><strong>Email:</strong> {userEmail}</p>
                    <p><strong>Delivery Address:</strong> {userAddress}</p>

                    <h3>Order Receipt</h3>
                    {cartItems.length === 0 ? (
                        <p>No items found.</p>
                    ) : (
                        <div className="cart-items">
                            {cartItems.map((item, index) => (
                                <div key={index} className="cart-card">
                                    <img
                                        src={item.image?.[0] || ''}
                                        alt={item.productName}
                                        crossOrigin="anonymous"
                                    />
                                    <div className="cart-info">
                                        <h4>{item.productName}</h4>
                                        <p>Price: ${item.price.toFixed(2)}</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>

                                    <button
                                        className="review-toggle-btn"
                                        onClick={() =>
                                            setActiveReviewProductId((prev) =>
                                                prev === item.productId ? null : item.productId
                                            )
                                        }
                                    >
                                        {activeReviewProductId === item.productId
                                            ? 'Cancel Review'
                                            : 'Leave a Review'}
                                    </button>

                                    {activeReviewProductId === item.productId && (
                                        <div className="review-form">
                                            <label>Rating:</label>
                                            {renderStars(item.productId)}
                                            <label>Comment:</label>
                                            <textarea
                                                placeholder="Write your review..."
                                                value={reviewText[item.productId] || ''}
                                                onChange={(e) =>
                                                    setReviewText((prev) => ({
                                                        ...prev,
                                                        [item.productId]: e.target.value,
                                                    }))
                                                }
                                            />
                                            <button
                                                onClick={() =>
                                                    handleSubmitReview(item.productId)
                                                }
                                            >
                                                Submit Review
                                            </button>
                                            {messages[item.productId] && (
                                                <p className="review-message">{messages[item.productId]}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <hr />
                </div>

                <div className="cart-right">
                    <h3>Summary</h3>
                    <div className="summary-line">
                        <span>Items Total</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-line">
                        <span>Discount</span>
                        <span>-${discount.toFixed(2)}</span>
                    </div>
                    <div className="summary-line total">
                        <span>Grand Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <p>You can download a PDF of your receipt below.</p>
                </div>
            </div>

            <div className="button-group">
                <button className="checkout-btn" onClick={handleBackToCart}>
                    Back to Cart
                </button>
                <button className="checkout-btn" onClick={generatePDF}>
                    Download PDF Receipt
                </button>
            </div>
        </>
    );
}

export default OrderPage;
