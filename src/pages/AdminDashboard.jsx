import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './AdminDashboard.css';

const statuses = ['En attente', 'Confirmée', 'Livrée', 'Annulée'];
const apiUrl = 'http://localhost:5000';

function formatDate(value) {
  return new Date(value).toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title: '', price: '', image: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const authorizedHeaders = { Authorization: `Bearer ${token}` };

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/orders`, { headers: authorizedHeaders }),
        fetch(`${apiUrl}/api/products`)
      ]);
      const ordersData = await ordersResponse.json();
      const productsData = await productsResponse.json();
      if (!ordersResponse.ok) throw new Error(ordersData.message || 'Impossible de charger les commandes.');
      if (!productsResponse.ok) throw new Error(productsData.message || 'Impossible de charger les produits.');
      setOrders(ordersData);
      setProducts(productsData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadDashboard();
  }, [token]);

  const updateStatus = async (orderId, status) => {
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { ...authorizedHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const updatedOrder = await response.json();
      if (!response.ok) throw new Error(updatedOrder.message || 'Impossible de modifier le statut.');
      setOrders((current) => current.map((order) => order._id === orderId ? updatedOrder : order));
      setMessage('Statut de la commande mis à jour.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const addProduct = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
        headers: { ...authorizedHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price) })
      });
      const product = await response.json();
      if (!response.ok) throw new Error(product.message || 'Impossible d’ajouter le produit.');
      setProducts((current) => [product, ...current]);
      setForm({ title: '', price: '', image: '' });
      setMessage('Produit ajouté avec succès.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: 'DELETE',
        headers: authorizedHeaders
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Impossible de supprimer le produit.');
      setProducts((current) => current.filter((product) => product._id !== productId));
      setMessage('Produit supprimé.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="admin-page">
      <header className="admin-heading">
        <div>
          <span className="admin-eyebrow">DZSHOP · ADMIN</span>
          <h1>Centre de commandes</h1>
          <p>Suivez les ventes et gardez votre catalogue à jour.</p>
        </div>
        <Link className="admin-store-link" to="/produits">Voir la boutique →</Link>
      </header>

      {message && <div className="admin-alert admin-alert-success">{message}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <section className="admin-stats">
        <div><span>Commandes</span><strong>{orders.length}</strong></div>
        <div><span>En attente</span><strong>{orders.filter((order) => order.status === 'En attente').length}</strong></div>
        <div><span>Produits</span><strong>{products.length}</strong></div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><span className="panel-kicker">ACTIVITÉ RÉCENTE</span><h2>Commandes</h2></div><span className="panel-count">{orders.length} au total</span></div>
        {loading ? <p className="admin-empty">Chargement des commandes...</p> : orders.length === 0 ? <p className="admin-empty">Aucune commande enregistrée.</p> : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead><tr><th>Client</th><th>Téléphone</th><th>Wilaya / Commune</th><th>Articles</th><th>Montant</th><th>Date</th><th>Statut</th></tr></thead>
              <tbody>{orders.map((order) => (
                <tr key={order._id}>
                  <td><strong>{order.userId}</strong></td>
                  <td>{order.shippingAddress?.phone || '-'}</td>
                  <td>{order.shippingAddress?.wilaya || '-'}<small>{order.shippingAddress?.city || '-'}</small></td>
                  <td>{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} article(s)</td>
                  <td><strong>{Number(order.totalPrice || 0).toLocaleString('fr-DZ')} DZD</strong></td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td><select className={`status-select status-${order.status?.replaceAll(' ', '-').toLowerCase()}`} value={order.status} onChange={(event) => updateStatus(order._id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      <div className="admin-lower-grid">
        <section className="admin-panel product-form-panel">
          <div className="admin-panel-heading"><div><span className="panel-kicker">CATALOGUE</span><h2>Ajouter un produit</h2></div></div>
          <form className="product-form" onSubmit={addProduct}>
            <label>Titre<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Nom du produit" /></label>
            <label>Prix (DZD)<input required min="0" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="8500" /></label>
            <label>Image URL<input required type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="https://..." /></label>
            <button type="submit">+ Ajouter le produit</button>
          </form>
        </section>

        <section className="admin-panel catalogue-panel">
          <div className="admin-panel-heading"><div><span className="panel-kicker">INVENTAIRE</span><h2>Produits récents</h2></div></div>
          <div className="catalogue-list">{products.slice(0, 5).map((product) => <div className="catalogue-item" key={product._id}><img src={product.image} alt="" /><div><strong>{product.nom}</strong><span>{Number(product.prix).toLocaleString('fr-DZ')} DZD</span></div><button type="button" onClick={() => deleteProduct(product._id)} title="Supprimer">×</button></div>)}</div>
        </section>
      </div>
    </main>
  );
}
