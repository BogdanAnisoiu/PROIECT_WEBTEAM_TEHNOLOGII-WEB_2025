import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import toast from 'react-hot-toast';
import './Autentificare.css';

function Autentificare() {

    const navigate = useNavigate();

    const gestioneazaSubmit = async (e) => {
        e.preventDefault();

        const dateLogin = {
            email: e.target.elements.Email.value,
            password: e.target.elements.Password.value
        };

        const toastId = toast.loading('Se autentifică...');

        try {
            const raspuns = await fetch(`${API_URL}/autentificare/conectare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dateLogin)
            });

            const data = await raspuns.json();

            if (raspuns.ok) {
                toast.dismiss(toastId);
                toast.success('Te-ai autentificat cu succes!');

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('nume', data.user.nume);
                localStorage.setItem('prenume', data.user.prenume);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('codColaborare', data.user.codColaborare);
                setTimeout(() => navigate('/Cursuri'), 1000);
            } else {
                toast.dismiss(toastId);
                toast.error(data.message || 'Eroare la autentificare.');
            }

        } catch (err) {
            console.error(err);
            toast.dismiss(toastId);
            toast.error('Eroare: Nu pot contacta serverul.');
        }
    };
    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="logo-container">
                    <img src="/ase_logo.png" alt="ASE Logo" className="ase-logo" />
                </div>
                <h2>Autentificare</h2>
                <p className="subtitle">Platforma de notițe pentru studenții ASE</p>

                <form onSubmit={gestioneazaSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="Email" placeholder="student@stud.ase.ro" required />
                    </div>
                    <div className="form-group">
                        <label>Parolă</label>
                        <input type="password" name="Password" placeholder="••••••••" required />
                    </div>

                    <button type="submit" className="btn-submit">Autentificare →</button>

                    <div className="login-link">
                        Nu ai cont? <Link to="/inregistrare">Înregistrează-te</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default Autentificare;
