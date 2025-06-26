import React,{ useState } from 'react'
import {Routes,Route} from 'react-router-dom'
import LandingPage from './Components/LandingPage'
import Signup from './Components/Signup'
import Signin from './Components/Signin'
function App() {
  

  return (
   
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/signup' element={<Signup/>}/>
       <Route path='/signin' element={<Signin/>}/>
    </Routes>
  )
}

export default App
