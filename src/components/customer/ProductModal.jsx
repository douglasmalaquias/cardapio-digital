import React, { useState } from 'react';

export default function ProductModal({ item, onClose }) {
  const allImages = [item.image, ...(item.gallery || [])];
  const [activeImg, setActiveImg] = useState(allImages[0]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh] shadow-2xl animate-fade-in-up">
        <button onClick={onClose} className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold z-10 shadow">
          X
        </button>

        <div className="w-full h-64 bg-gray-100 shrink-0">
          <img src={activeImg} className="w-full h-full object-cover" alt={item.name} />
        </div>

        {allImages.length > 1 && (
          <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto shrink-0 border-b border-gray-100">
            {allImages.map((img, i) => (
              <img 
                key={i} src={img} onClick={() => setActiveImg(img)} 
                className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${activeImg === img ? 'border-orange-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`} 
                alt="Miniatura"
              />
            ))}
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-2xl font-black text-gray-900 leading-tight">{item.name}</h2>
          <p className="text-orange-600 font-black text-xl mt-1">R$ {item.price.toFixed(2).replace('.', ',')}</p>
          <p className="mt-4 text-gray-600 text-sm leading-relaxed">{item.description}</p>
          
          {item.nutrition && (
            <div className="mt-5 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>🥗</span> Informação Nutricional
              </h4>
              <p className="text-sm text-emerald-900 font-medium">{item.nutrition}</p>
            </div>
          )}
          
          <button className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95">
            Adicionar ao Pedido
          </button>
        </div>
      </div>
    </div>
  );
}