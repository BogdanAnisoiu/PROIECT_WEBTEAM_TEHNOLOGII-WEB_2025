import { Routes, Route } from 'react-router-dom'
import './App.css'
import Inregistrare from './components/Inregistrare'
import Autentificare from './components/Autentificare'
import Cursuri from './components/Cursuri'
import Notite from './components/Notite'
import EditorNotita from './components/EditorNotita'

function App() {

  return (
    <>

      <Routes>
        <Route path="/Cursuri" element={<Cursuri />} />
        <Route path="/Inregistrare" element={<Inregistrare />} />
        <Route path="/Autentificare" element={<Autentificare />} />
        <Route path="/notita" element={<EditorNotita />} />
        <Route path='/notita/:id' element={<EditorNotita />} />

        <Route path="/" element={<Autentificare />} />
      </Routes>
    </>
  )
}

export default App
