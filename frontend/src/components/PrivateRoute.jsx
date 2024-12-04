import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const auth = JSON.parse(localStorage.getItem('usuarioLogado'));
  console.log(auth);
  return auth?.email ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
