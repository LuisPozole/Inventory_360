import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Grid3X3,
    List,
    Package,
    X,
    AlertCircle,
    RefreshCw,
    SearchX,
    ShoppingCart,
    Eye
} from 'lucide-react';
import api from '../../config/api';
import './ProductCatalog.css';

const API_BASE = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).origin
    : 'http://localhost:3000';

const ProductCatalog = ({ onAddToCart, onViewDetail }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Debounce timer ref
    const [debounceTimer, setDebounceTimer] = useState(null);

    // ── Load categories on mount ──
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await api.get('/products/categories');
                setCategories(res.data);
            } catch (err) {
                console.error('Error loading categories:', err);
            }
        };
        loadCategories();
    }, []);

    // ── Fetch products (called on filter change) ──
    const fetchProducts = useCallback(async (search, category, status) => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (search.trim()) params.search = search.trim();
            if (category) params.category = category;
            if (status) params.status = status;

            const res = await api.get('/products', { params });
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('No se pudieron cargar los productos.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Initial load ──
    useEffect(() => {
        fetchProducts('', '', '');
    }, [fetchProducts]);

    // ── Debounced search ──
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (debounceTimer) clearTimeout(debounceTimer);
        const timer = setTimeout(() => {
            fetchProducts(value, selectedCategory, selectedStatus);
        }, 400);
        setDebounceTimer(timer);
    };

    // ── Category filter ──
    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setSelectedCategory(value);
        fetchProducts(searchTerm, value, selectedStatus);
    };

    // ── Status filter ──
    const handleStatusChange = (e) => {
        const value = e.target.value;
        setSelectedStatus(value);
        fetchProducts(searchTerm, selectedCategory, value);
    };

    // ── Clear all filters ──
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedStatus('');
        fetchProducts('', '', '');
    };

    const hasActiveFilters = searchTerm || selectedCategory || selectedStatus;

    // ── Format currency ──
    const formatPrice = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    // ════════════════════════════════════════════════════════
    // PRODUCT CARD SUB-COMPONENT
    // ════════════════════════════════════════════════════════
    const ProductCard = ({ product }) => {
        const isCritical = product.status === 'Critico';
        const categoryName = product.category?.name || 'Sin categoría';
        const imageUrl = product.imageUrl
            ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl}`)
            : null;

        return (
            <div
                className="user-catalog-card"
                onClick={() => onViewDetail && onViewDetail(product)}
                style={{ cursor: onViewDetail ? 'pointer' : 'default' }}
            >
                {/* Image */}
                <div className="user-catalog-card-image">
                    {imageUrl ? (
                        <img src={imageUrl} alt={product.name} loading="lazy" />
                    ) : (
                        <Package size={40} className="user-catalog-card-image-placeholder" />
                    )}
                    {viewMode === 'grid' && (
                        <span className={`user-catalog-card-status user-catalog-card-status--${product.status}`}>
                            {isCritical ? 'Crítico' : 'En Stock'}
                        </span>
                    )}
                </div>

                {/* Body */}
                <div className="user-catalog-card-body">
                    <div className="user-catalog-card-info">
                        <span className="user-catalog-card-category">{categoryName}</span>
                        <span className="user-catalog-card-name">{product.name}</span>
                        <span className="user-catalog-card-sku">{product.sku}</span>
                    </div>

                    <div className="user-catalog-card-footer">
                        <span className="user-catalog-card-price">{formatPrice(product.price)}</span>
                        <span className={`user-catalog-card-stock ${isCritical
                            ? 'user-catalog-card-stock--critical'
                            : 'user-catalog-card-stock--normal'
                            }`}>
                            <Package size={14} />
                            {product.stock} uds
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div className="user-catalog-card-actions">
                        {onAddToCart && (
                            <button
                                className="user-catalog-card-add-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToCart(product, 1);
                                }}
                                title="Agregar a solicitud"
                            >
                                <ShoppingCart size={14} />
                            </button>
                        )}
                        {onViewDetail && (
                            <button
                                className="user-catalog-card-detail-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetail(product);
                                }}
                                title="Ver detalle"
                            >
                                <Eye size={14} />
                            </button>
                        )}
                    </div>

                    {/* Status badge in list mode */}
                    {viewMode === 'list' && (
                        <span className={`user-catalog-card-status user-catalog-card-status--${product.status}`}>
                            {isCritical ? 'Crítico' : 'En Stock'}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // ════════════════════════════════════════════════════════
    // SKELETON LOADING
    // ════════════════════════════════════════════════════════
    if (loading && products.length === 0) {
        return (
            <div className="user-catalog-skeleton">
                {/* Filter skeleton */}
                <div className="user-catalog-skeleton-filters">
                    <div className="user-skeleton-pulse user-catalog-skel-line" style={{ flex: 1, height: '42px', borderRadius: '12px' }} />
                    <div className="user-skeleton-pulse user-catalog-skel-line" style={{ width: '160px', height: '42px', borderRadius: '12px' }} />
                </div>
                {/* Card skeletons */}
                <div className="user-catalog-skeleton-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div className="user-catalog-skeleton-card" key={i}>
                            <div className="user-skeleton-pulse user-catalog-skeleton-img" />
                            <div className="user-catalog-skeleton-body">
                                <div className="user-skeleton-pulse user-catalog-skel-line user-catalog-skel-line--xs" />
                                <div className="user-skeleton-pulse user-catalog-skel-line user-catalog-skel-line--md" />
                                <div className="user-skeleton-pulse user-catalog-skel-line user-catalog-skel-line--sm" />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                    <div className="user-skeleton-pulse user-catalog-skel-line user-catalog-skel-line--lg" />
                                    <div className="user-skeleton-pulse user-catalog-skel-line user-catalog-skel-line--xs" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════
    // ERROR STATE
    // ════════════════════════════════════════════════════════
    if (error && products.length === 0) {
        return (
            <div className="user-catalog-error user-fade-in">
                <div className="user-catalog-error-icon">
                    <AlertCircle size={28} />
                </div>
                <h3>Error al cargar el catálogo</h3>
                <p>{error}</p>
                <button className="user-catalog-retry-btn" onClick={() => fetchProducts(searchTerm, selectedCategory, selectedStatus)}>
                    <RefreshCw size={16} />
                    Reintentar
                </button>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════
    // CATALOG VIEW
    // ════════════════════════════════════════════════════════
    return (
        <div className="user-catalog">
            {/* Header */}
            <div className="user-catalog-header">
                <h1>Catálogo de Productos</h1>
                <span className="user-catalog-count">
                    {products.length} producto{products.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Filters */}
            <div className="user-catalog-filters">
                <div className="user-catalog-filters-row">
                    {/* Search */}
                    <div className="user-catalog-search-wrapper">
                        <Search className="user-catalog-search-icon" />
                        <input
                            type="text"
                            className="user-catalog-search"
                            placeholder="Buscar por nombre o SKU..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Category filter */}
                    <select
                        className="user-catalog-select"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* Status filter */}
                    <select
                        className="user-catalog-select"
                        value={selectedStatus}
                        onChange={handleStatusChange}
                    >
                        <option value="">Todos los estados</option>
                        <option value="en_stock">En Stock</option>
                        <option value="stock_bajo">Stock Bajo</option>
                        <option value="stock_critico">Stock Crítico</option>
                    </select>
                </div>

                <div className="user-catalog-filters-actions">
                    {/* Clear filters */}
                    {hasActiveFilters && (
                        <button className="user-catalog-clear-btn" onClick={clearFilters}>
                            <X size={14} />
                            Limpiar filtros
                        </button>
                    )}

                    {/* View toggle */}
                    <div className="user-catalog-view-toggle" style={{ marginLeft: 'auto' }}>
                        <button
                            className={`user-catalog-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            aria-label="Vista cuadrícula"
                        >
                            <Grid3X3 size={16} />
                        </button>
                        <button
                            className={`user-catalog-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            aria-label="Vista lista"
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products or Empty state */}
            {products.length > 0 ? (
                <div className={viewMode === 'grid' ? 'user-catalog-grid' : 'user-catalog-list'}>
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="user-catalog-empty">
                    <div className="user-catalog-empty-icon">
                        <SearchX size={32} />
                    </div>
                    <h3>No se encontraron productos</h3>
                    <p>
                        {hasActiveFilters
                            ? 'Intenta ajustar tus filtros de búsqueda para encontrar lo que necesitas.'
                            : 'Aún no hay productos registrados en el inventario.'}
                    </p>
                    {hasActiveFilters && (
                        <button className="user-catalog-clear-btn" onClick={clearFilters}>
                            <X size={14} />
                            Limpiar filtros
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductCatalog;
