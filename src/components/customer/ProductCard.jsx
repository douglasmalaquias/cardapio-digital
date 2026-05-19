import React from 'react';

export default function ProductCard({ item, onClick }) {
  return (
    <div 
      onClick={() => onClick(item)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow flex overflow-hidden border border-gray-100 h-32 cursor-pointer"
    >
      <img src={item.image} className="w-32 h-full object-cover" alt={item.name} />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900">{item.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
        </div>
        <p className="text-orange-600 font-bold">R$ {item.price.toFixed(2).replace('.', ',')}</p>
      </div>
    </div>
  );
}