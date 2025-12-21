import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inregistrare.css';

function Inregistrare() {
    const [mesaj, setMesaj] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Luam datele din input-uri
        const dateDeTrimis = {
            lastName: e.target.elements.LastName.value,
            firstName: e.target.elements.FirstName.value,
            email: e.target.elements.Email.value,
            password: e.target.elements.Password.value,
            specialization: e.target.elements.Specializare.value // Backend-ul asteapta "specialization"
        };

        try {
            // URL corect: Port 4000, ruta /auth/register
            const raspuns = await fetch('http://localhost:4000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dateDeTrimis)
            });

            const raspunsJson = await raspuns.json();

            if (raspuns.ok) {
                setMesaj(raspunsJson.message || 'Succes!');
                // Asteptam putin sa vada mesajul, apoi redirect
                setTimeout(() => navigate('/autentificare'), 2000);
            } else {
                setMesaj(raspunsJson.message || 'Eroare la inregistrare');
            }
        } catch (err) {
            console.error(err);
            setMesaj('Nu pot contacta serverul (asigura-te ca backend-ul merge pe portul 4000).');
        }
    }

    return (
        <div className="inregistrare-container">
            <div className="inregistrare-form">
                <h2>Creeaza cont</h2>

                {mesaj && <p style={{ color: mesaj.includes('Succes') ? 'lightgreen' : 'red', textAlign: 'center' }}>{mesaj}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-camp">
                        <label>Nume</label>
                        <input className='form-camp' type="text" placeholder="Nume" name="LastName" required />

                        <label>Prenume</label>
                        <input className='form-camp' type='text' placeholder='Prenume' name='FirstName' required />

                        <label>Email</label>
                        <input className='form-camp' type='email' placeholder='student@stud.ase.ro' name='Email' required />

                        <label>Parola</label>
                        <input className='form-camp' type='password' placeholder='Parola' name='Password' required />

                        <label>Specializare</label>
                        <input className='form-camp' type='text' placeholder='Specializare' name='Specializare' required />

                        <button type='submit' className="btn-submit">Inregistrare</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Inregistrare;
