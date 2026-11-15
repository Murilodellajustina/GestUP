import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav'; 

export default function AppLayout() {
  return (
    <div className="d-flex flex-column flex-md-row h-100 w-100 position-relative">
        <BottomNav />
      <div className="flex-grow-1 overflow-auto bg-body-tertiary pb-5 pb-md-0">
        <Outlet />
      </div>
      
    </div>
  );
}