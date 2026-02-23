import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaPen, FaTrashAlt, FaExclamationTriangle, FaTimes, FaChevronDown, FaImage, FaTag } from 'react-icons/fa';
import api from '../config/api';
import './Inventory.css';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);

    // Category modal state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [savingCategory, setSavingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState('');

    // Form state
    const [form, setForm] = useState({
        sku: '', name: '', description: '', category: '',
        price: '', stock: '', criticalThreshold: '10', imageUrl: ''
    });

    const fetchProducts = useCallback(async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterCategory) params.category = filterCategory;
            if (filterStatus) params.status = filterStatus;

            const res = await api.get('/products', { params });
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }, [search, filterCategory, filterStatus]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/products/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setLoading(true);
        const debounce = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(debounce);
    }, [fetchProducts]);

    const getStatusInfo = (product) => {
        const { stock, criticalThreshold } = product;
        if (stock <= criticalThreshold) {
            return { label: 'Stock Crítico', className: 'status-critical' };
        } else if (stock <= criticalThreshold * 2) {
            return { label: 'Stock Bajo', className: 'status-low' };
        }
        return { label: 'En Stock', className: 'status-ok' };
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(price);
    };

    const generateSku = (name) => {
        if (!name.trim()) return '';
        const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 3);
        const prefix = words.map(w => w.substring(0, 3).toUpperCase()).join('-');
        const suffix = String(Math.floor(Math.random() * 900) + 100);
        return `${prefix}-${suffix}`;
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setForm({
            sku: '', name: '', description: '', category: '',
            price: '', stock: '', criticalThreshold: '10', imageUrl: ''
        });
        setFormError('');
        setSkuManuallyEdited(false);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setForm({
            sku: product.sku,
            name: product.name,
            description: product.description || '',
            category: product.category?._id || product.category || '',
            price: String(product.price),
            stock: String(product.stock),
            criticalThreshold: String(product.criticalThreshold || 10),
            imageUrl: product.imageUrl || ''
        });
        setFormError('');
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        // Intercept "create new category" option
        if (name === 'category' && value === '__new__') {
            setCategoryError('');
            setCategoryForm({ name: '', description: '' });
            setShowCategoryModal(true);
            return;
        }

        if (name === 'sku') {
            setSkuManuallyEdited(true);
        }

        setForm(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'name' && !editingProduct && !skuManuallyEdited) {
                updated.sku = generateSku(value);
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError('');

        const payload = {
            sku: form.sku,
            name: form.name,
            description: form.description,
            category: form.category,
            price: Number(form.price),
            stock: Number(form.stock),
            criticalThreshold: Number(form.criticalThreshold),
            imageUrl: form.imageUrl
        };

        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, payload);
            } else {
                await api.post('/products', payload);
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            const msg = err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error al guardar el producto';
            setFormError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            setShowDeleteConfirm(null);
            fetchProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        setSavingCategory(true);
        setCategoryError('');
        try {
            const res = await api.post('/products/categories', categoryForm);
            setShowCategoryModal(false);
            setCategoryForm({ name: '', description: '' });
            await fetchCategories();
            // Auto-select the newly created category in the product form if the product modal is open
            if (showModal) {
                setForm(prev => ({ ...prev, category: res.data._id }));
            }
        } catch (err) {
            const msg = err.response?.data?.msg || 'Error al crear la categoría';
            setCategoryError(msg);
        } finally {
            setSavingCategory(false);
        }
    };

    // Skeleton rows
    const SkeletonRow = () => (
        <tr className="inv-skeleton-row">
            {[...Array(8)].map((_, i) => (
                <td key={i}><div className="inv-skeleton-cell"></div></td>
            ))}
        </tr>
    );

    return (
        <div className="inventory-container">
            {/* Section Header */}
            <div className="inv-header">
                <div>
                    <h1 className="inv-section-title">Sección: Inventario</h1>
                    <h2 className="inv-subtitle">Gestión de Inventario</h2>
                    <p className="inv-description">Administra y controla todos los productos de tu inventario</p>
                </div>
            </div>

            {/* Toolbar: Search + Filters + Add Button */}
            <div className="inv-toolbar">
                <div className="inv-search">
                    <FaSearch className="inv-search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="inv-filters">
                    <div className="inv-select-wrapper">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        <FaChevronDown className="inv-select-arrow" />
                    </div>

                    <div className="inv-select-wrapper">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            <option value="en_stock">En Stock</option>
                            <option value="stock_bajo">Stock Bajo</option>
                            <option value="stock_critico">Stock Crítico</option>
                        </select>
                        <FaChevronDown className="inv-select-arrow" />
                    </div>
                </div>

                <div className="inv-toolbar-actions">
                    <button className="inv-add-cat-btn" onClick={() => { setCategoryError(''); setShowCategoryModal(true); }}>
                        <FaTag />
                        Nueva Categoría
                    </button>
                    <button className="inv-add-btn" onClick={openAddModal}>
                        <FaPlus />
                        Agregar Producto
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="inv-table-card">
                <div className="inv-table-wrapper">
                    <table className="inv-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Imagen</th>
                                <th>Nombre del Producto</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="inv-empty">
                                        <div className="inv-empty-content">
                                            <FaImage size={40} />
                                            <p>No se encontraron productos</p>
                                            <span>Intenta ajustar los filtros o agrega un nuevo producto</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => {
                                    const statusInfo = getStatusInfo(product);
                                    return (
                                        <tr key={product._id} className="inv-row">
                                            <td className="inv-sku">{product.sku}</td>
                                            <td>
                                                <div className="inv-img-wrapper">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.name} />
                                                    ) : (
                                                        <div className="inv-img-placeholder">
                                                            <FaImage />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="inv-product-name">{product.name}</td>
                                            <td>
                                                <span className="inv-category-badge">
                                                    {product.category?.name || 'Sin categoría'}
                                                </span>
                                            </td>
                                            <td className="inv-price">{formatPrice(product.price)}</td>
                                            <td className={`inv-stock ${statusInfo.className}`}>
                                                {statusInfo.className === 'status-critical' && (
                                                    <FaExclamationTriangle className="inv-stock-warn" />
                                                )}
                                                {product.stock} uds.
                                            </td>
                                            <td>
                                                <span className={`inv-status-badge ${statusInfo.className}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="inv-actions">
                                                    <button
                                                        className="inv-action-btn edit"
                                                        onClick={() => openEditModal(product)}
                                                        title="Editar"
                                                    >
                                                        <FaPen />
                                                    </button>
                                                    <button
                                                        className="inv-action-btn delete"
                                                        onClick={() => setShowDeleteConfirm(product)}
                                                        title="Eliminar"
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="inv-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="inv-modal-header">
                            <h3>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</h3>
                            <button className="inv-modal-close" onClick={() => setShowModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        {formError && (
                            <div className="inv-form-error">{formError}</div>
                        )}

                        <form onSubmit={handleSubmit} className="inv-form">
                            <div className="inv-form-row">
                                <div className="inv-form-group">
                                    <label>SKU</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={form.sku}
                                        onChange={handleFormChange}
                                        placeholder="Ej: LAP-HP-15-001"
                                        required
                                    />
                                </div>
                                <div className="inv-form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        placeholder="Nombre del producto"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="inv-form-group">
                                <label>Descripción</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleFormChange}
                                    placeholder="Descripción opcional del producto"
                                    rows={2}
                                />
                            </div>

                            <div className="inv-form-row">
                                <div className="inv-form-group">
                                    <label>Categoría</label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                        <option value="__new__">+ Crear nueva categoría...</option>
                                    </select>
                                </div>
                                <div className="inv-form-group">
                                    <label>Precio</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={handleFormChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="inv-form-row">
                                <div className="inv-form-group">
                                    <label>Stock</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="inv-form-group">
                                    <label>Umbral Crítico</label>
                                    <input
                                        type="number"
                                        name="criticalThreshold"
                                        value={form.criticalThreshold}
                                        onChange={handleFormChange}
                                        placeholder="10"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="inv-form-group">
                                <label>URL de Imagen</label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={form.imageUrl}
                                    onChange={handleFormChange}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                            </div>

                            <div className="inv-form-actions">
                                <button
                                    type="button"
                                    className="inv-btn-cancel"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="inv-btn-save"
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : (editingProduct ? 'Guardar Cambios' : 'Crear Producto')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="inv-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="inv-modal inv-modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="inv-delete-confirm">
                            <div className="inv-delete-icon">
                                <FaTrashAlt />
                            </div>
                            <h3>¿Eliminar producto?</h3>
                            <p>Estás a punto de eliminar <strong>{showDeleteConfirm.name}</strong>. Esta acción no se puede deshacer.</p>
                            <div className="inv-form-actions">
                                <button
                                    className="inv-btn-cancel"
                                    onClick={() => setShowDeleteConfirm(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="inv-btn-delete"
                                    onClick={() => handleDelete(showDeleteConfirm._id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Creation Modal */}
            {showCategoryModal && (
                <div className="inv-modal-overlay" onClick={() => setShowCategoryModal(false)}>
                    <div className="inv-modal inv-modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="inv-modal-header">
                            <h3>Nueva Categoría</h3>
                            <button className="inv-modal-close" onClick={() => setShowCategoryModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        {categoryError && (
                            <div className="inv-form-error">{categoryError}</div>
                        )}

                        <form onSubmit={handleCreateCategory} className="inv-form">
                            <div className="inv-form-group">
                                <label>Nombre de la Categoría</label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ej: Electrónica, Accesorios..."
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="inv-form-group">
                                <label>Descripción (opcional)</label>
                                <textarea
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descripción de la categoría"
                                    rows={2}
                                />
                            </div>
                            <div className="inv-form-actions">
                                <button
                                    type="button"
                                    className="inv-btn-cancel"
                                    onClick={() => setShowCategoryModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="inv-btn-save"
                                    disabled={savingCategory}
                                >
                                    {savingCategory ? 'Creando...' : 'Crear Categoría'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
