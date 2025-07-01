import './Cart.css';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function OrderPage() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const cartItems = state?.cartItems;
    const subtotal = state?.subtotal;
    const discount = state?.discount;
    const total = state?.total;
    const handleBackToCart = () => {
        navigate('/cart');
    };

    const generatePDF = async () => {
        const input = document.getElementById('receipt');
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

    return (
        <>
            <div id="receipt" className="cart-container">
                <div className="cart-left">
                    <h2>Order Confirmation</h2>
                    <p>Thank you for your purchase!</p>
                    <p>Your order has been placed successfully.</p>

                    <h3>Order Receipt</h3>
                    {cartItems.length === 0 ? (
                        <p>No items found.</p>
                    ) : (
                        <div className="cart-items">
                            {cartItems.map((item, index) => (
                                <div key={index} className="cart-card">
                                    <img
                                        src={item.image[0]}
                                        alt={item.productName}
                                        crossOrigin="anonymous"
                                    />
                                    <div className="cart-info">
                                        <h4>{item.productName}</h4>
                                        <p>Price: ${item.price.toFixed(2)}</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
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
                <button className="checkout-btn" onClick={handleBackToCart}>Back to Cart</button>
                <button className="checkout-btn" onClick={generatePDF}>Download PDF Receipt</button>
            </div>
        </>
    );
}

export default OrderPage;
