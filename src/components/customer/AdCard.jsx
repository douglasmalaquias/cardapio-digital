import React from 'react';

export default function AdCard({ ad }) {
  return (
    <div className="relative overflow-hidden rounded-2xl h-40 group cursor-pointer shadow-sm border border-orange-100">
      <img src={ad.image} alt={ad.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end">
        <h3 className="text-white font-bold text-lg leading-tight">{ad.title}</h3>
        <p className="text-orange-200 text-xs mt-1 line-clamp-2">{ad.description}</p>
      </div>
    </div>
  );
}