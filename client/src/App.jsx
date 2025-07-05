import { Navigate, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logIn, logout } from './API/API.js'

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')

  const navigate = useNavigate();


  const handleLogin = async (credentials) => {
    try {
      await logIn(credentials);
      const currentUser = await getCurrentUser();  // read from session
      setUser(currentUser);
      setLoggedIn(true);
    } catch (err) {
      setMessage({ msg: err, type: 'danger' });
    }
  };

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
    setUser(null);
    setMessage('');
    navigate('/login');
  };

  // Fetch current user on app mount
  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoggedIn(true);
      } catch {
        setLoggedIn(false);
      }
    };
    init();
  }, []);

  // Redirect to dashboard when logged in
  useEffect(() => {
    console.log("🧠 Stato aggiornato:", loggedIn, user);
    if (loggedIn && user) {
      navigate('/dashboard');
    }
  }, [loggedIn, user]);


  return (
    <>
      <Routes>
         <Route path="/" element={<Header loggedIn={loggedIn} handleLogout = {handleLogout}/>}> </Route>
         <Route path="/login" element={loggedIn ? <Navigate replace to='/' /> : <LoginForm handleLogin={handleLogin} />} />
         <Route path="/dashboard" element={<Dashboard user={user} />} />

      </Routes>
    </>
    );
}

export default App;
