import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Register from "./Auth/Register";
import Login from "./Auth/login";
import Dashboard from "./pages/Dashboard";
import { useAuth } from './contexts/AuthContext.jsx';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> :  <Navigate to="/dashboard"/>}
        />
        
      </Routes>
    </Router>
  );
};

export default App;
