import React, { useState } from 'react';
import { initialMenuData, initialAdsData } from './data/data';
import CustomerView from './pages/CustomerView';
import AdminView from './pages/AdminView';

export default function App() {
  const [view, setView] = useState('customer'); 
  const [menuData, setMenuData] = useState(initialMenuData);
  const [ads, setAds] = useState(initialAdsData);
  const [showAdsGlobal, setShowAdsGlobal] = useState(true);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <button 
          onClick={() => setView('customer')} 
          className={`px-4 py-2 rounded-lg font-bold shadow-lg transition-colors ${view === 'customer' ? 'bg-orange-500 text-white' : 'bg-white'}`}
        >
          Ver Cliente
        </button>
        <button 
          onClick={() => setView('admin')} 
          className={`px-4 py-2 rounded-lg font-bold shadow-lg transition-colors ${view === 'admin' ? 'bg-gray-800 text-white' : 'bg-white'}`}
        >
          Ver Admin
        </button>
      </div>
      
      {view === 'customer' ? (
        <CustomerView menuData={menuData} ads={ads} showAdsGlobal={showAdsGlobal} />
      ) : (
        <AdminView 
          menuData={menuData} setMenuData={setMenuData} 
          ads={ads} setAds={setAds} 
          showAdsGlobal={showAdsGlobal} setShowAdsGlobal={setShowAdsGlobal} 
        />
      )}
    </>
  );
}