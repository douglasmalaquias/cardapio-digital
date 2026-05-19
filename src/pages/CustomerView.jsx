import React, { useState } from 'react';
import Header from '../components/customer/Header';
import ProductCard from '../components/customer/ProductCard';
import ProductModal from '../components/customer/ProductModal';
import AdCard from '../components/customer/AdCard';

export default function CustomerView({ menuData, ads, showAdsGlobal }) {
  const activeAds = ads.filter(ad => ad.active);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      {selectedProduct && <ProductModal item={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      <Header />

      <main className="max-w-6xl mx-auto p-4 mt-4">
        {showAdsGlobal && activeAds.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Destaques Patrocinados</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAds.map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>
          </div>
        )}

        {menuData.map((cat, idx) => (
          <section key={idx} className="mb-12">
            <h2 className="text-2xl font-extrabold text-gray-800 border-b-2 border-orange-500 pb-2 mb-6 inline-block">{cat.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cat.items.map(item => (
                <ProductCard key={item.id} item={item} onClick={setSelectedProduct} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}