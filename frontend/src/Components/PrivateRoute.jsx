import { Navigate, Outlet } from 'react-router-dom';


const PrivateRoute = () => {
  const token = localStorage.getItem('token'); 
  if(token)
    { return <Outlet /> 
     } 
     else{
     return <Navigate to="/" replace />;
     }
};

export default PrivateRoute;
