import React, { useState } from 'react';

// --- 1. DADOS INICIAIS (CARDÁPIO RECHEADO) ---
const initialMenuData = [
  {
    category: 'Lanches',
    items: [
      { 
        id: 1, name: 'Super X-Tudo', price: 45.50, 
        description: 'Dois blends de 90g de costela, queijo cheddar derretido, maionese da casa, ovo, bacon e pão brioche.', 
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
        gallery: ['https://images.unsplash.com/photo-1586816001966-79b736744398?w=500&q=80', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80'],
        nutrition: 'Calorias: 850kcal | Proteínas: 42g | Carboidratos: 35g'
      },
      { 
        id: 2, name: 'Bacon Cheddar Supremo', price: 38.90, 
        description: 'Hambúrguer de 160g, muito creme de cheddar, fatias de bacon crocante e cebola caramelizada.', 
        image: 'https://images.unsplash.com/photo-1594212502856-78832a81878b?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 720kcal | Proteínas: 38g | Gorduras: 45g'
      },
      { 
        id: 3, name: 'Chicken Crispy', price: 32.00, 
        description: 'Sobrecoxa de frango empanada e crocante, alface americana, tomate e maionese de ervas.', 
        image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 610kcal | Proteínas: 30g | Carboidratos: 40g'
      },
      { 
        id: 4, name: 'Veggie Burger', price: 34.50, 
        description: 'Hambúrguer de grão de bico e cogumelos, rúcula, tomate seco e molho de mostarda e mel.', 
        image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 450kcal | Proteínas: 15g | Rico em Fibras'
      },
      { 
        id: 5, name: 'Smash Duplo', price: 29.90, 
        description: 'Dois discos de carne prensados (smash) com crosta perfeita, queijo prato duplo e pão macio.', 
        image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 680kcal | Proteínas: 40g | Carboidratos: 30g'
      },
      { 
        id: 6, name: 'Picanha Premium', price: 49.90, 
        description: 'Blend exclusivo de picanha 200g, queijo coalho tostado, geleia de pimenta e rúcula.', 
        image: 'https://images.unsplash.com/photo-1549611016-3a70d82b5040?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 790kcal | Proteínas: 48g | Gorduras: 42g'
      },
      { 
        id: 7, name: 'Ribs BBQ', price: 42.00, 
        description: 'Costelinha de porco desfiada com molho barbecue artesanal, salada coleslaw e pão australiano.', 
        image: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 750kcal | Proteínas: 35g | Açúcares: 12g'
      },
      { 
        id: 8, name: 'Monster Burger', price: 55.00, 
        description: 'Três blends de 120g, triplo queijo, onion rings dentro do lanche e molho especial.', 
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 1100kcal | Proteínas: 65g | Divulgue para 2 pessoas'
      }
    ]
  },
  {
    category: 'Bebidas',
    items: [
      { 
        id: 9, name: 'Coca-Cola Lata', price: 7.00, 
        description: 'Refrigerante em lata 350ml estupidamente gelado com rodela de limão.', 
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 140kcal | Açúcares: 39g'
      },
      { 
        id: 10, name: 'Guaraná Antarctica', price: 7.00, 
        description: 'Refrigerante lata 350ml.', 
        image: 'https://images.unsplash.com/photo-1629032355262-d751086c475d?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 130kcal | Açúcares: 36g'
      },
      { 
        id: 11, name: 'Suco de Laranja Natural', price: 12.00, 
        description: 'Suco feito na hora com laranjas selecionadas. Copo de 400ml.', 
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 180kcal | Rico em Vitamina C'
      },
      { 
        id: 12, name: 'Limonada Suíça', price: 14.00, 
        description: 'Limão batido com leite condensado e bastante gelo.', 
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 220kcal | Contém Lactose'
      },
      { 
        id: 13, name: 'Cerveja Artesanal IPA', price: 18.00, 
        description: 'Cerveja da casa, amargor presente e notas cítricas. Garrafa 600ml.', 
        image: 'https://images.unsplash.com/photo-1518542698889-ca82262f08d5?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 250kcal | Teor Alcoólico: 6.5%'
      },
      { 
        id: 14, name: 'Água com Gás e Limão', price: 5.00, 
        description: 'Garrafa 500ml servida com gelo e rodelas de limão siciliano.', 
        image: 'https://images.unsplash.com/photo-1559839914-11aae62e5052?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 0kcal | Zero Açúcar'
      }
    ]
  },
  {
    category: 'Sobremesas',
    items: [
      { 
        id: 15, name: 'Petit Gâteau', price: 24.90, 
        description: 'Bolo de chocolate com interior cremoso, servido quente com sorvete de creme.', 
        image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 550kcal | Contém Glúten e Lactose'
      },
      { 
        id: 16, name: 'Milkshake de Morango', price: 19.90, 
        description: 'Sorvete batido com morangos frescos, chantilly e calda.', 
        image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 480kcal | Rico em Cálcio'
      },
      { 
        id: 17, name: 'Brownie de Chocolate', price: 18.00, 
        description: 'Pedaço generoso de brownie com nozes, casquinha crocante e interior macio.', 
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 420kcal | Contém Nozes'
      },
      { 
        id: 18, name: 'Cheesecake de Frutas Vermelhas', price: 22.00, 
        description: 'Torta de queijo cremoso estilo nova-iorquino com generosa calda de frutas vermelhas.', 
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 510kcal | Contém Lactose'
      },
      { 
        id: 19, name: 'Pudim de Leite Condensado', price: 15.00, 
        description: 'O clássico sem furinhos, derretendo na boca com calda de caramelo escuro.', 
        image: 'https://images.unsplash.com/photo-1590137531776-809ccb440878?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 380kcal | Não Contém Glúten'
      },
      { 
        id: 20, name: 'Churros com Doce de Leite', price: 16.50, 
        description: 'Porção com 4 mini churros fritos na hora, passados na canela e açúcar, acompanhados de doce de leite.', 
        image: 'https://images.unsplash.com/photo-1624374053855-3211516e885d?w=500&q=80',
        gallery: [], nutrition: 'Calorias: 450kcal | Muito Crocante'
      }
    ]
  }
];

const initialAdsData = [
  { id: 1, title: 'Milkshake 50% OFF', description: 'Na compra de qualquer lanche.', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80', active: true }
];

// --- 2. COMPONENTE DE MODAL (POP-UP) ---
const ProductModal = ({ item, onClose }) => {
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
};

// --- 3. TELA DO CLIENTE ---
const MenuCustomerView = ({ menuData, ads, showAdsGlobal }) => {
  const activeAds = ads.filter(ad => ad.active);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      {selectedProduct && <ProductModal item={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      
      <header className="bg-white shadow-sm p-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Burger Factory</h1>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-full shadow-md">Chamar Garçom</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 mt-4">
        {showAdsGlobal && activeAds.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Destaques Patrocinados</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAds.map(ad => (
                <div key={ad.id} className="relative overflow-hidden rounded-2xl h-40 group cursor-pointer shadow-sm border border-orange-100">
                  <img src={ad.image} alt={ad.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end">
                    <h3 className="text-white font-bold text-lg leading-tight">{ad.title}</h3>
                    <p className="text-orange-200 text-xs mt-1 line-clamp-2">{ad.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {menuData.map((cat, idx) => (
          <section key={idx} className="mb-12">
            <h2 className="text-2xl font-extrabold text-gray-800 border-b-2 border-orange-500 pb-2 mb-6 inline-block">{cat.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cat.items.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedProduct(item)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow flex overflow-hidden border border-gray-100 h-32 cursor-pointer"
                >
                  <img src={item.image} className="w-32 h-full object-cover" />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                    </div>
                    <p className="text-orange-600 font-bold">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

// --- 4. TELA ADMIN ---
const AdminPanelView = ({ menuData, setMenuData, ads, setAds, showAdsGlobal, setShowAdsGlobal }) => {
  const [adTitle, setAdTitle] = useState(''); const [adDesc, setAdDesc] = useState(''); const [adImg, setAdImg] = useState('');
  const [catName, setCatName] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodName, setProdName] = useState(''); const [prodPrice, setProdPrice] = useState(''); const [prodDesc, setProdDesc] = useState('');
  const [prodCat, setProdCat] = useState(menuData[0]?.category || '');
  const [prodImgMain, setProdImgMain] = useState(''); const [prodImg2, setProdImg2] = useState(''); const [prodImg3, setProdImg3] = useState(''); const [prodImg4, setProdImg4] = useState('');
  const [prodNutri, setProdNutri] = useState('');

  const handleAddAd = (e) => {
    e.preventDefault();
    setAds([...ads, { id: Date.now(), title: adTitle, description: adDesc, image: adImg, active: true }]);
    setAdTitle(''); setAdDesc(''); setAdImg('');
  };
  const toggleAd = (id) => setAds(ads.map(ad => ad.id === id ? { ...ad, active: !ad.active } : ad));
  const deleteAd = (id) => { if(window.confirm('Excluir?')) setAds(ads.filter(ad => ad.id !== id)); };

  const handleAddCat = (e) => {
    e.preventDefault();
    if(menuData.some(c => c.category.toLowerCase() === catName.toLowerCase())) return alert('Já existe!');
    setMenuData([...menuData, { category: catName, items: [] }]); setCatName('');
  };

  const handleSaveProd = (e) => {
    e.preventDefault();
    const mainImage = prodImgMain.trim() || 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80';
    const galleryUrls = [prodImg2, prodImg3, prodImg4].filter(url => url.trim() !== '');

    const newProd = { 
      id: editingProductId || Date.now(), name: prodName, price: parseFloat(prodPrice), description: prodDesc, 
      image: mainImage, gallery: galleryUrls, nutrition: prodNutri
    };

    if (editingProductId) {
      setMenuData(menuData.map(c => {
        const filtered = c.items.filter(i => i.id !== editingProductId);
        return c.category === prodCat ? { ...c, items: [...filtered, newProd] } : { ...c, items: filtered };
      }));
      setEditingProductId(null);
    } else {
      setMenuData(menuData.map(c => c.category === prodCat ? { ...c, items: [...c.items, newProd] } : c));
    }
    
    setProdName(''); setProdPrice(''); setProdDesc(''); setProdImgMain(''); setProdImg2(''); setProdImg3(''); setProdImg4(''); setProdNutri('');
  };

  const prepareEdit = (item, cat) => {
    setEditingProductId(item.id); setProdCat(cat); setProdName(item.name); setProdPrice(item.price); setProdDesc(item.description || '');
    setProdImgMain(item.image || ''); setProdImg2(item.gallery?.[0] || ''); setProdImg3(item.gallery?.[1] || ''); setProdImg4(item.gallery?.[2] || ''); setProdNutri(item.nutrition || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const deleteProd = (id) => { if(window.confirm('Apagar produto?')) setMenuData(menuData.map(c => ({...c, items: c.items.filter(i => i.id !== id)}))); };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Painel de Controle</h1>
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
            <span className="text-sm font-bold text-gray-600">Exibir Anúncios</span>
            <input type="checkbox" checked={showAdsGlobal} onChange={() => setShowAdsGlobal(!showAdsGlobal)} className="w-5 h-5 accent-orange-500 cursor-pointer" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Anúncios */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-orange-500">
              <h2 className="text-xl font-bold mb-4">🚀 Cadastrar Anúncio</h2>
              <form onSubmit={handleAddAd} className="space-y-3">
                <input type="text" required value={adTitle} onChange={e => setAdTitle(e.target.value)} placeholder="Título" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                <input type="text" required value={adDesc} onChange={e => setAdDesc(e.target.value)} placeholder="Descrição" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                <input type="text" value={adImg} onChange={e => setAdImg(e.target.value)} placeholder="URL Imagem" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg">Salvar Anúncio</button>
              </form>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="font-bold mb-4 text-gray-700">Cards Atuais ({ads.length})</h2>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                {ads.map(ad => (
                  <div key={ad.id} className="flex items-center justify-between p-3 border rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <img src={ad.image} className="w-12 h-12 rounded-lg object-cover border" />
                      <div>
                        <p className="font-bold text-sm text-gray-800 line-clamp-1">{ad.title}</p>
                        <p className={`text-[10px] font-bold uppercase ${ad.active ? 'text-green-500' : 'text-red-500'}`}>{ad.active ? 'Ativo' : 'Pausado'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => toggleAd(ad.id)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-semibold">On/Off</button>
                      <button onClick={() => deleteAd(ad.id)} className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 text-xs font-semibold">X</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categorias */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-emerald-500">
              <h2 className="text-xl font-bold mb-4">📁 Cadastrar Categoria</h2>
              <form onSubmit={handleAddCat} className="flex gap-3">
                <input type="text" required value={catName} onChange={e => setCatName(e.target.value)} placeholder="Ex: Combos" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                <button type="submit" className="bg-emerald-600 text-white font-bold px-6 rounded-lg">+</button>
              </form>
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-500">
          <div className="flex justify-between mb-4">
             <h2 className="text-xl font-bold text-gray-800">{editingProductId ? '📝 Editando Produto' : '🍔 Cadastrar Produto Completo'}</h2>
             {editingProductId && <button onClick={() => setEditingProductId(null)} className="text-xs bg-gray-200 px-3 py-1 rounded font-bold">Cancelar Edição</button>}
          </div>
          <form onSubmit={handleSaveProd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
              <select value={prodCat} onChange={e => setProdCat(e.target.value)} className="w-full p-2 border rounded-lg bg-white outline-none">
                {menuData.map(c => <option key={c.category} value={c.category}>{c.category}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label><input type="text" required value={prodName} onChange={e => setProdName(e.target.value)} className="w-full p-2 border rounded-lg" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preço (R$)</label><input type="number" step="0.01" required value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full p-2 border rounded-lg" /></div>
            <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label><textarea required value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="w-full p-2 border rounded-lg" rows="2"></textarea></div>
            <div className="md:col-span-2 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <label className="block text-xs font-bold text-emerald-700 uppercase mb-2">🥗 Info Nutricional</label>
              <input type="text" value={prodNutri} onChange={e => setProdNutri(e.target.value)} className="w-full p-2 border rounded-lg border-emerald-200" />
            </div>
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-4">
               <div className="col-span-2"><p className="text-xs font-bold text-gray-500 uppercase">📸 Imagens (URLs)</p></div>
               <input type="text" value={prodImgMain} onChange={e => setProdImgMain(e.target.value)} placeholder="Foto Principal" className="p-2 border rounded-lg border-blue-300" />
               <input type="text" value={prodImg2} onChange={e => setProdImg2(e.target.value)} placeholder="Foto Extra 1" className="p-2 border rounded-lg" />
               <input type="text" value={prodImg3} onChange={e => setProdImg3(e.target.value)} placeholder="Foto Extra 2" className="p-2 border rounded-lg" />
               <input type="text" value={prodImg4} onChange={e => setProdImg4(e.target.value)} placeholder="Foto Extra 3" className="p-2 border rounded-lg" />
            </div>
            <div className="md:col-span-2 mt-2">
              <button className={`w-full text-white font-bold py-3 rounded-lg ${editingProductId ? 'bg-amber-500' : 'bg-blue-600'}`}>{editingProductId ? 'Atualizar Produto' : 'Salvar Produto'}</button>
            </div>
          </form>
        </div>

        {/* Gerenciamento */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-purple-500">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Gerenciar Produtos</h2>
          <div className="space-y-4">
            {menuData.map(cat => (
              <div key={cat.category} className="border border-gray-200 p-4 rounded-xl bg-gray-50">
                <h3 className="font-bold text-lg mb-3 text-gray-700">{cat.category}</h3>
                {cat.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg mb-2 border shadow-sm">
                    <div><p className="font-bold text-gray-800">{item.name}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => prepareEdit(item, cat.category)} className="text-xs bg-amber-100 text-amber-800 font-bold px-4 py-2 rounded-lg">Editar</button>
                      <button onClick={() => deleteProd(item.id)} className="text-xs bg-red-100 text-red-800 font-bold px-4 py-2 rounded-lg">Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- 5. APP PRINCIPAL ---
export default function MenuApp() {
  const [view, setView] = useState('customer'); // Voltei para a visão do cliente por padrão
  const [menuData, setMenuData] = useState(initialMenuData);
  const [ads, setAds] = useState(initialAdsData);
  const [showAdsGlobal, setShowAdsGlobal] = useState(true);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <button onClick={() => setView('customer')} className={`px-4 py-2 rounded-lg font-bold shadow-lg ${view === 'customer' ? 'bg-orange-500 text-white' : 'bg-white'}`}>Ver Cliente</button>
        <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-lg font-bold shadow-lg ${view === 'admin' ? 'bg-gray-800 text-white' : 'bg-white'}`}>Ver Admin</button>
      </div>
      {view === 'customer' ? <MenuCustomerView menuData={menuData} ads={ads} showAdsGlobal={showAdsGlobal} /> : <AdminPanelView menuData={menuData} setMenuData={setMenuData} ads={ads} setAds={setAds} showAdsGlobal={showAdsGlobal} setShowAdsGlobal={setShowAdsGlobal} />}
    </>
  );
}