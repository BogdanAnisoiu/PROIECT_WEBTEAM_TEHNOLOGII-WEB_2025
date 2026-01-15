import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { KeywordExtension } from '../extensions/KeywordExtension';
import { FileExtension } from '../extensions/FileExtension';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import './EditorNotita.css';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

const EditorNotita = () => {
    const referintaInputFisier = useRef(null);
    const interogare = new URLSearchParams(location.search);
    const [titlu, setTitlu] = useState('Titlu Notita');
    const [cursId, setCursId] = useState(location.state?.cursId || interogare.get('cursId') || 1);
    const [tip, setTip] = useState('curs'); // 'curs' sau 'seminar'

    const { id } = useParams();
    const navigare = useNavigate();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            KeywordExtension,
            FileExtension,
            Youtube.configure({
                controls: true,
                nocookie: true,
            }),
            Placeholder.configure({
                placeholder: `
      Bine ai venit în editor!
      Acesta este un editor simplu
      Scrie # pentru titluri
      Scrie **bold** pentru text îngroșat
      Scrie - pentru liste
    `,
            }),
        ],
        content: '',
    });

    const adaugaVideoYoutube = () => {
        const url = prompt('Introdu URL-ul video-ului YouTube:');

        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
                width: 500,
                height: 400,
            });
        }
    };

    const gestioneazaIncarcareFisier = async (e) => {
        const fisier = e.target.files[0];
        console.log('Selected file:', fisier);
        if (!fisier) return;

        const dateFormular = new FormData();
        dateFormular.append('image', fisier); //backend asteapta 'image' key momentan

        const token = localStorage.getItem('token');

        try {
            const raspuns = await fetch(`${API_URL}/incarcare`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: dateFormular
            });

            if (raspuns.ok) {
                const date = await raspuns.json();

                //verificam daca este o imagine bazandu-ne pe tip
                if (fisier.type.startsWith('image/')) {
                    editor.chain().focus().setImage({ src: date.url }).run();
                } else {
                    //tratam ca atasament generic de fisier
                    //inseram la finalul documentului pentru a evita problemele de schema
                    editor.chain().focus().command(({ tr, dispatch }) => {
                        if (dispatch) {
                            const pozitieFinala = tr.doc.content.size;
                            tr.insert(pozitieFinala, [
                                editor.schema.nodes.fileAttachment.create({
                                    src: date.url,
                                    fileName: fisier.name
                                }),
                                editor.schema.nodes.paragraph.create()
                            ]);
                        }
                        return true;
                    }).run();

                }

            } else {
                toast.error('Eroare la încărcarea fișierului.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Eroare de conexiune.');
        } finally {
            e.target.value = '';
        }
    };

    const gestioneazaSalvare = async () => {
        if (!editor) return;
        const continut = editor.getHTML();
        const token = localStorage.getItem('token');
        const metoda = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/notite/${id}` : `${API_URL}/notite`;

        const cuvinteCheie = editor.getText().match(/![\w\u00C0-\u017F]+/g) || [];
        const cuvinteCheieUnice = [...new Set(cuvinteCheie)].map(k => k.substring(1)); //eliminam '!'

        const corpDate = {
            titlu: titlu,
            continut: continut,
            cursId: cursId,
            tip: tip,
            cuvinteCheie: cuvinteCheieUnice
        };

        const raspuns = await fetch(url, {
            method: metoda,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(corpDate)
        });

        if (raspuns.ok) {
            toast.success('Notita a fost salvata cu succes');
            setTimeout(() => window.close(), 1000);
        } else {
            toast.error('Eroare la salvarea notitei');
        }

    }

    useEffect(() => {
        if (id && editor) {
            const incarcaNotita = async () => {
                const token = localStorage.getItem('token');
                try {
                    const raspuns = await fetch(`${API_URL}/notite/${id}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (raspuns.ok) {
                        const notita = await raspuns.json();
                        editor.commands.setContent(notita.continut); //era contentMarkdown
                        setTitlu(notita.titlu);
                        setCursId(notita.cursId);
                        setTip(notita.tip || 'curs');
                    } else {
                        toast.error('Nu am putut incarca notita');
                    }
                } catch (err) {
                    console.log(err);
                    toast.error('Nu am putut incarca notita');
                }
            };
            incarcaNotita();
        }
    }, [id, editor]);

    const gestioneazaStergere = async () => {
        if (!window.confirm('Sigur vrei sa stergi aceasta notita?')) return;

        try {
            const token = localStorage.getItem('token');
            const raspuns = await fetch(`${API_URL}/notite/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (raspuns.ok) {
                toast.success('Notita a fost stearsa.');
                navigare('/cursuri');
            } else {
                toast.error('Eroare la stergere.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Eroare de conexiune.');
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="paginaEditor">
            <div className="headerEditor">
                <div className="headerStanga">
                    <input
                        type="text"
                        value={titlu}
                        onChange={(e) => setTitlu(e.target.value)}
                        className="inputTitlu"
                        placeholder="Titlu Notita"
                    />
                </div>

                <div className="headerActiuni">
                    <select
                        value={tip}
                        onChange={(e) => setTip(e.target.value)}
                        className="selectTip"
                    >
                        <option value="curs">Curs</option>
                        <option value="seminar">Seminar</option>
                        <option value="auxiliar">Auxiliar</option>
                    </select>

                    <input
                        type="file"
                        ref={referintaInputFisier}
                        style={{ display: 'none' }}
                        onChange={gestioneazaIncarcareFisier}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    />

                    <button
                        onClick={() => referintaInputFisier.current.click()}
                        className="btnEditor"
                        title="Adauga Fisier / Imagine"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        Ataseaza
                    </button>

                    <button
                        onClick={adaugaVideoYoutube}
                        className="btnEditor"
                        title="Adauga Video YouTube"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                        Video
                    </button>

                    <button onClick={gestioneazaSalvare} className="btnEditor primar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Salveaza
                    </button>

                    {id && (
                        <button
                            onClick={gestioneazaStergere}
                            className="btnEditor pericol"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            Sterge
                        </button>
                    )}
                </div>
            </div>

            <div className="containerEditor">
                <EditorContent editor={editor} className="editor-content" />
            </div>
        </div>
    );
};

export default EditorNotita;
