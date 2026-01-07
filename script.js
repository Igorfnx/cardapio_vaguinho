// script.js - gerencia menu e carrinho + animação de voo da imagem até o carrinho
document.addEventListener('DOMContentLoaded', () => {
  const menuGrid = document.getElementById('menuGrid');
  const categories = document.getElementById('categories');
  const search = document.getElementById('search');
  const cartBtn = document.getElementById('cartBtn');
  const cartModal = document.getElementById('cartModal');
  const closeCart = document.getElementById('closeCart');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');
  const clearCartBtn = document.getElementById('clearCart');
  const checkoutBtn = document.getElementById('checkout');
  const menuToggle = document.getElementById('menuToggle');

  // Carrega menu do localStorage (admin) ou usa itens de exemplo
  let menu = JSON.parse(localStorage.getItem('tele_menu') || '[]');
  if (menu.length === 0) {
    menu = [
      { id: 'b1', name: 'Classic Burger', desc: 'Pão brioche, 150g, queijo, alface, tomate', price: 18.50, img:'https://picsum.photos/seed/b1/600/400', cat:'hamburguer' },
      { id: 'b2', name: 'Bacon Supreme', desc: 'Bacon crocante, cheddar, molhos especiais', price: 24.00, img:'https://picsum.photos/seed/b2/600/400', cat:'hamburguer' },
      { id: 'c1', name: 'Combo Família', desc: '3 hambúrgueres + batata + 2 refrigerantes', price: 79.90, img:'https://picsum.photos/seed/c1/600/400', cat:'combo' },
      { id: 'd1', name: 'Coca-Cola 350ml', desc: 'Refrigerante gelado', price: 6.00, img:'https://picsum.photos/seed/d1/600/400', cat:'bebida' },
      { id: 'e1', name: 'Batata Frita', desc: 'Porção média, crocante', price: 12.00, img:'https://picsum.photos/seed/e1/600/400', cat:'extra' },
      { id: 'b3', name: 'Cheeseburger Veg', desc: 'Hambúrguer vegetal, queijo vegano', price: 22.00, img:'https://picsum.photos/seed/b3/600/400', cat:'hamburguer' },
      { id: 'c2', name: 'Combo Duplo', desc: '2x hambúrguer + fritas + bebida', price: 45.00, img:'https://picsum.photos/seed/c2/600/400', cat:'combo' },
    ];
    localStorage.setItem('tele_menu', JSON.stringify(menu));
  }

  // carrinho em localStorage
  let cart = JSON.parse(localStorage.getItem('tele_cart') || '[]');

  function renderMenu(list) {
    menuGrid.innerHTML = '';
    list.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div class="card-body">
          <div class="card-title">${item.name}</div>
          <div class="card-desc">${item.desc}</div>
          <div class="price-row">
            <div class="price">R$ ${item.price.toFixed(2)}</div>
            <div>
              <button class="btn btn-secondary small" data-id="${item.id}" aria-label="Ver">Ver</button>
              <button class="btn btn-primary small add-to-cart" data-id="${item.id}">Adicionar</button>
            </div>
          </div>
        </div>
      `;
      menuGrid.appendChild(card);
    });
  }

  function updateCartUI(){
    const totalQty = cart.reduce((s,i)=>s+i.qty,0);
    cartCount.textContent = totalQty;
    cartItemsEl.innerHTML = '';
    let total = 0;
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="small">Seu carrinho está vazio.</p>';
    } else {
      cart.forEach(it => {
        total += it.price * it.qty;
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
          <img src="${it.img}" alt="${it.name}">
          <div style="flex:1">
            <div style="font-weight:700">${it.name}</div>
            <div class="small">R$ ${it.price.toFixed(2)} x ${it.qty}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <button class="btn small" data-op="increase" data-id="${it.id}">+</button>
            <button class="btn small" data-op="decrease" data-id="${it.id}">-</button>
          </div>
        `;
        cartItemsEl.appendChild(el);
      });
    }
    cartTotalEl.textContent = total.toFixed(2);
    localStorage.setItem('tele_cart', JSON.stringify(cart));
  }

  // cria animação: clona imagem e move até o botão do carrinho
  function flyToCart(imgEl){
    if (!imgEl || !cartBtn) return Promise.resolve();
    return new Promise(resolve => {
      const imgRect = imgEl.getBoundingClientRect();
      const cartRect = cartBtn.getBoundingClientRect();
      const clone = imgEl.cloneNode(true);
      clone.classList.add('fly-img');
      // inicializa estilo do clone
      clone.style.left = imgRect.left + 'px';
      clone.style.top = imgRect.top + 'px';
      clone.style.width = imgRect.width + 'px';
      clone.style.height = imgRect.height + 'px';
      clone.style.position = 'fixed';
      clone.style.opacity = '1';
      document.body.appendChild(clone);

      // força reflow
      clone.getBoundingClientRect();

      const destX = (cartRect.left + cartRect.width/2) - (imgRect.left + imgRect.width/2);
      const destY = (cartRect.top + cartRect.height/2) - (imgRect.top + imgRect.height/2);
      const scale = 0.2;

      requestAnimationFrame(() => {
        clone.style.transform = `translate(${destX}px, ${destY}px) scale(${scale})`;
        clone.style.opacity = '0.6';
      });

      const cleanup = () => {
        if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
        // bump no contador
        if (cartCount) {
          cartCount.classList.add('bump');
          setTimeout(()=> cartCount.classList.remove('bump'), 420);
        }
        resolve();
      };

      clone.addEventListener('transitionend', cleanup, { once: true });
      // fallback cleanup
      setTimeout(cleanup, 900);
    });
  }

  // adiciona ao carrinho — atualiza dados e dispara animação
  function addToCart(id){
    const item = menu.find(m => m.id === id);
    if (!item) return;
    // elemento de imagem da carta correspondente (se renderizada)
    const btnEl = menuGrid.querySelector(`.add-to-cart[data-id="${id}"]`);
    const imgEl = btnEl ? btnEl.closest('.card').querySelector('img') : null;

    // atualiza dados do carrinho (optimista)
    const exists = cart.find(c => c.id === id);
    if (exists) exists.qty += 1;
    else cart.push({...item, qty: 1});
    updateCartUI();

    // dispara animação (não bloqueante)
    flyToCart(imgEl).catch(() => {});
  }

  // eventos
  menuGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (btn) addToCart(btn.dataset.id);
  });

  categories.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    const filtered = cat === 'all' ? menu : menu.filter(it => it.cat === cat);
    renderMenu(filtered);
  });

  search.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = menu.filter(it => it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q));
    renderMenu(filtered);
  });

  cartBtn.addEventListener('click', () => cartModal.setAttribute('aria-hidden', 'false'));
  closeCart.addEventListener('click', () => cartModal.setAttribute('aria-hidden', 'true'));
  cartModal.addEventListener('click', (e) => { if (e.target === cartModal) cartModal.setAttribute('aria-hidden','true'); });

  cartItemsEl.addEventListener('click', (e) => {
    const opBtn = e.target.closest('button[data-op]');
    if (!opBtn) return;
    const id = opBtn.dataset.id;
    const op = opBtn.dataset.op;
    const idx = cart.findIndex(c => c.id === id);
    if (idx === -1) return;
    if (op === 'increase') cart[idx].qty += 1;
    if (op === 'decrease') {
      cart[idx].qty -= 1;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    updateCartUI();
  });

  clearCartBtn.addEventListener('click', () => {
    cart = [];
    updateCartUI();
  });

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }
    window.location.href = 'checkout.html';
  });

  menuToggle.addEventListener('click', () => {
    const cat = document.querySelector('.categories');
    if (!cat) return;
    if (getComputedStyle(cat).display === 'none') cat.style.display = 'flex';
    else cat.style.display = 'none';
  });

  // inicializa
  renderMenu(menu);
  updateCartUI();
});
