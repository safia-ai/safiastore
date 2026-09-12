import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import { AuthContext } from './AuthContext';
import './CheckoutPage.css';

const wilayas = ['Alger', 'Oran', 'Constantine', 'Blida', 'Sétif', 'Annaba'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, panier, total, livraison, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const items = panier || cart || [];
  const subtotal = total !== undefined
    ? total
    : items.reduce((sum, item) => sum + (item.price || item.prix || 0) * (item.quantity || item.qte || 1), 0);
  const shipping = livraison !== undefined ? livraison : (subtotal >= 10000 || subtotal === 0 ? 0 : 500);
  const grandTotal = subtotal + shipping;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    if (!token || !user) {
      setError('Votre session a expiré. Veuillez vous reconnecter.');
      setSaving(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const order = {
      items: items.map((item) => ({
        productId: String(item._id || item.id),
        title: item.title || item.nom || 'Produit',
        price: item.price || item.prix || 0,
        quantity: item.quantity || item.qte || 1,
        image: item.image
      })),
      shippingAddress: {
        phone: formData.get('phone'),
        wilaya: formData.get('wilaya'),
        city: formData.get('city'),
        postcode: formData.get('postcode'),
        district: formData.get('district'),
        street: formData.get('street')
      },
      totalPrice: grandTotal
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(order)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Impossible d’enregistrer la commande.');
      clearCart();
      navigate('/order-success');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="checkout-page">
      <div className="checkout-heading">
        <div>
          <span className="checkout-eyebrow">DZSHOP CHECKOUT</span>
          <h1>Finaliser votre commande</h1>
          <p>Livraison rapide et paiement à la réception partout en Algérie.</p>
        </div>
        <Link className="checkout-back" to="/panier">← Retour au panier</Link>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-section-heading">
            <span className="step-number">01</span>
            <div><h2>Adresse de livraison</h2><p>Où souhaitez-vous recevoir votre commande ?</p></div>
          </div>

          <div className="checkout-fields">
            <label className="checkout-field checkout-field-full">
              <span>Phone Number <b>*</b></span>
              <div className="phone-input"><strong>DZ +213</strong><input required name="phone" type="tel" placeholder="06 00 00 00 00" /></div>
            </label>
            <label className="checkout-field"><span>Wilaya <b>*</b></span><select required name="wilaya" defaultValue=""><option value="" disabled>Choisir une wilaya</option>{wilayas.map((wilaya) => <option key={wilaya}>{wilaya}</option>)}</select></label>
            <label className="checkout-field"><span>Commune / City <b>*</b></span><input required name="city" type="text" placeholder="Votre commune" /></label>
            <label className="checkout-field"><span>Postcode <b>*</b></span><input required name="postcode" type="text" inputMode="numeric" placeholder="16000" /></label>
            <label className="checkout-field checkout-field-full"><span>District / Cité / Neighborhood <b>*</b></span><textarea required name="district" rows="3" placeholder="Nom du quartier ou de la cité" /></label>
            <label className="checkout-field checkout-field-full"><span>Street / Building / House No / Landmark <small>(optional)</small></span><input name="street" type="text" placeholder="Rue, bâtiment, numéro ou repère" /></label>
          </div>

          <label className="default-address"><input type="checkbox" /> <span>Make Default</span></label>
          <button className="save-address-button" type="submit" disabled={saving || saved}>{saving ? 'ENREGISTREMENT...' : saved ? 'COMMANDE ENREGISTRÉE' : 'CONFIRMER LA COMMANDE'}</button>
          {saved && <p className="checkout-success">Merci ! Votre demande a bien été enregistrée.</p>}
          {error && <p className="checkout-error">{error}</p>}
        </form>

        <aside className="checkout-sidebar">
          <button className="continue-button" type="button" onClick={() => document.querySelector('.checkout-form')?.requestSubmit()}>CONTINUE <span>→</span></button>

          <section className="summary-card">
            <div className="summary-title"><h2>Order Summary</h2><span>{items.length} article{items.length > 1 ? 's' : ''}</span></div>
            {items.length > 0 ? items.map((item) => {
              const quantity = item.quantity || item.qte || 1;
              const name = item.title || item.nom || 'Produit';
              const price = item.price || item.prix || 0;
              return <div className="summary-item" key={item.id}><span>{name} <b>×{quantity}</b></span><strong>{(price * quantity).toLocaleString('fr-DZ')} DZD</strong></div>;
            }) : <p className="empty-summary">Votre panier est vide.</p>}
            <div className="summary-line"><span>Sous-total</span><strong>{subtotal.toLocaleString('fr-DZ')} DZD</strong></div>
            <div className="summary-line"><span>Livraison</span><strong className={shipping === 0 ? 'free-shipping' : ''}>{shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString('fr-DZ')} DZD`}</strong></div>
            <div className="summary-total"><span>Total</span><strong>{grandTotal.toLocaleString('fr-DZ')} DZD</strong></div>
          </section>

          <section className="trust-panel">
            <div className="trust-heading"><span className="trust-icon">✓</span><h3>Payment Security</h3></div>
            <div className="payment-badges"><span>VISA</span><span>mastercard</span><span>ID CHECK</span></div>
            <div className="trust-detail"><strong>Security & Privacy</strong><span>Vos données sont protégées et confidentielles.</span></div>
            <div className="trust-detail"><strong>Secure Shipment Guarantee</strong><span>Suivi de livraison et assistance inclus.</span></div>
            <div className="trust-detail"><strong>Customer Support</strong><span>Une question ? Notre équipe est là pour vous.</span></div>
          </section>
        </aside>
      </div>
    </main>
  );
}