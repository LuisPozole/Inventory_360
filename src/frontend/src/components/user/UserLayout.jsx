import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Menu,
    User,
    LogOut,
    ChevronDown,
    ShoppingCart,
    Settings as SettingsIcon
} from 'lucide-react';
import api from '../../config/api';
import UserSidebar from './UserSidebar';
import UserProfile from './UserProfile';
import UserDashboard from './UserDashboard';
import ProductCatalog from './ProductCatalog';
import ProductDetail from './ProductDetail';
import CartDrawer from './CartDrawer';
import Settings from '../Settings';
import './UserLayout.css';

const UserLayout = ({ userData, onLogout }) => {
    const [currentView, setCurrentView] = useState('user-dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // ── Elevated products state (shared across Catalog & Cart) ──
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState(null);

    // ── Cart state ──
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutMessage, setCheckoutMessage] = useState(null);

    // ── Product detail modal state ──
    const [detailProduct, setDetailProduct] = useState(null);

    // ── Filter state (elevated for ProductCatalog) ──
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    // ── Fetch products ──
    const fetchProducts = useCallback(async (search, category, status) => {
        setProductsLoading(true);
        setProductsError(null);
        try {
            const params = {};
            if (search?.trim()) params.search = search.trim();
            if (category) params.category = category;
            if (status) params.status = status;
            const res = await api.get('/products', { params });
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setProductsError('No se pudieron cargar los productos.');
        } finally {
            setProductsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchProducts('', '', '');
    }, [fetchProducts]);

    // ══════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map((w) => w[0]).slice(0, 2).join('');
    };

    // ══════════════════════════════════════════════════════════
    // CART OPERATIONS
    // ══════════════════════════════════════════════════════════
    const addToCart = (product, qty = 1) => {
        setCart((prev) => {
            const existing = prev.find((item) => item._id === product._id);
            const currentInCart = existing ? existing.qty : 0;
            const availableStock = product.stock - currentInCart;
            const safeQty = Math.min(qty, availableStock);
            if (safeQty <= 0) return prev;

            if (existing) {
                return prev.map((item) =>
                    item._id === product._id
                        ? { ...item, qty: item.qty + safeQty }
                        : item
                );
            }
            return [...prev, {
                _id: product._id,
                name: product.name,
                sku: product.sku,
                price: product.price,
                stock: product.stock,
                imageUrl: product.imageUrl,
                qty: safeQty
            }];
        });
    };

    const updateCartQty = (productId, newQty) => {
        if (newQty <= 0) {
            removeFromCart(productId);
            return;
        }
        const product = products.find((p) => p._id === productId);
        const maxQty = product ? product.stock : newQty;
        setCart((prev) =>
            prev.map((item) =>
                item._id === productId
                    ? { ...item, qty: Math.min(newQty, maxQty) }
                    : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((item) => item._id !== productId));
    };

    // ══════════════════════════════════════════════════════════
    // CHECKOUT — Real API + Optimistic UI
    // ══════════════════════════════════════════════════════════
    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setCheckoutLoading(true);
        setCheckoutMessage(null);

        // Snapshot for rollback
        const previousProducts = [...products];

        // ── Optimistic UI: reduce stock locally ──
        setProducts((prev) =>
            prev.map((product) => {
                const cartItem = cart.find((item) => item._id === product._id);
                if (!cartItem) return product;
                const newStock = Math.max(0, product.stock - cartItem.qty);
                return {
                    ...product,
                    stock: newStock,
                    status: newStock <= (product.criticalThreshold || 10) ? 'Critico' : 'Normal'
                };
            })
        );

        try {
            const payload = {
                items: cart.map((item) => ({
                    productId: item._id,
                    qty: item.qty
                }))
            };

            const res = await api.post('/checkout', payload);

            // Sync with server response
            if (res.data.updatedProducts) {
                setProducts((prev) =>
                    prev.map((product) => {
                        const updated = res.data.updatedProducts.find((u) => u._id === product._id);
                        return updated || product;
                    })
                );
            }

            setCart([]);
            setCheckoutMessage({
                type: 'success',
                text: res.data.msg || 'Solicitud procesada correctamente.'
            });
            setTimeout(() => setCheckoutMessage(null), 4000);

        } catch (err) {
            console.error('Error en checkout:', err);
            // Rollback
            setProducts(previousProducts);
            const errorMsg = err.response?.data?.msg || 'Error al procesar la solicitud.';
            setCheckoutMessage({ type: 'error', text: errorMsg });
            setTimeout(() => setCheckoutMessage(null), 5000);
        } finally {
            setCheckoutLoading(false);
        }
    };

    const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

    // ══════════════════════════════════════════════════════════
    // VIEW RENDERING
    // ══════════════════════════════════════════════════════════
    const renderView = () => {
        switch (currentView) {
            case 'user-dashboard':
                return <UserDashboard userName={userData?.name} />;
            case 'user-catalog':
                return (
                    <ProductCatalog
                        products={products}
                        categories={categories}
                        loading={productsLoading}
                        error={productsError}
                        onFetchProducts={fetchProducts}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedStatus={selectedStatus}
                        onStatusChange={setSelectedStatus}
                        onAddToCart={addToCart}
                        onViewDetail={(product) => setDetailProduct(product)}
                        cart={cart}
                    />
                );
            case 'user-profile':
                return <UserProfile />;
            case 'user-settings':
                return <Settings onBack={() => setCurrentView('user-dashboard')} userData={userData} />;
            default:
                return null;
        }
    };

    return (
        <div className="user-layout">
            {/* ═══ Sidebar ═══ */}
            <UserSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                currentView={currentView}
                onNavigate={setCurrentView}
                onLogout={onLogout}
            />

            {/* ═══ Main Area ═══ */}
            <div className="user-main">
                {/* ── Top Navbar ── */}
                <header className="user-navbar">
                    <button
                        className="user-navbar-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menú"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="user-navbar-brand">
                        <img src="/logo.png" alt="INV 360" className="user-navbar-logo" />
                        <span className="user-navbar-title">INV 360</span>
                    </div>

                    {/* Actions: Cart + Avatar */}
                    <div className="user-navbar-actions">
                        {/* Cart button */}
                        <button
                            className="user-cart-nav-btn"
                            onClick={() => setCartOpen(true)}
                            aria-label="Ver solicitud"
                        >
                            <ShoppingCart size={18} />
                            {totalCartItems > 0 && (
                                <span className="user-cart-nav-badge">{totalCartItems}</span>
                            )}
                        </button>

                        {/* User dropdown */}
                        <div className="user-dropdown" ref={dropdownRef}>
                            <button
                                className="user-avatar-btn"
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                aria-label="Menú de usuario"
                            >
                                <div className="user-avatar-circle">
                                    {userData?.profileImage ? (
                                        <img
                                            src={
                                                userData.profileImage.startsWith('http')
                                                    ? userData.profileImage
                                                    : `${window.location.origin}/${userData.profileImage}`
                                            }
                                            alt={userData.name}
                                        />
                                    ) : (
                                        getInitials(userData?.name)
                                    )}
                                </div>
                                <span className="user-avatar-name">
                                    {userData?.name || 'Vendedor'}
                                </span>
                                <ChevronDown size={14} />
                            </button>

                            <div className={`user-dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
                                <button
                                    className="user-dropdown-item"
                                    onClick={() => {
                                        setCurrentView('user-profile');
                                        setDropdownOpen(false);
                                    }}
                                >
                                    <User size={18} />
                                    Mi Perfil
                                </button>
                                <button
                                    className="user-dropdown-item"
                                    onClick={() => {
                                        setCurrentView('user-settings');
                                        setDropdownOpen(false);
                                    }}
                                >
                                    <SettingsIcon size={18} />
                                    Configuración
                                </button>
                                <div className="user-dropdown-divider" />
                                <button
                                    className="user-dropdown-item user-dropdown-item--danger"
                                    onClick={onLogout}
                                >
                                    <LogOut size={18} />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Content area ── */}
                <main className="user-content">
                    {renderView()}
                </main>
            </div>

            {/* ═══ Product Detail Modal ═══ */}
            {detailProduct && (
                <ProductDetail
                    product={detailProduct}
                    onClose={() => setDetailProduct(null)}
                    onAddToCart={addToCart}
                    cart={cart}
                />
            )}

            {/* ═══ Cart Drawer ═══ */}
            <CartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                cart={cart}
                onUpdateQty={updateCartQty}
                onRemoveItem={removeFromCart}
                onSubmit={handleCheckout}
                isSubmitting={checkoutLoading}
                checkoutMessage={checkoutMessage}
            />

            {/* ═══ Global checkout toast ═══ */}
            {checkoutMessage && !cartOpen && (
                <div className={`user-checkout-toast user-checkout-toast--${checkoutMessage.type}`}>
                    {checkoutMessage.text}
                </div>
            )}
        </div>
    );
};

export default UserLayout;
