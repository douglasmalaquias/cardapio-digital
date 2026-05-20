import React from 'react';

export default function AdCard({ anuncio }) {
  if (!anuncio) return null;

  const titulo = anuncio.title || '';
  const descricao = anuncio.description || '';
  const imagem = anuncio.image || '';

  return (
    <div className="min-w-[300px] md:min-w-[450px] bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white flex justify-between items-center shadow-md relative overflow-hidden flex-shrink-0">
      <div className="z-10 max-w-[60%]">
        <h3 className="text-xl font-bold mb-1">{titulo}</h3>
        <p className="text-amber-100 text-sm">{descricao}</p>
      </div>
      {imagem && (
        <img 
          src={imagem} 
          alt={titulo} 
          className="w-24 h-24 object-cover rounded-xl shadow-md z-10"
        />
      )}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
    </div>
  );
}