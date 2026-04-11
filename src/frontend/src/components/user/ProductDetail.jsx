import React, { useState } from 'react';
import {
    X,
    Package,
    ShoppingCart,
    CheckCircle,
    Minus,
    Plus,
    Ban
} from 'lucide-react';
import './ProductDetail.css';

const API_BASE = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).origin
    : 'http://localhost:3000';

const ProductDetail = ({ product, onClose, onAddToCart, cart = [] }) => {
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    if (!product) return null;

    const isCritical = product.status === 'Critico';
    const isSoldOut = product.stock === 0;
    const categoryName = product.category?.name || 'Sin categoría';
    const imageUrl = product.imageUrl
        ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl}`)
        : null;

    // Calculate available stock considering items already in cart
    const inCart = cart.find((item) => item._id === product._id)?.qty || 0;
    const availableStock = product.stock - inCart;

    const formatPrice = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    const handleAdd = () => {
        if (availableStock <= 0) return;
        onAddToCart(product, qty);
        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            onClose();
        }, 1200);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="user-detail-overlay" onClick={handleOverlayClick}>
            <div className="user-detail-modal">
                <button className="user-detail-close" onClick={onClose}>
                    <X size={18} />
                </button>

                {/* Image */}
                <div className="user-detail-image">
                    {imageUrl ? (
                        <img src={imageUrl} alt={product.name} />
                    ) : (
                        <Package size={64} className="user-detail-image-placeholder" />
                    )}
                    {isSoldOut && (
                        <div className="user-detail-soldout-overlay">
                            <Ban size={32} />
                            <span>Agotado</span>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="user-detail-body">
                    <div className="user-detail-title-row">
                        <span className="user-detail-category">{categoryName}</span>
                        <h2 className="user-detail-name">{product.name}</h2>
                        <span className="user-detail-sku">{product.sku}</span>
                    </div>

                    {product.description && (
                        <p className="user-detail-description">{product.description}</p>
                    )}

                    {/* Stats */}
                    <div className="user-detail-stats">
                        <div className="user-detail-stat">
                            <span className="user-detail-stat-label">Precio</span>
                            <span className="user-detail-stat-value user-detail-stat-value--price">
                                {formatPrice(product.price)}
                            </span>
                        </div>
                        <div className="user-detail-stat">
                            <span className="user-detail-stat-label">Stock</span>
                            <span className={`user-detail-stat-value ${
                                isSoldOut || isCritical
                                    ? 'user-detail-stat-value--critical'
                                    : 'user-detail-stat-value--stock'
                            }`}>
                                {isSoldOut ? 'Agotado' : `${product.stock} uds`}
                            </span>
                        </div>
                        <div className="user-detail-stat">
                            <span className="user-detail-stat-label">Estado</span>
                            <span className="user-detail-stat-value user-detail-stat-value--status">
                                {isSoldOut ? 'Agotado' : isCritical ? 'Crítico' : 'Normal'}
                            </span>
                        </div>
                    </div>

                    {/* In-cart notice */}
                    {inCart > 0 && !isSoldOut && (
                        <div className="user-detail-in-cart-notice">
                            Ya tienes {inCart} unidad{inCart !== 1 ? 'es' : ''} en tu solicitud.
                            {availableStock > 0
                                ? ` Puedes agregar hasta ${availableStock} más.`
                                : ' No puedes agregar más.'}
                        </div>
                    )}

                    {/* Add to cart or Sold out */}
                    {isSoldOut || availableStock <= 0 ? (
                        <div className="user-detail-soldout-msg">
                            <Ban size={20} />
                            {isSoldOut
                                ? 'Este producto está agotado.'
                                : 'Ya agregaste el máximo disponible a tu solicitud.'}
                        </div>
                    ) : !added ? (
                        <div className="user-detail-cart-row">
                            <div className="user-detail-qty-control">
                                <button
                                    className="user-detail-qty-btn"
                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    disabled={qty <= 1}
                                >
                                    <Minus size={16} />
                                </button>
                                <input type="text" className="user-detail-qty-value" value={qty} readOnly />
                                <button
                                    className="user-detail-qty-btn"
                                    onClick={() => setQty((q) => Math.min(availableStock, q + 1))}
                                    disabled={qty >= availableStock}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button className="user-detail-add-btn" onClick={handleAdd}>
                                <ShoppingCart size={18} />
                                Agregar a solicitud
                            </button>
                        </div>
                    ) : (
                        <div className="user-detail-added">
                            <CheckCircle size={20} />
                            Agregado correctamente
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
