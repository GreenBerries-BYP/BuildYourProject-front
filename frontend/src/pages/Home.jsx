import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import '../styles/Home.css';
import { fetchUserData } from '../api/userService';

function Home() {
  const [modalAberto, setModalAberto] = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(false);

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
    <div className="d-flex">
      <Sidebar onToggle={setSidebarAberta} />
      <Header />

      <div className={`main-page-content ${modalAberto ? "blur-background" : ""}`} style={{
        padding: sidebarAberta ? "12rem 3rem 0 32rem" : "12rem 3rem 0 15rem",
        transition: "padding 0.3s ease",
        flexGrow: 1,
        overflowY: 'auto'
      }}>
        <Outlet/>
      </div>

    </div>
  );
}

export default Home;