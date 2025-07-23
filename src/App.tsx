import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './page/auth';
import HomePage from './page/home';

const App: React.FC = () => {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      <Route path='/auth' element={<AuthPage />} />
      <Route
        path='/'
        element={token ? <HomePage /> : <Navigate to='/auth' replace />}
      />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};

export default App;
