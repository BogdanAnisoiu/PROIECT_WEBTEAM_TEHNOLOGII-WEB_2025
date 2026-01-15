import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Inregistrare.css';

function Inregistrare() {
    const [mesaj, setMesaj] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        //luam datele din input-uri
        const dateDeTrimis = {
            nume: e.target.elements.Nume.value,
            prenume: e.target.elements.Prenume.value,
            email: e.target.elements.Email.value,
            password: e.target.elements.Password.value,
            specializare: e.target.elements.Specializare.value
        };

        try {
            const raspuns = await fetch('http://localhost:4000/autentificare/inregistrare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dateDeTrimis)
            });

            const raspunsJson = await raspuns.json();

            if (raspuns.ok) {
                setIsSuccess(true);
                setMesaj(raspunsJson.message || 'Succes!');
                setTimeout(() => navigate('/autentificare'), 2000);
            } else {
                setIsSuccess(false);
                setMesaj(raspunsJson.message || 'Eroare la inregistrare');
            }
        } catch (err) {
            console.error(err);
            setMesaj('Nu pot contacta serverul.');
        }
    }

    return (
        <div className="inregistrare-wrapper">
            <div className="inregistrare-container">
                <div className="logo-container">
                    <img src="/ase_logo.png" alt="ASE Logo" className="ase-logo" />
                </div>
                <h2>Creează cont</h2>
                <p className="subtitle">Platforma de notițe pentru studenții ASE</p>

                {mesaj && <p className={`status-message ${isSuccess ? 'success' : 'error'}`}>{mesaj}</p>}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Nume</label>
                            <input type="text" placeholder="Popescu" name="Nume" required />
                        </div>

                        <div className="form-group half-width">
                            <label>Prenume</label>
                            <input type="text" placeholder="Ion" name="Prenume" required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email instituțional</label>
                        <input type="email" placeholder="student@stud.ase.ro" name="Email" required />
                        <span className="helper-text">Folosește adresa @stud.ase.ro</span>
                    </div>

                    <div className="form-group">
                        <label>Parolă</label>
                        <input type="password" placeholder="••••••••" name="Password" required />
                    </div>

                    <div className="form-group">
                        <label>Specializare</label>
                        <select name="Specializare" required defaultValue="">
                            <option value="" disabled>Selectează specializarea</option>
                            <option value="INFORMATICA ECONOMICA">Informatica Economica</option>
                            <option value="CIBERNETICA">Cibernetica</option>
                            <option value="STATISTICA ECONOMICA">Statistica Economica</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-submit">Înregistrare →</button>

                    <div className="login-link">
                        Ai deja un cont? <Link to="/autentificare">Autentifică-te</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Inregistrare;
