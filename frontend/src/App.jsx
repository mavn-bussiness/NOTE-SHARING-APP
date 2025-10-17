import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import NoteList from './components/Notes/NoteList';
import Navbar from './components/Navbar';
import './App.css';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
}

function App() {
  const isLoggedIn = localStorage.getItem('token');

  return (
    <Router>
      {isLoggedIn && <Navbar />}
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/notes" element={<PrivateRoute><NoteList /></PrivateRoute>} />
        <Route path="/" element={<Navigate to={isLoggedIn ? "/notes" : "/login"} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
