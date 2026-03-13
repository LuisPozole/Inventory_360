import React, { useState } from 'react';
import {
    X,
    Package,
    ShoppingCart,
    CheckCircle,
    Minus,
    Plus
} from 'lucide-react';
import './ProductDetail.css';

const API_BASE = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).origin
    : 'http://localhost:3000';

const ProductDetail = ({ product, onClose, onAddToCart }) => {
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    if (!product) return null;

    const isCritical = product.status === 'Critico';
    const categoryName = product.category?.name || 'Sin categoría';
    const imageUrl = product.imageUrl
        ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl}`)
        : null;

    const formatPrice = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    const handleAdd = () => {
        onAddToCart(product, qty);
        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            onClose();
        }, 1200);
    };

    // Close on overlay click
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="user-detail-overlay" onClick={handleOverlayClick}>
            <div className="user-detail-modal">
                {/* Close */}
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
                </div>

                {/* Body */}
                <div className="user-detail-body">
                    {/* Title */}
                    <div className="user-detail-title-row">
                        <span className="user-detail-category">{categoryName}</span>
                        <h2 className="user-detail-name">{product.name}</h2>
                        <span className="user-detail-sku">{product.sku}</span>
                    </div>

                    {/* Description */}
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
                            <span className={`user-detail-stat-value ${isCritical
                                ? 'user-detail-stat-value--critical'
                                : 'user-detail-stat-value--stock'
                                }`}>
                                {product.stock} uds
                            </span>
                        </div>
                        <div className="user-detail-stat">
                            <span className="user-detail-stat-label">Estado</span>
                            <span className="user-detail-stat-value user-detail-stat-value--status">
                                {isCritical ? 'Crítico' : 'Normal'}
                            </span>
                        </div>
                    </div>

                    {/* Add to cart */}
                    {!added ? (
                        <div className="user-detail-cart-row">
                            <div className="user-detail-qty-control">
                                <button
                                    className="user-detail-qty-btn"
                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    disabled={qty <= 1}
                                >
                                    <Minus size={16} />
                                </button>
                                <input
                                    type="text"
                                    className="user-detail-qty-value"
                                    value={qty}
                                    readOnly
                                />
                                <button
                                    className="user-detail-qty-btn"
                                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                                    disabled={qty >= product.stock}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button
                                className="user-detail-add-btn"
                                onClick={handleAdd}
                                disabled={product.stock === 0}
                            >
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
