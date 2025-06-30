import React from 'react'
import {Routes,Route} from 'react-router-dom'
import LandingPage from './Components/LandingPage'
import Signup from './Components/Signup'
import Signin from './Components/Signin'
import Home from './Components/Home'
import PrivateRoute from './Components/PrivateRoute';
import Cart from './Components/CartPage';
import OrderPage from './Components/OrderPage'
function App() {
  

  return (
   
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/signup' element={<Signup/>}/>
       <Route path='/signin' element={<Signin/>}/>
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<OrderPage />} />
        </Route>
        
    </Routes>
  )
}

export default App
