document.addEventListener('DOMContentLoaded', () => {
  const PHONE_WHATS = '5551998785208'; // <-- coloque o número da lancheria (formato internacional sem +)
  const WHATSAPP_REDIRECT = ''; // <-- ou coloque seu link de redirecionamento personalizado (deixe vazio para usar wa.me)

  const cart = JSON.parse(localStorage.getItem('tele_cart') || '[]');

  const itemsList = document.getElementById('itemsList');
  const summaryTotal = document.getElementById('summaryTotal');
  const deliveryType = document.getElementById('deliveryType');
  const addressField = document.getElementById('addressField');
  const placeOrderBtn = document.getElementById('placeOrder');
  const customerName = document.getElementById('customerName');
  const customerPhone = document.getElementById('customerPhone');
  const addressInput = document.getElementById('address');
  const paymentMethod = document.getElementById('paymentMethod');

  if (!cart || cart.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  function renderSummary() {
    itemsList.innerHTML = '';
    let total = 0;
    cart.forEach(it => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `<div>${it.name} x ${it.qty}</div><div>R$ ${(it.price * it.qty).toFixed(2)}</div>`;
      itemsList.appendChild(row);
      total += it.price * it.qty;
    });
    summaryTotal.textContent = `R$ ${total.toFixed(2)}`;
  }

  function toggleAddressField() {
    addressField.style.display = (deliveryType.value === 'entrega') ? 'block' : 'none';
  }

  deliveryType.addEventListener('change', toggleAddressField);
  toggleAddressField();

  customerPhone.addEventListener('input', (e) => {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '');
    if (digits.length > 11) digits = digits.slice(0, 11);
    if (digits.length <= 2) input.value = digits ? `(${digits}` : '';
    else input.value = `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  });

  placeOrderBtn.addEventListener('click', () => {
    const name = customerName.value.trim();
    const phoneRaw = (customerPhone.value || '').replace(/\D/g, '');
    const tipo = deliveryType.value;
    const pagamento = paymentMethod.value;
    const endereco = addressInput.value.trim();

    if (!name) return alert('Informe seu nome.');
    if (!phoneRaw) return alert('Informe seu telefone (WhatsApp).');
    if (tipo === 'entrega' && !endereco) return alert('Informe o endereço de entrega.');

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    let msg = `Pedido - Tele Lanches\n`;
    msg += `Cliente: ${name}\n`;
    msg += `WhatsApp: ${customerPhone.value}\n`;
    msg += `Tipo: ${tipo === 'entrega' ? 'Entrega' : 'Retirar no local'}\n`;
    if (tipo === 'entrega') msg += `Endereço: ${endereco}\n`;
    msg += `Pagamento: ${pagamento}\n\n`;
    msg += `Itens:\n`;
    cart.forEach(it => {
      msg += `- ${it.name} x ${it.qty} = R$ ${(it.price * it.qty).toFixed(2)}\n`;
    });
    msg += `\nTotal: R$ ${total.toFixed(2)}`;

    const encoded = encodeURIComponent(msg);
    let targetUrl;
    if (WHATSAPP_REDIRECT && WHATSAPP_REDIRECT.trim() !== '') {
      const sep = WHATSAPP_REDIRECT.includes('?') ? '&' : '?';
      targetUrl = `${WHATSAPP_REDIRECT}${sep}text=${encoded}`;
    } else {
      targetUrl = `https://wa.me/${PHONE_WHATS}?text=${encoded}`;
    }

    // envia direto para o WhatsApp: limpa o carrinho e redireciona imediatamente (mesma aba)
    localStorage.removeItem('tele_cart');
    window.location.href = targetUrl;
  });

  renderSummary();
});