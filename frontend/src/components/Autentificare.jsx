import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Autentificare.css';
function Autentificare() {

    const [mesaj, setMesaj] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dateLogin = {
            email: e.target.elements.Email.value,
            password: e.target.elements.Password.value
        };

        try {
            const raspuns = await fetch('http://localhost:4000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dateLogin)
            });

            const data = await raspuns.json();

            if (raspuns.ok) {
                setMesaj('Te-ai autentificat cu succes!');

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setTimeout(() => navigate('/'), 1500);
            } else {
                setMesaj(data.message || 'Eroare la autentificare.');
            }

        } catch (err) {
            setMesaj('Eroare: Nu pot contacta serverul.');
        }
    };
    return (
        <div>
            <h1>Autentificare</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input type="email" name="Email" required />
                    <label>Parola:</label>
                    <input type="password" name="Password" required />
                </div>
                <button type="submit">Autentificare</button>
            </form>

        </div>
    );
}
export default Autentificare;