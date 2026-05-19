import React, { useState } from 'react';

export default function AdminView({ menuData, setMenuData, ads, setAds, showAdsGlobal, setShowAdsGlobal }) {
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

        {/* Formulários de Admin (Anúncios, Categorias, Produtos e Gerenciamento - Manti igual ao original) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
}