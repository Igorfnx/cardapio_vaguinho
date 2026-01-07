// ...existing code... (header/drawer enhancements) ...
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

  // Exemplo de itens do cardápio — agora busca do localStorage (admin)
  let menu = JSON.parse(localStorage.getItem('tele_menu') || '[]');
  if (menu.length === 0) {
    menu = [
      { id: 'b1', name: 'Classic Burger', desc: 'Pão brioche, 150g, queijo, alface, tomate', price: 18.50, img:'https://picsum.photos/seed/b1/600/400', cat:'hamburguer', qty: 1 },
      { id: 'b2', name: 'Bacon Supreme', desc: 'Bacon crocante, cheddar, molhos especiais', price: 24.00, img:'https://picsum.photos/seed/b2/600/400', cat:'hamburguer', qty: 1 },
      { id: 'c1', name: 'Combo Família', desc: '3 hambúrgueres + batata + 2 refrigerantes', price: 79.90, img:'https://picsum.photos/seed/c1/600/400', cat:'combo', qty: 1 },
      { id: 'd1', name: 'Coca-Cola 350ml', desc: 'Refrigerante gelado', price: 6.00, img:'https://picsum.photos/seed/d1/600/400', cat:'bebida', qty: 1 },
      { id: 'e1', name: 'Batata Frita', desc: 'Porção média, crocante', price: 12.00, img:'https://picsum.photos/seed/e1/600/400', cat:'extra', qty: 1 },
      { id: 'b3', name: 'Cheeseburger Veg', desc: 'Hambúrguer vegetal, queijo vegano', price: 22.00, img:'https://picsum.photos/seed/b3/600/400', cat:'hamburguer', qty: 1 },
      { id: 'c2', name: 'Combo Duplo', desc: '2x hambúrguer + fritas + bebida', price: 45.00, img:'https://picsum.photos/seed/c2/600/400', cat:'combo', qty: 1 },
    ];
    localStorage.setItem('tele_menu', JSON.stringify(menu));
  }

  // carrinho em localStorage
  let cart = JSON.parse(localStorage.getItem('tele_cart') || '[]');

  // ---------- Render menu function (sem alterações) ----------
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

  // ---------- Cart UI (sem alterações importantes) ----------
  function updateCartUI(){
    cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
    cartItemsEl.innerHTML = '';
    let total = 0;
    if(cart.length === 0){
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

  // ---------- Fly to cart animation (sem alterações) ----------
  function flyToCart(imgEl){
    if(!imgEl) return Promise.resolve();
    return new Promise(resolve => {
      const imgRect = imgEl.getBoundingClientRect();
      const cartRect = cartBtn.getBoundingClientRect();
      const clone = imgEl.cloneNode(true);
      clone.classList.add('fly-img');
      // set initial styles
      clone.style.left = imgRect.left + 'px';
      clone.style.top = imgRect.top + 'px';
      clone.style.width = imgRect.width + 'px';
      clone.style.height = imgRect.height + 'px';
      clone.style.position = 'fixed';
      document.body.appendChild(clone);
      // force reflow
      clone.getBoundingClientRect();
      const destX = (cartRect.left + cartRect.width/2) - (imgRect.left + imgRect.width/2);
      const destY = (cartRect.top + cartRect.height/2) - (imgRect.top + imgRect.height/2);
      const scale = 0.2;
      // trigger transition
      requestAnimationFrame(() => {
        clone.style.transform = `translate(${destX}px, ${destY}px) scale(${scale})`;
        clone.style.opacity = '0.6';
      });
      const cleanup = () => {
        if(clone && clone.parentNode) clone.parentNode.removeChild(clone);
        // small bump animation on cart count
        cartCount.classList.add('bump');
        setTimeout(()=> cartCount.classList.remove('bump'), 420);
        resolve();
      };
      clone.addEventListener('transitionend', cleanup, { once: true });
      // fallback
      setTimeout(cleanup, 800);
    });
  }

  function addToCart(id){
    const item = menu.find(m=>m.id===id);
    if(!item) return;
    // find image element in the rendered DOM
    const btnEl = menuGrid.querySelector(`.add-to-cart[data-id="${id}"]`);
    const imgEl = btnEl ? btnEl.closest('.card').querySelector('img') : null;

    // optimistically update cart data for responsiveness
    const exists = cart.find(c=>c.id===id);
    if(exists) exists.qty += 1;
    else cart.push({...item, qty:1});
    updateCartUI();

    // run flying animation (non-blocking)
    flyToCart(imgEl).catch(()=>{});
  }

  // ---------- SIDE DRAWER CREATION & SYNC (novo) ----------
  // create overlay and drawer elements dynamically so HTML doesn't need changes
  const drawerOverlay = document.createElement('div');
  drawerOverlay.className = 'drawer-overlay';
  drawerOverlay.setAttribute('aria-hidden', 'true');

  const sideDrawer = document.createElement('aside');
  sideDrawer.className = 'side-drawer';
  sideDrawer.id = 'sideDrawer';
  sideDrawer.setAttribute('aria-hidden','true');

  // header inside drawer
  const drawerHead = document.createElement('div');
  drawerHead.className = 'drawer-head';
  drawerHead.innerHTML = `<div class="drawer-title">Categorias</div><button id="closeDrawer" aria-label="Fechar menu">✕</button>`;
  sideDrawer.appendChild(drawerHead);

  // container for options
  const drawerList = document.createElement('div');
  drawerList.className = 'drawer-list';
  sideDrawer.appendChild(drawerList);

  document.body.appendChild(drawerOverlay);
  document.body.appendChild(sideDrawer);

  // clone header categories into drawer (keeps original in header)
  function populateDrawerFromHeader(){
    drawerList.innerHTML = '';
    const headerButtons = Array.from(categories.querySelectorAll('.cat-btn'));
    headerButtons.forEach(btn => {
      const clone = btn.cloneNode(true);
      clone.classList.add('drawer-item');
      // ensure dataset is preserved
      clone.dataset.cat = btn.dataset.cat;
      // clicking drawer item should behave same as header
      clone.addEventListener('click', (e) => {
        const cat = clone.dataset.cat;
        selectCategory(cat, 'drawer');
        closeDrawer();
      });
      drawerList.appendChild(clone);
    });
  }
  populateDrawerFromHeader();

  // open/close helpers
  function openDrawer(){
    sideDrawer.setAttribute('aria-hidden','false');
    drawerOverlay.setAttribute('aria-hidden','false');
    menuToggle.setAttribute('aria-expanded','true');
    // sync active state initial
    syncActiveButtons();
  }
  function closeDrawer(){
    sideDrawer.setAttribute('aria-hidden','true');
    drawerOverlay.setAttribute('aria-hidden','true');
    menuToggle.setAttribute('aria-expanded','false');
  }
  function toggleDrawer(){
    const isOpen = sideDrawer.getAttribute('aria-hidden') === 'false';
    if(isOpen) closeDrawer(); else openDrawer();
  }

  // sync active class between header and drawer
  function syncActiveButtons(){
    const activeCat = categories.querySelector('.cat-btn.active')?.dataset.cat || 'all';
    // header
    categories.querySelectorAll('.cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === activeCat);
    });
    // drawer
    sideDrawer.querySelectorAll('.cat-btn, .drawer-item').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === activeCat);
    });
  }

  // function to select a category from any source
  function selectCategory(cat, source){
    // update header active classes
    categories.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    // update drawer active classes
    sideDrawer.querySelectorAll('.cat-btn, .drawer-item').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    const filtered = cat === 'all' ? menu : menu.filter(it => it.cat === cat);
    renderMenu(filtered);
  }

  // handle clicks on header categories (existing UI)
  categories.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-btn');
    if(!btn) return;
    selectCategory(btn.dataset.cat, 'header');
    // if drawer is open (on small devices), close it
    if(sideDrawer.getAttribute('aria-hidden') === 'false') closeDrawer();
  });

  // ensure close button inside drawer works
  document.getElementById('closeDrawer').addEventListener('click', closeDrawer);
  // overlay click closes drawer
  drawerOverlay.addEventListener('click', closeDrawer);

  // keyboard: Esc closes drawer
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      if(sideDrawer.getAttribute('aria-hidden') === 'false') closeDrawer();
      if(cartModal.getAttribute('aria-hidden') === 'false') cartModal.setAttribute('aria-hidden','true');
    }
  });

  // menu toggle now controls the left drawer
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer();
  });

  // keep header categories and drawer in sync on resize (re-populate if header changes)
  window.addEventListener('resize', () => {
    populateDrawerFromHeader();
    syncActiveButtons();
  });

  // ---------- Eventos globais (mantive e integrei) ----------
  menuGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if(btn){
      addToCart(btn.dataset.id);
    }
  });

  search.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = menu.filter(it => {
      return it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q);
    });
    renderMenu(filtered);
  });

  cartBtn.addEventListener('click', () => {
    cartModal.setAttribute('aria-hidden','false');
  });
  closeCart.addEventListener('click', ()=> cartModal.setAttribute('aria-hidden','true'));
  cartModal.addEventListener('click', (e) => {
    if(e.target === cartModal) cartModal.setAttribute('aria-hidden','true');
  });

  cartItemsEl.addEventListener('click', (e) => {
    const opBtn = e.target.closest('button[data-op]');
    if(!opBtn) return;
    const id = opBtn.dataset.id;
    const op = opBtn.dataset.op;
    const idx = cart.findIndex(c=>c.id===id);
    if(idx === -1) return;
    if(op === 'increase') cart[idx].qty += 1;
    if(op === 'decrease') {
      cart[idx].qty -= 1;
      if(cart[idx].qty <= 0) cart.splice(idx,1);
    }
    updateCartUI();
  });

  clearCartBtn.addEventListener('click', () => {
    cart = [];
    updateCartUI();
  });

  checkoutBtn.addEventListener('click', () => {
    if(cart.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }
    // redireciona para a página de checkout onde o cliente preenche dados
    // o carrinho já está salvo em localStorage (tele_cart)
    window.location.href = 'checkout.html';
  });

  // mobile menu toggle earlier logic removed in favor of drawer

  // inicializa
  renderMenu(menu);
  updateCartUI();
  // ensure drawer is initially synced
  syncActiveButtons();
});
