// src/data/data.js
export const initialMenuData = [
  {
    category: 'Lanches',
    items: [
      { id: 1, name: 'Super X-Tudo', price: 45.50, description: 'Dois blends de 90g de costela, queijo cheddar derretido, maionese da casa, ovo, bacon e pão brioche.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', gallery: ['https://images.unsplash.com/photo-1586816001966-79b736744398?w=500&q=80', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80'], nutrition: 'Calorias: 850kcal | Proteínas: 42g | Carboidratos: 35g' },
      { id: 2, name: 'Bacon Cheddar Supremo', price: 38.90, description: 'Hambúrguer de 160g, muito creme de cheddar, fatias de bacon crocante e cebola caramelizada.', image: 'https://images.unsplash.com/photo-1594212502856-78832a81878b?w=500&q=80', gallery: [], nutrition: 'Calorias: 720kcal | Proteínas: 38g | Gorduras: 45g' },
      { id: 3, name: 'Chicken Crispy', price: 32.00, description: 'Sobrecoxa de frango empanada e crocante, alface americana, tomate e maionese de ervas.', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80', gallery: [], nutrition: 'Calorias: 610kcal | Proteínas: 30g | Carboidratos: 40g' },
      { id: 4, name: 'Veggie Burger', price: 34.50, description: 'Hambúrguer de grão de bico e cogumelos, rúcula, tomate seco e molho de mostarda e mel.', image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&q=80', gallery: [], nutrition: 'Calorias: 450kcal | Proteínas: 15g | Rico em Fibras' },
      { id: 5, name: 'Smash Duplo', price: 29.90, description: 'Dois discos de carne prensados (smash) com crosta perfeita, queijo prato duplo e pão macio.', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80', gallery: [], nutrition: 'Calorias: 680kcal | Proteínas: 40g | Carboidratos: 30g' },
      { id: 6, name: 'Picanha Premium', price: 49.90, description: 'Blend exclusivo de picanha 200g, queijo coalho tostado, geleia de pimenta e rúcula.', image: 'https://images.unsplash.com/photo-1549611016-3a70d82b5040?w=500&q=80', gallery: [], nutrition: 'Calorias: 790kcal | Proteínas: 48g | Gorduras: 42g' },
      { id: 7, name: 'Ribs BBQ', price: 42.00, description: 'Costelinha de porco desfiada com molho barbecue artesanal, salada coleslaw e pão australiano.', image: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=500&q=80', gallery: [], nutrition: 'Calorias: 750kcal | Proteínas: 35g | Açúcares: 12g' },
      { id: 8, name: 'Monster Burger', price: 55.00, description: 'Três blends de 120g, triplo queijo, onion rings dentro do lanche e molho especial.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80', gallery: [], nutrition: 'Calorias: 1100kcal | Proteínas: 65g | Divulgue para 2 pessoas' }
    ]
  },
  {
    category: 'Bebidas',
    items: [
      { id: 9, name: 'Coca-Cola Lata', price: 7.00, description: 'Refrigerante em lata 350ml estupidamente gelado com rodela de limão.', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', gallery: [], nutrition: 'Calorias: 140kcal | Açúcares: 39g' },
      { id: 10, name: 'Guaraná Antarctica', price: 7.00, description: 'Refrigerante lata 350ml.', image: 'https://images.unsplash.com/photo-1629032355262-d751086c475d?w=500&q=80', gallery: [], nutrition: 'Calorias: 130kcal | Açúcares: 36g' },
      { id: 11, name: 'Suco de Laranja Natural', price: 12.00, description: 'Suco feito na hora com laranjas selecionadas. Copo de 400ml.', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80', gallery: [], nutrition: 'Calorias: 180kcal | Rico em Vitamina C' },
      { id: 12, name: 'Limonada Suíça', price: 14.00, description: 'Limão batido com leite condensado e bastante gelo.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80', gallery: [], nutrition: 'Calorias: 220kcal | Contém Lactose' },
      { id: 13, name: 'Cerveja Artesanal IPA', price: 18.00, description: 'Cerveja da casa, amargor presente e notas cítricas. Garrafa 600ml.', image: 'https://images.unsplash.com/photo-1518542698889-ca82262f08d5?w=500&q=80', gallery: [], nutrition: 'Calorias: 250kcal | Teor Alcoólico: 6.5%' },
      { id: 14, name: 'Água com Gás e Limão', price: 5.00, description: 'Garrafa 500ml servida com gelo e rodelas de limão siciliano.', image: 'https://images.unsplash.com/photo-1559839914-11aae62e5052?w=500&q=80', gallery: [], nutrition: 'Calorias: 0kcal | Zero Açúcar' }
    ]
  },
  {
    category: 'Sobremesas',
    items: [
      { id: 15, name: 'Petit Gâteau', price: 24.90, description: 'Bolo de chocolate com interior cremoso, servido quente com sorvete de creme.', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&q=80', gallery: [], nutrition: 'Calorias: 550kcal | Contém Glúten e Lactose' },
      { id: 16, name: 'Milkshake de Morango', price: 19.90, description: 'Sorvete batido com morangos frescos, chantilly e calda.', image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&q=80', gallery: [], nutrition: 'Calorias: 480kcal | Rico em Cálcio' },
      { id: 17, name: 'Brownie de Chocolate', price: 18.00, description: 'Pedaço generoso de brownie com nozes, casquinha crocante e interior macio.', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80', gallery: [], nutrition: 'Calorias: 420kcal | Contém Nozes' },
      { id: 18, name: 'Cheesecake de Frutas Vermelhas', price: 22.00, description: 'Torta de queijo cremoso estilo nova-iorquino com generosa calda de frutas vermelhas.', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80', gallery: [], nutrition: 'Calorias: 510kcal | Contém Lactose' },
      { id: 19, name: 'Pudim de Leite Condensado', price: 15.00, description: 'O clássico sem furinhos, derretendo na boca com calda de caramelo escuro.', image: 'https://images.unsplash.com/photo-1590137531776-809ccb440878?w=500&q=80', gallery: [], nutrition: 'Calorias: 380kcal | Não Contém Glúten' },
      { id: 20, name: 'Churros com Doce de Leite', price: 16.50, description: 'Porção com 4 mini churros fritos na hora, passados na canela e açúcar, acompanhados de doce de leite.', image: 'https://images.unsplash.com/photo-1624374053855-3211516e885d?w=500&q=80', gallery: [], nutrition: 'Calorias: 450kcal | Muito Crocante' }
    ]
  }
];

export const initialAdsData = [
  { id: 1, title: 'Milkshake 50% OFF', description: 'Na compra de qualquer lanche.', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80', active: true }
];