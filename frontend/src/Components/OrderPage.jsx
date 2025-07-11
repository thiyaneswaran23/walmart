import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, User, Mail, MapPin, Package, Star, Download, ArrowLeft } from 'lucide-react';

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
        const name = localStorage.getItem('Name') || 'N/A';
        const email = localStorage.getItem('email') || 'N/A';
        const address = localStorage.getItem('address') || '';
        const id = localStorage.getItem('Id');

        if (!address.trim()) {
            alert('Please update your delivery address to proceed.');
            navigate('/profile');
            return;
        }

        setUserName(name);
        setUserEmail(email);
        setUserAddress(address);
        setUserId(id);
    }, [navigate]);

    useEffect(() => {
        if (userId && cartItems.length > 0) {
            saveOrder();
        }
    }, [userId]);

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

    const saveOrder = async () => {
        const token = localStorage.getItem('token');

        try {
            const receiptElement = document.getElementById('receipt');
            const canvas = await html2canvas(receiptElement, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const pdfBlob = pdf.output('blob');

            const pdfBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(pdfBlob);
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
            });

            const res = await axios.post(
                'http://localhost:5000/api/pro/orders',
                {
                    userId,
                    userName,
                    userEmail,
                    userAddress,
                    cartItems,
                    subtotal,
                    discount,
                    total,
                    pdfBase64,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('Order saved:', res.data);
        } catch (error) {
            console.error('Order save error:', error.response?.data || error.message);
        }
    };

    const handleSubmitReview = async (productId, sellerId) => {
        const rating = ratings[productId];
        const comment = reviewText[productId];

        if (!rating || !comment) {
            setMessages((prev) => ({
                ...prev,
                [productId]: 'Please provide both rating and comment.',
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
                    sellerId,
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
            <div className="d-flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={24}
                        className={`cursor-pointer ${
                            star <= selectedRating 
                                ? 'text-warning' 
                                : 'text-muted'
                        }`}
                        fill={star <= selectedRating ? 'currentColor' : 'none'}
                        onClick={() => handleStarClick(productId, star)}
                        style={{ cursor: 'pointer' }}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="container-fluid bg-light min-vh-100 py-5">
            <div className="container">
                {/* Success Header */}
                <div className="row mb-5">
                    <div className="col-12">
                        <div className="text-center">
                            <CheckCircle className="text-success mb-3" size={64} />
                            <h1 className="display-4 fw-bold text-success mb-2">Order Confirmed!</h1>
                            <p className="lead text-muted">Thank you for your purchase. Your order has been placed successfully.</p>
                        </div>
                    </div>
                </div>

                <div id="receipt">
                    <div className="row g-4">
                        {/* Order Details Section */}
                        <div className="col-lg-8">
                            {/* Customer Details Card */}
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h4 className="mb-0 fw-semibold">
                                        <User className="me-2" size={20} />
                                        Customer Details
                                    </h4>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <User className="text-primary me-2" size={18} />
                                                <div>
                                                    <small className="text-muted d-block">Name</small>
                                                    <span className="fw-semibold">{userName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <Mail className="text-primary me-2" size={18} />
                                                <div>
                                                    <small className="text-muted d-block">Email</small>
                                                    <span className="fw-semibold">{userEmail}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="d-flex align-items-start">
                                                <MapPin className="text-primary me-2 mt-1" size={18} />
                                                <div>
                                                    <small className="text-muted d-block">Delivery Address</small>
                                                    <span className="fw-semibold">{userAddress}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Card */}
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-success text-white">
                                    <h4 className="mb-0 fw-semibold">
                                        <Package className="me-2" size={20} />
                                        Order Receipt ({cartItems.length} items)
                                    </h4>
                                </div>
                                <div className="card-body p-0">
                                    {cartItems.length === 0 ? (
                                        <div className="text-center py-5">
                                            <Package size={64} className="text-muted mb-3" />
                                            <h5 className="text-muted">No items found</h5>
                                        </div>
                                    ) : (
                                        <div className="list-group list-group-flush">
                                            {cartItems.map((item, index) => (
                                                <div key={index} className="list-group-item border-0">
                                                    <div className="row align-items-center g-3">
                                                        <div className="col-md-2">
                                                            <img
                                                                src={item.image?.[0] || ''}
                                                                alt={item.productName}
                                                                crossOrigin="anonymous"
                                                                className="img-fluid rounded shadow-sm"
                                                                style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6 className="mb-2 fw-semibold">{item.productName}</h6>
                                                            <div className="row text-sm">
                                                                <div className="col-6">
                                                                    <span className="text-muted">Price: </span>
                                                                    <span className="fw-semibold text-success">${item.price.toFixed(2)}</span>
                                                                </div>
                                                                <div className="col-6">
                                                                    <span className="text-muted">Quantity: </span>
                                                                    <span className="fw-semibold">{item.quantity}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <div className="text-end">
                                                                <small className="text-muted d-block">Total</small>
                                                                <span className="fw-bold text-primary fs-5">
                                                                    ${(item.price * item.quantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <button
                                                                className={`btn btn-sm w-100 ${
                                                                    activeReviewProductId === item.productId
                                                                        ? 'btn-outline-secondary'
                                                                        : 'btn-outline-primary'
                                                                }`}
                                                                onClick={() =>
                                                                    setActiveReviewProductId((prev) =>
                                                                        prev === item.productId ? null : item.productId
                                                                    )
                                                                }
                                                            >
                                                                <Star size={14} className="me-1" />
                                                                {activeReviewProductId === item.productId
                                                                    ? 'Cancel'
                                                                    : 'Review'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {activeReviewProductId === item.productId && (
                                                        <div className="mt-4 p-4 bg-light rounded">
                                                            <h6 className="fw-semibold mb-3">Leave a Review</h6>
                                                            <div className="mb-3">
                                                                <label className="form-label fw-semibold">Rating</label>
                                                                {renderStars(item.productId)}
                                                            </div>
                                                            <div className="mb-3">
                                                                <label className="form-label fw-semibold">Comment</label>
                                                                <textarea
                                                                    className="form-control"
                                                                    rows="3"
                                                                    placeholder="Write your review..."
                                                                    value={reviewText[item.productId] || ''}
                                                                    onChange={(e) =>
                                                                        setReviewText((prev) => ({
                                                                            ...prev,
                                                                            [item.productId]: e.target.value,
                                                                        }))
                                                                    }
                                                                />
                                                            </div>
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() =>
                                                                    handleSubmitReview(item.productId, item.sellerId)
                                                                }
                                                            >
                                                                Submit Review
                                                            </button>
                                                            {messages[item.productId] && (
                                                                <div className={`alert mt-3 mb-0 ${
                                                                    messages[item.productId].includes('successfully')
                                                                        ? 'alert-success'
                                                                        : 'alert-warning'
                                                                }`}>
                                                                    {messages[item.productId]}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
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
                                <div className="card-header bg-info text-white">
                                    <h4 className="mb-0 fw-semibold">Order Summary</h4>
                                </div>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted">Items Total</span>
                                        <span className="fw-semibold fs-5">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted">Discount</span>
                                        <span className="text-success fw-semibold fs-5">-${discount.toFixed(2)}</span>
                                    </div>
                                    <hr className="my-3" />
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <span className="fw-bold fs-4">Grand Total</span>
                                        <span className="fw-bold fs-4 text-primary">${total.toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="alert alert-info">
                                        <small>
                                            📄 You can download a PDF receipt of your order using the button below.
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="card shadow-sm border-0 mt-4">
                                <div className="card-body bg-success text-white text-center">
                                    <CheckCircle size={32} className="mb-2" />
                                    <h6 className="fw-semibold mb-1">Order Confirmed</h6>
                                    <small>Your order is being processed</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="d-flex gap-3 justify-content-center">
                            <button 
                                className="btn btn-outline-primary btn-lg px-4"
                                onClick={handleBackToCart}
                            >
                                <ArrowLeft className="me-2" size={20} />
                                Back to Cart
                            </button>
                            <button 
                                className="btn btn-success btn-lg px-4"
                                onClick={generatePDF}
                            >
                                <Download className="me-2" size={20} />
                                Download PDF Receipt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderPage;