import React from 'react';

export default function ProductModal({ produto, onClose }) {
  if (!produto) return null;

  const nome = produto.nome || produto.title || 'Produto';
  const preco = produto.preco || 0;
  const descricao = produto.description || produto.descricao || 'Sem descrição disponível.';
  const imagem = produto.image || produto.imagem_url || null;
  const nutricao = produto.nutrition || produto.info_nutricional || 'Informações nutricionais não cadastradas.';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        
        {/* Botão de Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md z-10 transition-colors"
        >
          ✕
        </button>

        {/* Container da Imagem com Condicional no Modal */}
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center relative border-b border-gray-100">
          {imagem ? (
            <img 
              src={imagem} 
              alt={nome} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400 select-none">
              <span className="text-5xl">📸</span>
              <span className="text-sm font-bold uppercase tracking-wider">Produto sem foto disponível</span>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-950">{nome}</h2>
            <span className="text-xl font-extrabold text-amber-600 whitespace-nowrap">
              R$ {Number(preco).toFixed(2).replace('.', ',')}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Descrição</h4>
          <p className="text-gray-600 mb-6 leading-relaxed">{descricao}</p>

          {/* Info Nutricional / Detalhes Técnicos */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Detalhes / Info Nutricional</h4>
            <p className="text-sm text-amber-900/80">{nutricao}</p>
          </div>
        </div>

      </div>
    </div>
  );
}