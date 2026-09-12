import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './RegisterPage.css';

export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nom: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const result = await register(formData.nom, formData.email, formData.password);
    if (result.success) navigate('/');
    else setError(result.message);
  };

  return (
    <div className="register-page">
      <section className="register-card">
        <div className="register-heading">
          <span className="register-logo">DZSHOP</span>
          <h1>Formulaire d'inscription</h1>
          <p>Remplissez soigneusement le formulaire pour créer votre compte.</p>
        </div>

        {error && <div className="register-error">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-field register-field-wide">
            <label htmlFor="register-name">Nom complet</label>
            <input id="register-name" name="nom" type="text" placeholder="Votre nom complet" required value={formData.nom} onChange={handleChange} />
          </div>

          <div className="register-field">
            <label htmlFor="register-email">Adresse e-mail</label>
            <input id="register-email" name="email" type="email" placeholder="exemple@email.com" required value={formData.email} onChange={handleChange} />
          </div>

          <div className="register-field">
            <label htmlFor="register-password">Mot de passe</label>
            <input id="register-password" name="password" type="password" placeholder="Minimum 6 caractères" required minLength="6" value={formData.password} onChange={handleChange} />
          </div>

          <div className="register-field">
            <label htmlFor="register-confirm-password">Confirmer le mot de passe</label>
            <input id="register-confirm-password" name="confirmPassword" type="password" placeholder="Répétez le mot de passe" required minLength="6" value={formData.confirmPassword} onChange={handleChange} />
          </div>

          <button type="submit" className="register-submit">Créer mon compte</button>
        </form>

        <p className="register-login-link">Vous avez déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </section>
    </div>
  );
}
