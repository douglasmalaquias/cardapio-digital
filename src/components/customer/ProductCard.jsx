import React from 'react';

export default function ProductCard({ produto, onVerDetalhes }) {
  const nome = produto.nome || produto.title || 'Produto sem nome';
  const preco = produto.preco || 0;
  const descricao = produto.description || produto.descricao || '';
  const imagem = produto.image || produto.imagem_url || null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
      <div>
        {/* Container da Imagem com Condicional para "Sem Foto" */}
        <div className="w-full h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-gray-50">
          {imagem ? (
            <img 
              src={imagem} 
              alt={nome} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400 select-none">
              <span className="text-3xl">🍔</span>
              <span className="text-xs font-semibold uppercase tracking-wider">Sem foto cadastrada</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{nome}</h3>
            <span className="text-amber-600 font-bold whitespace-nowrap">
              R$ {Number(preco).toFixed(2).replace('.', ',')}
            </span>
          </div>
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">{descricao}</p>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={() => onVerDetalhes(produto)}
          className="w-full bg-amber-500 text-white font-medium py-2 rounded-xl hover:bg-amber-600 transition-colors duration-200"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  );
}