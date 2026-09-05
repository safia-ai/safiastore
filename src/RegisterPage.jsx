import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './LoginPage.css';

export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nom: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    register(formData.nom, formData.email);
    navigate('/');
  };

  return (
    <div className="login-page">
      <section className="login-showcase" aria-label="DZShop">
        <div className="showcase-orbit showcase-orbit-one"></div>
        <div className="showcase-orbit showcase-orbit-two"></div>
        <div className="showcase-content">
          <span className="showcase-mark">DZ</span>
          <p className="showcase-kicker">Rejoignez-nous</p>
          <h1>DZSHOP</h1>
          <p>Créez votre espace client et profitez d'une expérience d'achat simple et rapide.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <p className="login-eyebrow">Nouveau client</p>
          <h2>Créer un compte</h2>
          <p className="login-intro">Inscrivez-vous pour suivre vos commandes et retrouver vos achats.</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="register-name">Nom et prénom</label>
            <div className="login-input-wrap">
              <span aria-hidden="true">◉</span>
              <input id="register-name" name="nom" type="text" placeholder="Votre nom complet" required value={formData.nom} onChange={handleChange} />
            </div>

            <label htmlFor="register-email">Email</label>
            <div className="login-input-wrap">
              <span aria-hidden="true">✉</span>
              <input id="register-email" name="email" type="email" placeholder="Entrez votre email" required value={formData.email} onChange={handleChange} />
            </div>

            <label htmlFor="register-password">Mot de passe</label>
            <div className="login-input-wrap">
              <span aria-hidden="true">⌑</span>
              <input id="register-password" name="password" type="password" placeholder="Minimum 6 caractères" required minLength="6" value={formData.password} onChange={handleChange} />
            </div>

            <label htmlFor="register-confirm-password">Confirmer le mot de passe</label>
            <div className="login-input-wrap">
              <span aria-hidden="true">⌑</span>
              <input id="register-confirm-password" name="confirmPassword" type="password" placeholder="Répétez votre mot de passe" required minLength="6" value={formData.confirmPassword} onChange={handleChange} />
            </div>

            <button type="submit" className="login-submit">Créer mon compte</button>
          </form>

          <p className="signup-prompt">Vous avez déjà un compte ? <Link to="/login">Se connecter</Link></p>
        </div>
      </section>
    </div>
  );
}
