import React, { useState, useRef, useEffect } from 'react';
import {
    Menu,
    Search,
    User,
    LogOut,
    ChevronDown,
    ShoppingCart,
    Settings as SettingsIcon
} from 'lucide-react';
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

    // ── Cart state ──
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    // ── Product detail modal state ──
    const [detailProduct, setDetailProduct] = useState(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('');
    };

    // ── Cart operations ──
    const addToCart = (product, qty = 1) => {
        setCart((prev) => {
            const existing = prev.find((item) => item._id === product._id);
            if (existing) {
                return prev.map((item) =>
                    item._id === product._id
                        ? { ...item, qty: item.qty + qty }
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
                qty
            }];
        });
    };

    const updateCartQty = (productId, newQty) => {
        if (newQty <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item._id === productId ? { ...item, qty: newQty } : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((item) => item._id !== productId));
    };

    const submitCart = () => {
        console.log('═══ SOLICITUD DE SALIDA ═══');
        console.log('Fecha:', new Date().toLocaleString('es-MX'));
        console.log('Vendedor:', userData?.name || 'Desconocido');
        console.log('Artículos:', cart.length);
        console.log('Detalle:', JSON.parse(JSON.stringify(cart)));
        console.log('Total:', cart.reduce((sum, item) => sum + item.price * item.qty, 0));
        console.log('═══════════════════════════');
        setCart([]);
    };

    const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

    // Render the active view content
    const renderView = () => {
        switch (currentView) {
            case 'user-dashboard':
                return <UserDashboard userName={userData?.name} />;
            case 'user-catalog':
                return (
                    <ProductCatalog
                        onAddToCart={addToCart}
                        onViewDetail={(product) => setDetailProduct(product)}
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
                    {/* Hamburger (mobile/tablet) */}
                    <button
                        className="user-navbar-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menú"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Brand */}
                    <div className="user-navbar-brand">
                        <img src="/logo.png" alt="INV 360" className="user-navbar-logo" />
                        <span className="user-navbar-title">INV 360</span>
                    </div>

                    {/* Search placeholder */}
                    <div className="user-navbar-search">
                        <div className="user-search-wrapper">
                            <Search className="user-search-icon" />
                            <input
                                type="text"
                                className="user-search-input"
                                placeholder="Buscar productos..."
                                readOnly
                            />
                        </div>
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

                            {/* Dropdown content */}
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
                />
            )}

            {/* ═══ Cart Drawer ═══ */}
            <CartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                cart={cart}
                onUpdateQty={updateCartQty}
                onRemoveItem={removeFromCart}
                onSubmit={submitCart}
            />
        </div>
    );
};

export default UserLayout;
