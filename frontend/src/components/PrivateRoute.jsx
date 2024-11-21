import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element }) => {
  const usuarioLogado = localStorage.getItem('usuarioLogado');

  if (!usuarioLogado) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default PrivateRoute;
