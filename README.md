Aplicatia se deschide initial intr-o pagina simpla de autentificare, in care utilizatorul are de ales intre doua optiuni principale: „Login” si „Creeaza cont”. Scopul acestei pagini este sa directioneze studentul fie catre formularul de inregistrare, daca nu are cont, fie catre zona de autentificare, daca este deja utilizator al platformei.

1.1 Creeare cont si generare cod pentru colaborare

Atunci cand studentul alege optiunea „Creeaza cont”, este redirectionat catre o pagina de inregistrare in care trebuie sa introduca adresa de e-mail, numele si prenumele,
parola si specializarea. Adresa de e-mail este verificata astfel incat sa fie din domeniul institutional (de exemplu adresa sa se termine in @stud.ase.ro).
Parola este salvata in mod securizat in baza de date (hash-uita), iar specializarea va fi folosita ulterior pentru a sugera materiile potrivite pentru anii de studiu.

In momentul in care contul este creat cu succes, sistemul genereaza automat un cod unic asociat acelui utilizator. Acest cod reprezinta „codul de colaborare”
si poate fi transmis colegilor din aceeasi grupa. Pe baza acestui cod, colegii pot trimite cereri de prietenie si pot intra in retele de colaborare pentru partajarea notitelor.
Dupa generarea contului si a codului, utilizatorul este informat ca inregistrarea a fost finalizata, iar aplicatia il redirectioneaza inapoi in pagina de login,
pentru a se autentifica folosind datele nou create.

1.2 Accesul in aplicatie si organizarea pe ani si materii

Dupa ce studentul se autentifica cu adresa de e-mail si parola, este adus in pagina principala a aplicatiei. Aceasta pagina este gandita
ca un panou central de control in care notitele sunt organizate in functie de anul de studiu si de materii
. Vizual, in zona centrala a ecranului sunt afisate trei sectiuni distincte, corespunzatoare anilor 1, 2 si 3.
Fiecare sectiune functioneaza ca un dropdown sau un acordion, care se poate extinde si restrange.

La deschiderea unei sectiuni corespunzatoare unui an, studentul vede lista materiilor pentru acel an.
Fiecare materie poate fi selectata, iar la selectarea unei materii se deschide un nou dropdown structurat pe doua coloane:
in partea stanga sunt afisate cursurile, iar in partea dreapta seminariile aferente acelei materii. De exemplu, pentru disciplina „Programare Web”, 
coloana din stanga poate contine intrari precum „Curs 1”, „Curs 2”, „Curs 3”, iar coloana din dreapta poate contine „Seminar 1”, „Seminar 2” si asa mai departe.

Atunci cand studentul apasa pe un anumit curs sau seminar, este deschisa pagina editorului de text. In partea de sus a editorului este afisat titlul notitei,
de exemplu „Curs 1” sau un titlu personalizat de utilizator. Sub titlu, studentul are la dispozitie un editor de notite bazat pe Markdown, in care poate sa scrie,
sa formateze si sa structureze continutul. Editorul permite creatie, modificare si stergere de notite. Studentul poate crea o notita noua pentru acel curs sau poate
edita o notita deja existenta, actualizand continutul, data, etichetele sau cuvintele cheie. Daca o notita nu mai este relevanta, o poate sterge definitiv.

In dreptul fiecarei intrari de tip curs sau seminar exista un mic meniu reprezentat prin trei puncte. Din acest mini-meniu utilizatorul poate sterge cursul,
seminarul sau notita asociata, in functie de modul in care structurezi datele. De exemplu, se poate sterge notita pentru „Curs 1” sau se pot sterge toate notitel
e asociate acelui curs.

In editorul de notite studentul are optiunea de a adauga atasamente, cum ar fi imagini, documente PDF sau alte fisiere. Fiecare atasament este legat de notita respectiva
si poate fi vizualizat sau descarcat ulterior. La nivelul notitei, studentul poate defini materie, data, etichete si cuvinte cheie. Etichetele si cuvintele cheie sunt 
folosite ulterior pentru filtrare si cautare, astfel incat notitele sa poata fi regasite usor chiar daca numarul lor devine foarte mare. De exemplu, o notita pentru „Curs 2” 
poate avea tag-uri precum „recapitulare”, „examen partial”, „lab demo”.

Pentru partajarea notitelor, studentul are in editor sau in vizualizarea notitei o optiune de „Share” prin care poate alege ce colegi vor avea acces la acea notita.
Lista de colegi este construita pe baza relatiilor de prietenie din aplicatie. In momentul in care studentul selecteaza unul sau mai multi prieteni
, aplicatia creeaza o inregistrare de partajare si respectivii colegi vor vedea notita in lista lor de notite partajate.

1.3 Meniul din stanga sus: gestionare prieteni si cereri

In partea de sus stanga a paginii principale este afisat un buton de meniu, care deschide un panou lateral dedicat zonei sociale a aplicatiei.
In acest meniu exista sectiuni pentru gestionarea prietenilor si a cererilor primite pe baza codului generat la inregistrare.

Studentul care a creat contul are un cod unic de colaborare. Colegii sai pot folosi acest cod pentru a trimite cereri de prietenie.
In panoul de meniu, studentul va vedea o sectiune „Cererile mele”, unde sunt listate toate cererile de prietenie in asteptare. Pentru fiecare cerere, 
el poate alege sa o accepte sau sa o refuze. Dupa acceptare, colegul care a trimis cererea apare in lista de „Prieteni”.

