import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminProdutos() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [editandoId, setEditandoId] = useState(null);

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  const [selecionados, setSelecionados] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate('/login');
      else setCheckingAuth(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (checkingAuth) return;

    async function carregarDados() {
      try {
        setLoading(true);
        const { data: estData } = await supabase.from('estabelecimentos').select('*').eq('slug', slug).single();
        if (!estData) return navigate('/');
        setEstabelecimento(estData);

        const { data: catData } = await supabase.from('categorias').select('*').eq('estabelecimento_id', estData.id).order('nome');
        setCategorias(catData || []);
        if (catData && catData.length > 0) setCategoriaSelecionada(catData[0].nome);

        const { data: prodData } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estData.id).order('nome');
        setProdutos(prodData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [slug, checkingAuth, navigate]);

  function baixarTemplateCSV() {
    const headers = "Nome,Preco,Categoria,Descricao,Link_Imagem\n";
    const exemplo1 = "Burger Clássico,\"34,90\",Burgers,\"Blend artesanal 150g, queijo prato\",\n";
    
    const blob = new Blob(["\ufeff" + headers + exemplo1], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `template_produtos_${slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleImportarCSV(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    if (!window.confirm("Deseja importar os produtos desta planilha?")) {
      e.target.value = '';
      return;
    }

    setUploading(true);

    const processarPlanilha = async (texto, fileInputEvent) => {
      try {
        const linhas = texto.split(/\r?\n/); 
        
        const parseLinhaCSV = (linhaStr) => {
          let resultado = [];
          let valorAtual = '';
          let dentroDeAspas = false;
          
          for (let i = 0; i < linhaStr.length; i++) {
            let char = linhaStr[i]; // Erro de sintaxe corrigido aqui
            if (char === '"') {
              dentroDeAspas = !dentroDeAspas;
            } else if ((char === ',' || char === ';') && !dentroDeAspas) {
              resultado.push(valorAtual.trim());
              valorAtual = '';
            } else {
              valorAtual += char;
            }
          }
          resultado.push(valorAtual.trim());
          return resultado;
        };

        const linhasDeDados = linhas.slice(1); // Erro de sintaxe corrigido aqui
        const produtosParaInserir = [];

        for (let linha of linhasDeDados) {
          if (!linha.trim()) continue; 
          
          const colunas = parseLinhaCSV(linha);
          if (colunas.length < 2 || !colunas[0]) continue; 

          const csvNome = colunas[0];
          const precoLimpo = colunas[1] ? colunas[1].replace('R$', '').replace(/\s/g, '').replace(',', '.').trim() : '0';
          const csvPreco = parseFloat(precoLimpo) || 0;
          const csvCategoria = colunas[2] || (categorias[0]?.nome || 'Geral');
          const csvDescricao = colunas[3] || null;
          const csvImageUrl = colunas[4] || null;

          produtosParaInserir.push({
            estabelecimento_id: estabelecimento.id,
            nome: csvNome,
            preco: csvPreco,
            categoria: csvCategoria,
            descricao: csvDescricao,
            image_url: csvImageUrl,
            ativo: true
          });
        }

        if (produtosParaInserir.length === 0) {
          alert("Nenhum produto válido encontrado na planilha.");
          return;
        }

        const { error } = await supabase.from('produtos').insert(produtosParaInserir);
        if (error) throw error;

        alert(`${produtosParaInserir.length} produtos cadastrados em massa com sucesso!`);
        setSelecionados([]); 
        const { data: prods } = await supabase.from('produtos').select('*').eq('estabelecimento_id', estabelecimento.id).order('nome');
        setProdutos(prods || []);
      } catch (err) {
        alert("Erro na importação: " + err.message);
      } finally {
        setUploading(false);
        fileInputEvent.target.value = '';
      }
    };

    const leitorUTF8 = new FileReader();
    leitorUTF8.onload = (evento) => {
      const texto = evento.target.result;
      if (texto.includes('')) {
        const leitorANSI = new FileReader();
        leitorANSI.onload = (eventoANSI) => {
          processarPlanilha(eventoANSI.target.result, e);
        };
        leitorANSI.readAsText(arquivo, 'windows-1252');
      } else {
        processarPlanilha(texto, e);
      }
    };
    leitorUTF8.readAsText(arquivo, 'UTF-8');
  }

  function handleSelecionarTodos() {
    if (selecionados.length === produtos.length) {
      setSelecionados([]); 
    } else {
      const todosIds = produtos.map(p => p.id);
      setSelecionados(todosIds); 
    }
  }

  function handleSelecionarItem(id) {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter(item => item !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  }

  async function handleExcluirEmMassa() {
    if (!window.confirm(`Tem certeza absoluta de que deseja excluir os ${selecionados.length} produtos selecionados de uma só vez?`)) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('produtos').delete().in('id', selecionados); 

      if (error) throw error;

      alert(`${selecionados.length} produtos removidos com sucesso!`);
      setProdutos(produtos.filter(p => !selecionados.