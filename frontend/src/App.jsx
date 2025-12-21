import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import MyButton from './components/MyButton'
import Navbar from './components/Navbar'
import Inregistrare from './components/Inregistrare'
import Autentificare from './components/Autentificare'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/Inregistrare" element={<Inregistrare />} />
        <Route path="/Autentificare" element={<Autentificare />} />
        <Route path="/" element={
          <>
            <h1>Proiect WEB</h1>
            <div className="card">
              <MyButton text={`Count is ${count}`} onClick={() => setCount((count) => count + 1)} />
            </div>
          </>
        } />
      </Routes>
    </>
  )
}

export default App
