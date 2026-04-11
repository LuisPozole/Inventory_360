import React from 'react';
import {
    X,
    ShoppingCart,
    Package,
    Trash2,
    CheckCircle,
    Send,
    Loader2,
    AlertCircle
} from 'lucide-react';
import './CartDrawer.css';

const API_BASE = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).origin
    : 'http://localhost:3000';

const CartDrawer = ({
    isOpen,
    onClose,
    cart,
    onUpdateQty,
    onRemoveItem,
    onSubmit,
    isSubmitting = false,
    checkoutMessage = null
}) => {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    const formatPrice = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    const handleSubmit = async () => {
        await onSubmit();
    };

    const getImageUrl = (item) => {
        if (!item.imageUrl) return null;
        return item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE}${item.imageUrl}`;
    };

    return (
        <>
            {isOpen && <div className="user-cart-overlay" onClick={onClose} />}

            <div className={`user-cart-drawer ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="user-cart-header">
                    <h2>
                        <ShoppingCart size={20} />
                        Solicitud de Salida
                        {totalItems > 0 && (
                            <span className="user-cart-badge">{totalItems}</span>
                        )}
                    </h2>
                    <button className="user-cart-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {cart.length > 0 ? (
                    <>
                        <div className="user-cart-items">
                            {cart.map((item) => {
                                const imgUrl = getImageUrl(item);
                                return (
                                    <div className="user-cart-item" key={item._id}>
                                        <div className="user-cart-item-image">
                                            {imgUrl ? (
                                                <img src={imgUrl} alt={item.name} />
                                            ) : (
                                                <Package size={20} className="user-cart-item-image-placeholder" />
                                            )}
                                        </div>
                                        <div className="user-cart-item-info">
                                            <span className="user-cart-item-name">{item.name}</span>
                                            <span className="user-cart-item-sku">{item.sku}</span>
                                            <span className="user-cart-item-price">{formatPrice(item.price)}</span>
                                        </div>
                                        <div className="user-cart-item-actions">
                                            <div className="user-cart-qty-row">
                                                <button
                                                    className="user-cart-qty-btn"
                                                    onClick={() => onUpdateQty(item._id, item.qty - 1)}
                                                    disabled={isSubmitting}
                                                >−</button>
                                                <span className="user-cart-qty-value">{item.qty}</span>
                                                <button
                                                    className="user-cart-qty-btn"
                                                    onClick={() => onUpdateQty(item._id, item.qty + 1)}
                                                    disabled={isSubmitting || item.qty >= item.stock}
                                                >+</button>
                                            </div>
                                            <button
                                                className="user-cart-remove"
                                                onClick={() => onRemoveItem(item._id)}
                                                disabled={isSubmitting}
                                            >
                                                <Trash2 size={12} /> Quitar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="user-cart-footer">
                            {checkoutMessage && (
                                <div className={`user-cart-message user-cart-message--${checkoutMessage.type}`}>
                                    {checkoutMessage.type === 'success'
                                        ? <CheckCircle size={16} />
                                        : <AlertCircle size={16} />
                                    }
                                    {checkoutMessage.text}
                                </div>
                            )}

                            <div className="user-cart-summary">
                                <span className="user-cart-summary-label">
                                    {totalItems} artículo{totalItems !== 1 ? 's' : ''}
                                </span>
                                <span className="user-cart-summary-total">
                                    {formatPrice(cart.reduce((sum, item) => sum + item.price * item.qty, 0))}
                                </span>
                            </div>
                            <button
                                className="user-cart-submit-btn"
                                onClick={handleSubmit}
                                disabled={isSubmitting || cart.length === 0}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="user-cart-spinner" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Generar Solicitud de Salida
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="user-cart-empty">
                        <ShoppingCart size={48} />
                        {checkoutMessage?.type === 'success' ? (
                            <div className="user-cart-success-big">
                                <CheckCircle size={24} />
                                <p>{checkoutMessage.text}</p>
                            </div>
                        ) : (
                            <>
                                <p>Tu solicitud está vacía</p>
                                <p>Agrega productos desde el catálogo</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
