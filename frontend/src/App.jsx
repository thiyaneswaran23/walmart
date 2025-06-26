import React,{ useState } from 'react'
import {Routes,Route} from 'react-router-dom'
import LandingPage from './Components/LandingPage'
import Signup from './Components/Signup'
import Signin from './Components/Signin'
import Home from './Components/Home'
function App() {
  

  return (
   
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/signup' element={<Signup/>}/>
       <Route path='/signin' element={<Signin/>}/>
       <Route path='/home' element={<Home/>}/>
    </Routes>
  )
}

export default App
