import React, { useState, useEffect } from 'react';

import ConnectGoogleCalendar from "../components/ConnectGoogleCalendar";

import '../styles/Home.css';
import { fetchUserData } from '../api/userService';


function Calendario() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserData()
      .then(data => {
        setUserData(data);
        console.log('Email do usuário logado:', data.email);
      })
      .catch(error => {
        console.error('Erro ao buscar dados do usuário:', error);
      });
  }, []);

  

  return (
    <>
        <ConnectGoogleCalendar/>
    </>
  );
}

export default Calendario;