Tot in acest meniu exista si o sectiune „Prieteni”, in care studentul vede toti colegii conectati cu el prin aplicatie. Din aceasta lista,
studentul poate selecta un coleg pentru a-i vizualiza notitele care au fost partajate cu el sau poate initia noi partajari de notite.
Astfel, codul generat la inceput devine un mecanism simplu prin care colegii din aceeasi grupa se conecteaza intre ei si isi impart notitele pentru
colaborare si invatare comuna.

1.4 Meniul din dreapta sus: profil, delogare si schimbare parola

In partea de sus dreapta a paginii principale se afla un alt meniu, legat de profilul utilizatorului. Acesta include optiuni precum vizualizarea informatiilor de profil, 
schimbarea parolei si delogarea din aplicatie.

Prin optiunea de vizualizare a profilului, studentul poate vedea date precum numele complet, adresa de e-mail, specializarea si codul sau unic de colaborare,
astfel incat sa il poata copia si transmite colegilor. Sectiunea de schimbare a parolei permite actualizarea acesteia daca utilizatorul considera ca este cazul,
trecand printr-un flux clasic cu parola veche si noua parola. Optiunea de delogare il scoate pe utilizator din sesiunea curenta,
il deconecteaza de la API-ul backend si il redirectioneaza inapoi pe pagina de login.

In acest fel, aplicatia ofera un flux clar: inregistrare cu generare de cod, autentificare, organizare a notitelor pe ani si materii,
acces rapid la cursuri si seminarii, editor pentru notite cu atasamente, sistem de tag-uri si cautare, precum si mecanisme de prietenie si partajare
prin meniurile din partea stanga si din partea dreapta.


2 GESTIONAREA BACK-END-ULUI

  1. Auth Module (auth)

Acest modul gestioneaza toate operatiile legate de autentificare si creare de cont. Include inregistrarea unui utilizator nou, validarea adresei de e-mail,
generarea codului unic de colaborare si autentificarea cu parola. Modulul mai gestioneaza schimbarea parolei si obtinerea informatiilor de baza despre utilizatorul logat.
Este responsabil pentru generarea si validarea token-urilor de sesiune (JWT).

2. User Module (users)

Modulul se ocupa de gestionarea informatiilor legate de utilizatori. Aici sunt incluse detalii personale (nume, email, specializare),
precum si functionalitatile sociale ale aplicatiei, cum ar fi gestionarea codului de colaborare, vizualizarea listei de prieteni, trimiterea si acceptarea cererilor de prietenie.
Modulul permite, de asemenea, acces la datele profilului utilizatorului logat.

3. Course Module (courses)

Acest modul administreaza materiile si structura lor pe ani de studiu. Aici sunt definite rutele pentru obtinerea materiilor asociate unui anumit an,
precum si informatiile specifice despre fiecare disciplina. Modulul este folosit pentru afisarea listelor de cursuri si seminarii in pagina principala.

4. Note Module (notes)

Modulul gestioneaza toate operatiile legate de notite. Include crearea, editarea, stergerea si vizualizarea unei notite. 
Aici se gestioneaza si organizarea notitelor dupa materie, tip (curs sau seminar), data, tag-uri si cuvinte cheie.
Modulul va oferi functionalitati de cautare si filtrare a notitelor, precum si acces la continutul Markdown si metadatele notitelor.

5. Attachment Module (attachments)

Acest modul este responsabil pentru incarcarea, stocarea si administrarea fisierelor atasate notitelor.
Gestioneaza salvarea metadatelor fisierelor (nume, tip, url), stergerea atasamentelor si conectarea corecta a fiecarui atasament la notita corespunzatoare.

6. Share Module (shares)

Modulul este dedicat partajarii notitelor intre utilizatori. Permite studentului sa partajeze o notita cu unul sau mai multi prieteni,
sa defineasca nivelul de acces (editare sau doar vizualizare) si sa gestioneze lista de notite primite de la alti colegi. Modulul centralizeaza toate notitele partajate 
si transmite aceste date catre frontend.

Auth Frontend Module (AuthScreens)

Include paginile de Login si Creeare cont. Aici se face interactiunea initiala cu utilizatorul, validarea datelor introduse si trimiterea cererilor catre backend
pentru autentificare si inregistrare.

8. Dashboard Module (Dashboard)

Acest modul reprezinta pagina principala de organizare. Afiseaza anii de studiu, materiile si dropdown-urile pentru cursuri si seminarii.
De aici se navigheaza catre editorul de notite.

9. Notes Editor Module (NotesEditor)

Reprezinta editorul de text pentru scrierea si modificarea notitelor. Include partea de Markdown, vizualizare live, atasamente si optiunile de salvare/sterge.
Este conectat direct cu Note Module-ul din backend.

10. Friends & Social Module (FriendsPanel)

Aici se gestioneaza cererile de prietenie, acceptarea sau respingerea lor, precum si lista de prieteni existenti.
Aici studentul poate folosi codul de colaborare pentru a se conecta cu colegii.

11. Profile Module (UserProfile)

Include optiunile de profil din partea dreapta sus: vizualizarea informatiilor personale, schimbarea parolei si delogarea din aplicatie.
