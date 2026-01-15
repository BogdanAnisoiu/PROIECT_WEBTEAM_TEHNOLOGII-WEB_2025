import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';
import './Cursuri.css';

import Notita from "./Notita";

//componenta helper pentru dropdown personalizat (versiune react state)
const CustomSelect = ({ name, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    //functia care gestioneaza selectia
    const handleSelect = (val) => {
        onChange({ target: { value: val } });
        setIsOpen(false);
    };

    const currentOption = options.find(o => String(o.value) === String(value)) || options[0];

    return (
        <div className="select-box"> {/*latime compacta gestionata de css flex*/}
            <div
                className="select-box__current"
                onClick={() => setIsOpen(!isOpen)}
                tabIndex="0"
                onBlur={(e) => {
                    //intarziere usoara pentru a permite click-ul pe optiune sa se inregistreze
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        //verificare separata sau ne bazam pe logica de click outside daca e nevoie
                        //pentru simplitate, lasam click-ul pe optiune sa gestioneze inchiderea
                        //dar trebuie sa inchidem daca dam click in afara
                        //setTimeout(() => setIsOpen(false), 200);
                        //mai bine: verificarea relatiei de focus
                    }
                }}
            >
                <div className="select-box__value">
                    <p className="select-box__input-text" style={{ display: 'block', padding: '8px 12px', fontSize: '13px' }}>
                        {currentOption ? currentOption.name : "Selecteaza"}
                    </p>
                </div>
                <img
                    className="select-box__icon"
                    src="http://cdn.onlinewebfonts.com/svg/img_295694.svg"
                    alt="Arrow Icon"
                    aria-hidden="true"
                    style={{ transform: isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)' }}
                />
            </div>
            {isOpen && (
                <ul className="select-box__list" style={{ opacity: 1, animation: 'none', pointerEvents: 'auto', display: 'block' }}>
                    {options.map((option, index) => (
                        <li key={index} onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(option.value);
                        }}>
                            <label className="select-box__option" style={{ padding: '8px 12px', fontSize: '13px' }}>
                                {option.name}
                            </label>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


function Cursuri() {
    const [cursSelectat, setCursSelectat] = useState(null);
    const [notiteSelectate, setNotiteSelectate] = useState([]);

    const [optiuneSelectata, setOptiuneSelectata] = useState("");
    const [cursuri, setCursuri] = useState([]);
    const [mesaj, setMesaj] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [codIntrodus, setCodIntrodus] = useState('');
    const [requestCanEdit, setRequestCanEdit] = useState(false); // Permissions for new friend request
    const [cereri, setCereri] = useState([]);
    const [prieteni, setPrieteni] = useState([]);
    const [viewMode, setViewMode] = useState('cursuri'); //'cursuri' sau 'shared'
    const [notitePartajate, setNotitePartajate] = useState([]);

    //state pentru adaugare curs
    const [showAddCourseModal, setShowAddCourseModal] = useState(false);
    const [numeCursNou, setNumeCursNou] = useState('');
    const [anCursNou, setAnCursNou] = useState(1);
    const [semestruCursNou, setSemestruCursNou] = useState(1);

    //state pentru grupuri
    const [isGroupsExpanded, setIsGroupsExpanded] = useState(true);

    //state pentru cautare si filtrare
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); //'all' ,'curs', 'seminar'
    const [selectedDate, setSelectedDate] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        //functia care preia lista de prieteni
        const fetchPrieteni = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(API_URL + '/studenti/prieteni', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setPrieteni(await res.json());
                }
            } catch (err) {
                console.error("Eroare la preluarea prietenilor", err);
            }
        };
        fetchPrieteni();
    }, []);

    //functia care preia lista de prieteni (definita si in afara useeffect pentru reutilizare)
    const fetchPrieteni = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_URL + '/studenti/prieteni', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPrieteni(await res.json());
            }
        } catch (err) {
            console.error("Eroare la preluarea prietenilor", err);
        }
    };

    //trimite o cerere de prietenie
    const trimiteCerere = async () => {
        if (!codIntrodus) {
            alert("Te rog introdu un cod!");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/studenti/cereri-prietenie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    codColaborare: codIntrodus,
                    poateEdita: requestCanEdit // Send permission preference
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Cerere trimisa cu succes!');
                setCodIntrodus('');
                setRequestCanEdit(false); // reset checkbox
                //optional: inchidem modalul sau nu
            } else {
                alert(data.message || 'Eroare la trimiterea cererii.');
            }
        }
        catch (error) {
            console.error('Eroare:', error);
            alert('Eroare de conexiune.');
        }
    }

    //preia lista de cereri de prietenie
    const preiaCereri = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/studenti/cereri-prietenie', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCereri(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    //raspunde la o cerere de prietenie (accept/respinge)
    const raspundeCerere = async (idOfRequest, actiune) => {
        try {
            const token = localStorage.getItem('token');
            const actiuneRo = actiune === 'accept' ? 'accepta' : 'respinge';
            const response = await fetch(`${API_URL}/studenti/cereri-prietenie/${idOfRequest}/${actiuneRo}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                preiaCereri();
                if (actiune === 'accept') {
                    fetchPrieteni(); //actualizam lista de prieteni imediat
                }
                alert(`Cerere ${actiune === 'accept' ? 'acceptata' : 'respinsa'}!`);
            } else {
                alert('Eroare la procesarea cererii.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (showModal) {
            preiaCereri();
        }
    }, [showModal]);

    useEffect(() => {
        fetchPrieteni();
    }, []);
    //Preia cursurile din backend
    const preiaCursuri = async (an, semestru) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/cursuri?an=${an}&semestru=${semestru}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCursuri(data);
                if (data.length === 0) setMesaj('Nu există materii pentru selecția făcută.');
                else setMesaj('');
            } else {
                setMesaj('Eroare la preluarea materiilor.');
            }
        } catch (error) {
            console.error('Eroare:', error);
            setMesaj('Eroare de conexiune.');
        }
    };

    //gestioneaza schimbarea filtrului de an/semestru
    const onChange = (e) => {
        const val = e.target.value;
        setOptiuneSelectata(val);

        if (!val) {
            setCursuri([]);
            return;
        }
        const [an, semestru] = val.split('-');
        preiaCursuri(an, semestru);
    };

    //gestioneaza click-ul pe un curs
    const gestioneazaClickCurs = async (idCurs) => {
        setCursSelectat(idCurs);
        setViewMode('cursuri'); //resetam vizualizarea la cursuri normale
        try {
            const token = localStorage.getItem('token');
            //cerem de la backend notitele doar pentru acest curs
            const response = await fetch(`${API_URL}/notite?cursId=${idCurs}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setNotiteSelectate(data);
            } else {
                console.error("Nu am putut incarca notitele.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    //partajeaza o notita direct cu un prieten
    const shareNotitaDirect = async (notitaId, friendId) => {
        if (!friendId) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/partajare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    notitaId: notitaId,
                    studentIds: [friendId]
                })
            });

            if (response.ok) {
                alert('Notiță trimisă cu succes!');
            } else {
                alert('Eroare la trimitere.');
            }
        } catch (err) {
            console.error(err);
            alert('Eroare de conexiune.');
        }
    };

    //preia notitele partajate de prieteni
    const preiaNotitePartajate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/partajare/primite', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                //mapam structura pentru a o potrivi cu componenta notita
                const notite = data.map(share => ({
                    ...share.Notitum,
                    sharedBy: share.Notitum?.autor,
                    isShared: true
                }));
                setNotitePartajate(notite);
                setViewMode('shared'); //schimbam modul de vizualizare
                setCursSelectat(null); //ascundem cursurile normale
            }
        } catch (err) {
            console.error(err);
        }
    };

    //adauga o materie noua
    const adaugaCurs = async () => {
        if (!numeCursNou) {
            alert('Te rog introdu numele materiei.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL + '/cursuri', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nume: numeCursNou,
                    an: anCursNou,
                    semestru: semestruCursNou
                })
            });

            if (response.ok) {
                alert('Materie adaugata cu succes!');
                setShowAddCourseModal(false);
                setNumeCursNou('');
                //daca materia adaugata corespunde cu filtrul curent, reincarcam lista
                //sau, mai simplu, resetam filtrele sau reincarcam daca utilizatorul e pe anul/semestrul respectiv
                if (optiuneSelectata === `${anCursNou}-${semestruCursNou}`) {
                    preiaCursuri(anCursNou, semestruCursNou);
                }
            } else {
                alert('Eroare la adaugarea materiei.');
            }
        } catch (err) {
            console.error(err);
            alert('Eroare de conexiune.');
        }
    };

    // --- grupuri de studiu ---
    const [grupuri, setGrupuri] = useState([]);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [numeGrupNou, setNumeGrupNou] = useState('');
    const [grupSelectat, setGrupSelectat] = useState(null); //id grup selectat
    const [detaliiGrup, setDetaliiGrup] = useState(null); //obiectul complet (membri, notite)

    //preia grupurile de studiu
    const fetchGrupuri = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_URL + '/grupuri', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setGrupuri(await res.json());
            }
        } catch (err) {
            console.error("Eroare incarcare grupuri", err);
        }
    };

    //creeaza un grup nou
    const creazaGrup = async () => {
        if (!numeGrupNou) return alert("Numele grupului este obligatoriu.");
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_URL + '/grupuri', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nume: numeGrupNou, descriere: "Grup de studiu" }) //descriere default momentan
            });

            if (res.ok) {
                alert("Grup creat!");
                setShowCreateGroupModal(false);
                setNumeGrupNou('');
                fetchGrupuri();
            } else {
                alert("Eroare la creare grup.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    //gestioneaza click-ul pe un grup
    const gestioneazaClickGrup = async (grupId) => {
        setGrupSelectat(grupId);
        setViewMode('group');
        setCursSelectat(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/grupuri/${grupId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log("Detalii Grup Primite:", data);
                setDetaliiGrup(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    //invita un membru in grup folosind codul
    const invitaInGrup = async () => {
        if (!grupSelectat) return;
        const code = prompt("Introdu Codul de Colaborare al colegului:");
        if (!code) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/grupuri/${grupSelectat}/invita`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ codColaborare: code })
            });
            if (res.ok) {
                alert("Invitație trimisă (membru adăugat)!");
                gestioneazaClickGrup(grupSelectat); //refresh detalii grup
            } else {
                const dt = await res.json();
                alert(dt.message || "Eroare la invitare");
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchGrupuri();
    }, []);

    return (
        <div className="container-cursuri">
            <div className="sidebar-cursuri">
                <div className="Nume-Student">
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{localStorage.getItem('nume') + ' ' + localStorage.getItem('prenume')}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                        Cod colaborare: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#4CAF50' }}>{localStorage.getItem('codColaborare')}</span>
                    </p>
                    <button className="button-79" onClick={() => setShowModal(true)}>Trimite cerere prietenie</button>
                    <button className="button-79" style={{ marginTop: '15px', backgroundColor: '#2196F3' }} onClick={() => setShowAddCourseModal(true)}>+ Adauga Materie</button>

                    <div className="search" style={{ marginTop: '15px' }}>
                        <input
                            type="text"
                            className="search__input"
                            placeholder="Cauta notite..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search__button">
                            <svg className="search__icon" aria-hidden="true" viewBox="0 0 24 24">
                                <g>
                                    <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-3.365-7.5-7.5z"></path>
                                </g>
                            </svg>
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                type="date"
                                className="search-input"
                                style={{
                                    width: '100%',
                                    height: '38px', //potriveste inaltimea tipica a select-ului
                                    borderRadius: '5px',
                                    border: '1px solid #E8EAED',
                                    padding: '0 10px',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                    color: '#60666d',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 2px 5px -1px rgba(0,0,0,0.1)'
                                }}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <CustomSelect
                                name="filterType"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                options={[
                                    { name: 'Toate', value: 'all' },
                                    { name: 'Curs', value: 'curs' },
                                    { name: 'Seminar', value: 'seminar' },
                                    { name: 'Auxiliar', value: 'auxiliar' }
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <h2>Materii</h2>
                <div className="zona-selectie">
                    <CustomSelect
                        name="cursOptions"
                        value={optiuneSelectata}
                        onChange={onChange}
                        options={[
                            { name: 'Alege Anul și Semestrul', value: '' },
                            { name: 'Anul 1, Semestrul 1', value: '1-1' },
                            { name: 'Anul 1, Semestrul 2', value: '1-2' },
                            { name: 'Anul 2, Semestrul 1', value: '2-1' },
                            { name: 'Anul 2, Semestrul 2', value: '2-2' },
                            { name: 'Anul 3, Semestrul 1', value: '3-1' },
                            { name: 'Anul 3, Semestrul 2', value: '3-2' }
                        ]}
                    />
                </div>

                <div className="lista-cursuri">
                    {mesaj && <p>{mesaj}</p>}
                    {cursuri.length > 0 && (
                        <div>
                            <ul>
                                {cursuri.map(curs => (
                                    <li
                                        key={curs.id}
                                        onClick={() => gestioneazaClickCurs(curs.id)}
                                        className={cursSelectat === curs.id ? 'selectat' : ''}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <strong>{curs.nume}</strong>
                                            {curs.specializare && <span> ({curs.specializare.nume})</span>}
                                        </div>
                                        <button
                                            className="add-note-btn-small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(`/notita?cursId=${curs.id}`, '_blank');
                                            }}
                                            title="Adauga notita"
                                        >
                                            +
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button className="buton-notite-partajate" style={{ marginTop: '20px' }} onClick={preiaNotitePartajate}>
                                📂 Notițe Partajate
                            </button>
                        </div>
                    )}
                </div>

                <div className="divider-sidebar" style={{ margin: '10px 0', borderTop: '1px solid #e0e0e0' }}></div>

                {/* sectiune grupuri studiu */}
                <div className="sectiuneGrupuri">
                    <div className="headerGrupuri" onClick={() => setIsGroupsExpanded(!isGroupsExpanded)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                                style={{
                                    display: 'inline-block',
                                    transition: 'transform 0.2s',
                                    transform: isGroupsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                    fontSize: '12px'
                                }}
                            >
                                ▼
                            </span>
                            <span style={{ fontWeight: 'bold', color: '#37352f' }}>Grupuri</span>
                        </div>
                        <button
                            className="btnAdaugaGrupHeader"
                            onClick={(e) => { e.stopPropagation(); setShowCreateGroupModal(true); }}
                            title="Grup Nou"
                        >
                            +
                        </button>
                    </div>

                    {isGroupsExpanded && (
                        <div className="groups-list-container">
                            {grupuri.length === 0 ? (
                                <p style={{ fontSize: '12px', color: '#999', paddingLeft: '24px', margin: '5px 0' }}>Nu ai grupuri.</p>
                            ) : (
                                <ul className="listaGrupuri">
                                    {grupuri.map(grup => (
                                        <li
                                            key={grup.id}
                                            onClick={() => gestioneazaClickGrup(grup.id)}
                                            className={grupSelectat === grup.id ? 'activ' : ''}
                                        >
                                            <span style={{ marginRight: '6px' }}>👥</span>
                                            {grup.nume}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="continut-principal">
                {viewMode === 'shared' ? (
                    <div>
                        <h3>Notițe primite de la colegi</h3>
                        <div className="grilaNotite">
                            {notitePartajate.length > 0 ? (
                                notitePartajate.map(notita => (
                                    <div key={'shared-' + notita.id} style={{ position: 'relative' }}>
                                        <Notita data={notita} />
                                        {notita.sharedBy && (
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                                De la: <strong>{notita.sharedBy.nume} {notita.sharedBy.prenume}</strong>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>Nu ai primit nicio notiță.</p>
                            )}
                        </div>
                    </div>
                ) : viewMode === 'group' && detaliiGrup ? (
                    <div>
                        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
                            <h2>👥 {detaliiGrup.nume}</h2>
                            <p style={{ color: '#666' }}>{detaliiGrup.descriere}</p>

                            <div style={{ marginTop: '10px' }}>
                                <strong>Membri ({detaliiGrup.membri ? detaliiGrup.membri.length : 0}): </strong>
                                {detaliiGrup.membri && detaliiGrup.membri.map(m => (
                                    <span key={m.id} style={{ marginRight: '10px', background: '#eee', padding: '2px 8px', borderRadius: '10px', fontSize: '0.9em' }}>
                                        {m.nume} {m.prenume}
                                    </span>
                                ))}
                                <button
                                    onClick={invitaInGrup}
                                    style={{ marginLeft: '10px', fontSize: '0.9em', cursor: 'pointer', padding: '4px 8px' }}
                                >
                                    + Invita (Cod)
                                </button>
                            </div>
                        </div>

                        <h3>Notițe în grup</h3>
                        <div className="grilaNotite">
                            {(() => {
                                const lista = detaliiGrup.listaNotiteGrup || detaliiGrup.NotiteGrups || [];
                                if (lista.length > 0) {
                                    return lista.map(ng => {
                                        const notita = ng.Notitum || ng.Notita;
                                        if (!notita) return null;
                                        return (
                                            <div key={'group-note-' + notita.id} style={{ position: 'relative' }}>
                                                <Notita data={notita} />
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                                    Postat de: <strong>{ng.autorPartajare ? `${ng.autorPartajare.nume} ${ng.autorPartajare.prenume}` : 'Necunoscut'}</strong>
                                                </div>
                                            </div>
                                        );
                                    });
                                } else {
                                    return <p>Nu există notițe în acest grup.</p>;
                                }
                            })()}
                        </div>
                    </div>
                ) : (
                    cursSelectat ? (
                        <div className="grilaNotite">
                            {notiteSelectate.length > 0 ? (
                                notiteSelectate
                                    .filter(notita => {
                                        const matchesType = filterType === 'all' || notita.tip === filterType;
                                        const searchLower = searchTerm.toLowerCase();
                                        const matchesTitle = notita.titlu.toLowerCase().includes(searchLower);
                                        const matchesKeywords = notita.cuvinteCheie && Array.isArray(notita.cuvinteCheie) && notita.cuvinteCheie.some(k => k.toLowerCase().includes(searchLower));

                                        //filtrare dupa data
                                        let matchesDate = true;
                                        if (selectedDate) {
                                            const noteDate = new Date(notita.createdAt || notita.updatedAt);
                                            //formatare yyyy-mm-dd manuala pentru a fi siguri cu fusul orar sau folosim split daca e iso
                                            const dateString = noteDate.toISOString().split('T')[0];
                                            matchesDate = dateString === selectedDate;
                                        }

                                        return matchesType && (matchesTitle || matchesKeywords) && matchesDate;
                                    })
                                    .map(notita => (
                                        <div key={notita.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <div style={{ flexGrow: 1, marginBottom: '12px' }}>
                                                <Notita data={notita} />
                                            </div>
                                            <div>
                                                {/* partajare catre prieten */}
                                                <select
                                                    className="selectPartajare"
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val.startsWith('group-')) {
                                                            const gId = val.split('-')[1];
                                                            if (window.confirm(`Partajezi notita in grupul selectat?`)) {
                                                                //apel api pentru partajare in grup
                                                                fetch(`${API_URL}/grupuri/${gId}/notite`, {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Content-Type': 'application/json',
                                                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                                    },
                                                                    body: JSON.stringify({ notitaId: notita.id })
                                                                }).then(r => {
                                                                    if (r.ok) alert('Notita partajata in grup!');
                                                                    else alert('Eroare partajare grup.');
                                                                });
                                                            }
                                                        } else {
                                                            const friendId = val;
                                                            if (window.confirm(`Sigur vrei sa trimiti notita catre acest prieten?`)) {
                                                                shareNotitaDirect(notita.id, friendId);
                                                            }
                                                        }
                                                        e.target.value = "";
                                                    }}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>📤 Partajeaza...</option>
                                                    <optgroup label="Prieteni">
                                                        {prieteni.map(p => (
                                                            <option key={'f-' + p.id} value={p.id}>
                                                                {p.nume} {p.prenume}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                    <optgroup label="Grupuri">
                                                        {grupuri.map(g => (
                                                            <option key={'g-' + g.id} value={'group-' + g.id}>
                                                                👥 {g.nume}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <p>Nu exista notite pentru acest curs. Creeaza una noua!</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-placeholder">Selecteaza un curs pentru a vedea notitele.</p>
                    )
                )}
            </div>


            {/* modalurile plasate in afara structurii principale flex dar in interiorul containerului */}

            {
                showCreateGroupModal && (
                    <div className="overlayModal" onClick={() => setShowCreateGroupModal(false)}>
                        <div className="continutModal" onClick={(e) => e.stopPropagation()}>
                            <h3>Grup Nou de Studiu</h3>
                            <div className="sectiuneModal">
                                <label>Nume Grup:</label>
                                <input
                                    type="text"
                                    className="inputModal"
                                    value={numeGrupNou}
                                    onChange={(e) => setNumeGrupNou(e.target.value)}
                                    placeholder="Ex: Proiect Web"
                                />
                                <button onClick={creazaGrup} className="btnTrimiteCerere" style={{ marginTop: '10px' }}>Creeaza</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showModal && (
                    <div className="overlayModal" onClick={() => setShowModal(false)}>
                        <div className="continutModal" onClick={(e) => e.stopPropagation()}>
                            <h3>Prietenie</h3>

                            <div className="sectiuneModal">
                                <p><strong>Trimite cerere:</strong></p>
                                <input
                                    type="text"
                                    placeholder="Cod colaborare (ex: 1a2b3c)"
                                    value={codIntrodus}
                                    onChange={(e) => setCodIntrodus(e.target.value)}
                                    className="inputModal"
                                />
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginTop: '5px' }}>
                                    <input
                                        type="checkbox"
                                        id="chkCanEdit"
                                        checked={requestCanEdit}
                                        onChange={(e) => setRequestCanEdit(e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <label htmlFor="chkCanEdit" style={{ fontSize: '13px', color: '#555', cursor: 'pointer' }}>
                                        Permite editarea notițelor partajate (Trimite Originale)
                                    </label>
                                </div>
                                <button onClick={trimiteCerere} className="btnTrimiteCerere">Trimite</button>
                            </div>

                            <div>
                                <p><strong>Cereri primite:</strong></p>
                                {cereri.length === 0 ? (
                                    <p className="mesajFaraCereri">Nu ai cereri noi.</p>
                                ) : (
                                    <ul className="listaCereri">
                                        {cereri.map(req => (
                                            <li key={req.id} className="elementCerere">
                                                <span className="numeExpeditorCerere">
                                                    {`${req.expeditor.nume} ${req.expeditor.prenume}`}
                                                </span>
                                                <div>
                                                    <button onClick={() => raspundeCerere(req.id, 'accept')} className="btnAccepta">✓</button>
                                                    <button onClick={() => raspundeCerere(req.id, 'reject')} className="btnRespinge">✕</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="sectiuneModal" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                <p><strong>Prietenii mei:</strong></p>
                                {prieteni.length === 0 ? (
                                    <p className="mesajFaraCereri">Nu ai prieteni încă.</p>
                                ) : (
                                    <ul className="listaCereri">
                                        {prieteni.map(prieten => (
                                            <li key={prieten.id} className="elementCerere" style={{ justifyContent: 'space-between', gap: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '1.2em' }}>👤</span>
                                                    <span className="numeExpeditorCerere">
                                                        {prieten.nume} {prieten.prenume}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`Sigur vrei sa stergi prietenia cu ${prieten.nume}? Toate notitele partajate vor fi sterse.`)) {
                                                            try {
                                                                const token = localStorage.getItem('token');
                                                                const res = await fetch(`${API_URL}/studenti/prieteni/${prieten.id}`, {
                                                                    method: 'DELETE',
                                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                                });
                                                                if (res.ok) {
                                                                    //update display
                                                                    setPrieteni(prieteni.filter(p => p.id !== prieten.id));
                                                                    alert('Prieten sters.');
                                                                } else {
                                                                    const errData = await res.json();
                                                                    alert(`Eroare la stergerea prietenului: ${errData.message || res.statusText}`);
                                                                }
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert('Eroare de conexiune.');
                                                            }
                                                        }
                                                    }}
                                                    className="btnRespinge"
                                                    title="Sterge prieten"
                                                >
                                                    🗑️
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <button onClick={() => setShowModal(false)} className="btnInchidereModal">Inchide</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showAddCourseModal && (
                    <div className="overlayModal" onClick={() => setShowAddCourseModal(false)}>
                        <div className="continutModal" onClick={(e) => e.stopPropagation()}>
                            <h3>Adauga Materie Noua</h3>
                            <div className="sectiuneModal">
                                <label style={{ display: 'block', marginBottom: '5px' }}>Nume Materie:</label>
                                <input
                                    type="text"
                                    className="inputModal"
                                    value={numeCursNou}
                                    onChange={(e) => setNumeCursNou(e.target.value)}
                                    placeholder="Ex: Introducere in Programare"
                                />

                                <label style={{ display: 'block', marginBottom: '5px', marginTop: '10px' }}>An:</label>
                                <select
                                    className="inputModal"
                                    value={anCursNou}
                                    onChange={(e) => setAnCursNou(Number(e.target.value))}
                                >
                                    <option value="1">Anul 1</option>
                                    <option value="2">Anul 2</option>
                                    <option value="3">Anul 3</option>
                                </select>

                                <label style={{ display: 'block', marginBottom: '5px', marginTop: '10px' }}>Semestru:</label>
                                <select
                                    className="inputModal"
                                    value={semestruCursNou}
                                    onChange={(e) => setSemestruCursNou(Number(e.target.value))}
                                >
                                    <option value="1">Semestrul 1</option>
                                    <option value="2">Semestrul 2</option>
                                </select>

                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button onClick={() => setShowAddCourseModal(false)} className="btnInchidereModal">Anuleaza</button>
                                    <button onClick={adaugaCurs} className="btnTrimiteCerere" style={{ backgroundColor: '#2196F3' }}>Salveaza</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default Cursuri;