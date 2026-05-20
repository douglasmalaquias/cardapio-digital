import React, { useState } from 'react';

export default function ProductModal({ produto, onClose }) {
  if (!produto) return null;

  const nome = produto.nome || produto.title || 'Produto';
  const precoBase = Number(produto.preco) || 0;
  const descricao = produto.description || produto.descricao || 'Sem descrição disponível.';
  const imagem = produto.image || produto.imagem || null;
  const nutricao = produto.nutrition || produto.info_nutricional || 'Informações nutricionais não cadastradas.';
  
  // Captura os complementos injetados pelo CustomerView (padrão vazio se não houver)
  const complementos = produto.complementos || [];

  // Estado para controlar quais adicionais o cliente marcou no tablet
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState([]);

  // Alterna a seleção de um adicional ao tocar no checkbox/linha
  const handleToggleAdicional = (comp) => {
    if (adicionaisSelecionados.some(item => item.id === comp.id)) {
      setAdicionaisSelecionados(adicionaisSelecionados.filter(item => item.id !== comp.id));
    } else {
      setAdicionaisSelecionados([...adicionaisSelecionados, comp]);
    }
  };

  // Calcula o valor total dinamicamente (Preço Base + Soma dos Adicionais)
  const precoTotal = adicionaisSelecionados.reduce((acc, item) => acc + Number(item.preco), precoBase);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Botão de Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md z-10 transition-colors"
        >
          ✕
        </button>

        {/* Corpo rolável para não cortar telas de tablets em modo paisagem */}
        <div className="overflow-y-auto flex-1 pb-4">
          
          {/* Container da Imagem */}
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

          {/* Conteúdo Principal */}
          <div className="p-6 space-y-5">
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-2xl font-bold text-gray-950">{nome}</h2>
              <span className="text-xl font-extrabold text-amber-600 whitespace-nowrap">
                R$ {precoBase.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Descrição</h4>
              <p className="text-gray-600 leading-relaxed text-sm">{descricao}</p>
            </div>

            {/* 🥓 SEÇÃO DE COMPLEMENTOS / ADICIONAIS DINÂMICOS */}
            {complementos.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Turbine seu pedido</h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl bg-gray-50/50 overflow-hidden">
                  {complementos.map((comp) => {
                    const estaMarcado = adicionaisSelecionados.some(item => item.id === comp.id);
                    return (
                      <label 
                        key={comp.id} 
                        onClick={() => handleToggleAdicional(comp)}
                        className="flex items-center justify-between p-3.5 hover:bg-gray-100/70 cursor-pointer select-none transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={estaMarcado}
                            readOnly
                            className="w-5 h-5 text-amber-500 border-gray-300 rounded-lg focus:ring-amber-500 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-gray-800">{comp.nome}</span>
                        </div>
                        <span className="text-sm font-bold text-amber-600">
                          + R$ {Number(comp.preco).toFixed(2).replace('.', ',')}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info Nutricional / Detalhes Técnicos */}
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100/70">
              <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Detalhes / Info Nutricional</h4>
              <p className="text-xs text-amber-900/80 leading-relaxed">{nutricao}</p>
            </div>
          </div>
        </div>

        {/* 🛒 RODAPÉ FIXO: Barra Comercial com cálculo do Valor Total */}
        <div className="p-4 border-t bg-white flex items-center justify-between shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total do item</span>
            <span className="text-xl font-black text-gray-950">
              R$ {precoTotal.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button 
            onClick={() => {
              // Deixamos o gancho pronto para quando adicionarmos o carrinho definitivo
              alert(`Item adicionado com ${adicionaisSelecionados.length} adicional(is)! Total: R$ ${precoTotal.toFixed(2)}`);
              onClose();
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md shadow-amber-500/20 transition-all duration-200 transform active:scale-98"
          >
            Confirmar Item
          </button>
        </div>

      </div>
    </div>
  );
}