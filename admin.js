document.addEventListener('DOMContentLoaded', () => {
  const ADMIN_PASSWORD = 'admin123'; // <<< MUDE PARA UMA SENHA SEGURA
  const loginPage = document.getElementById('loginPage');
  const adminPanel = document.getElementById('adminPanel');
  const loginBtn = document.getElementById('loginBtn');
  const loginPassword = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const productForm = document.getElementById('productForm');
  const promoForm = document.getElementById('promoForm');
  const productsList = document.getElementById('productsList');
  const promoList = document.getElementById('promoList');
  const imagePreview = document.getElementById('imagePreview');
  const productImage = document.getElementById('productImage');
  const cancelEditBtn = document.getElementById('cancelEdit');

  let isLoggedIn = localStorage.getItem('admin_logged') === 'true';
  let editingId = null;

  function checkAuth() {
    if (isLoggedIn) {
      loginPage.style.display = 'none';
      adminPanel.style.display = 'block';
      renderProducts();
      renderPromos();
    } else {
      loginPage.style.display = 'flex';
      adminPanel.style.display = 'none';
    }
  }

  loginBtn.addEventListener('click', () => {
    if (loginPassword.value === ADMIN_PASSWORD) {
      isLoggedIn = true;
      localStorage.setItem('admin_logged', 'true');
      loginError.style.display = 'none';
      checkAuth();
    } else {
      loginError.textContent = 'Senha incorreta';
      loginError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', () => {
    isLoggedIn = false;
    localStorage.removeItem('admin_logged');
    checkAuth();
  });

  loginPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  // Preview de imagem
  productImage.addEventListener('input', () => {
    if (productImage.value) {
      imagePreview.src = productImage.value;
      imagePreview.style.display = 'block';
    } else {
      imagePreview.style.display = 'none';
    }
  });

  function getMenu() {
    return JSON.parse(localStorage.getItem('tele_menu') || '[]');
  }

  function saveMenu(menu) {
    localStorage.setItem('tele_menu', JSON.stringify(menu));
  }

  function renderProducts() {
    const menu = getMenu();
    productsList.innerHTML = '';
    menu.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150?text=Imagem'">
        <div class="item-card-title">${item.name}</div>
        <div class="small" style="color:#666">${item.desc}</div>
        <div class="item-card-price">R$ ${item.price.toFixed(2)}</div>
        <div class="item-actions">
          <button class="btn-edit" data-id="${item.id}">Editar</button>
          <button class="btn-danger" data-id="${item.id}">Deletar</button>
        </div>
      `;
      productsList.appendChild(card);
    });

    // Eventos de editar e deletar
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
    document.querySelectorAll('.btn-danger').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
  }

  function editProduct(id) {
    const menu = getMenu();
    const item = menu.find(m => m.id === id);
    if (!item) return;
    editingId = id;
    document.getElementById('productId').value = id;
    document.getElementById('productName').value = item.name;
    document.getElementById('productDesc').value = item.desc;
    document.getElementById('productPrice').value = item.price;
    document.getElementById('productCategory').value = item.cat;
    document.getElementById('productImage').value = item.img;
    imagePreview.src = item.img;
    imagePreview.style.display = 'block';
    cancelEditBtn.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;
    let menu = getMenu();
    menu = menu.filter(m => m.id !== id);
    saveMenu(menu);
    renderProducts();
  }

  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('productName').value.trim();
    const desc = document.getElementById('productDesc').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const cat = document.getElementById('productCategory').value;
    const img = document.getElementById('productImage').value.trim();

    if (!name || !desc || !price || !cat || !img) {
      alert('Preencha todos os campos');
      return;
    }

    let menu = getMenu();
    if (editingId) {
      const idx = menu.findIndex(m => m.id === editingId);
      if (idx !== -1) {
        menu[idx] = { id: editingId, name, desc, price, cat, img, qty: 1 };
      }
      editingId = null;
      cancelEditBtn.style.display = 'none';
    } else {
      const newId = 'prod_' + Date.now();
      menu.push({ id: newId, name, desc, price, cat, img, qty: 1 });
    }
    saveMenu(menu);
    productForm.reset();
    imagePreview.style.display = 'none';
    renderProducts();
    alert('Produto salvo com sucesso!');
  });

  cancelEditBtn.addEventListener('click', () => {
    editingId = null;
    cancelEditBtn.style.display = 'none';
    productForm.reset();
    imagePreview.style.display = 'none';
  });

  function getPromos() {
    return JSON.parse(localStorage.getItem('tele_promos') || '[]');
  }

  function savePromos(promos) {
    localStorage.setItem('tele_promos', JSON.stringify(promos));
  }

  function renderPromos() {
    const promos = getPromos();
    promoList.innerHTML = '';
    if (promos.length === 0) {
      promoList.innerHTML = '<p class="small">Nenhuma promoção cadastrada</p>';
      return;
    }
    promos.forEach((promo, idx) => {
      const el = document.createElement('div');
      el.className = 'promo-item';
      el.innerHTML = `
        <div>
          <strong>${promo.title}</strong> ${promo.code ? `(${promo.code})` : ''}<br>
          <span class="small">-${promo.discount}%</span>
        </div>
        <button class="btn-danger" style="padding:6px 8px" data-idx="${idx}">Remover</button>
      `;
      promoList.appendChild(el);
    });
    document.querySelectorAll('.promo-item .btn-danger').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        let promos = getPromos();
        promos.splice(idx, 1);
        savePromos(promos);
        renderPromos();
      });
    });
  }

  promoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('promoTitle').value.trim();
    const code = document.getElementById('promoCode').value.trim();
    const discount = parseFloat(document.getElementById('promoDiscount').value);

    if (!title || !discount) {
      alert('Preencha título e desconto');
      return;
    }

    const promos = getPromos();
    promos.push({ title, code, discount });
    savePromos(promos);
    promoForm.reset();
    renderPromos();
    alert('Promoção adicionada!');
  });

  // Migra dados existentes do script.js para localStorage na primeira vez
  const oldMenu = JSON.parse(localStorage.getItem('tele_cart') || '[]');
  if (oldMenu.length === 0 && !localStorage.getItem('tele_menu')) {
    const defaultMenu = [
      { id: 'b1', name: 'Classic Burger', desc: 'Pão brioche, 150g, queijo, alface, tomate', price: 18.50, img: 'https://picsum.photos/seed/b1/600/400', cat: 'hamburguer', qty: 1 },
      { id: 'b2', name: 'Bacon Supreme', desc: 'Bacon crocante, cheddar, molhos especiais', price: 24.00, img: 'https://picsum.photos/seed/b2/600/400', cat: 'hamburguer', qty: 1 },
      { id: 'c1', name: 'Combo Família', desc: '3 hambúrgueres + batata + 2 refrigerantes', price: 79.90, img: 'https://picsum.photos/seed/c1/600/400', cat: 'combo', qty: 1 },
      { id: 'd1', name: 'Coca-Cola 350ml', desc: 'Refrigerante gelado', price: 6.00, img: 'https://picsum.photos/seed/d1/600/400', cat: 'bebida', qty: 1 },
      { id: 'e1', name: 'Batata Frita', desc: 'Porção média, crocante', price: 12.00, img: 'https://picsum.photos/seed/e1/600/400', cat: 'extra', qty: 1 },
    ];
    saveMenu(defaultMenu);
  }

  checkAuth();
});