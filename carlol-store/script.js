// carlol storefront logic
(function () {
  const products = window.PRODUCTS || [];
  let currentCat = "All";
  let cart = JSON.parse(localStorage.getItem("carlol_cart") || "[]");

  const grid = document.getElementById("productsGrid");
  const filters = document.getElementById("filters");
  const cartCount = document.getElementById("cartCount");
  const cartDrawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("overlay");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const toast = document.getElementById("toast");

  /* ---------- Render ---------- */
  function categories() {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...set];
  }

  function renderFilters() {
    filters.innerHTML = categories()
      .map(
        (c) =>
          `<button class="filter-chip ${c === currentCat ? "active" : ""}" data-cat="${c}">${c}</button>`
      )
      .join("");
    filters.querySelectorAll(".filter-chip").forEach((b) => {
      b.addEventListener("click", () => {
        currentCat = b.dataset.cat;
        renderFilters();
        renderProducts();
      });
    });
  }

  function money(n, currency) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(n);
    } catch (e) {
      return "$" + n.toFixed(2);
    }
  }

  function renderProducts() {
    const list = currentCat === "All" ? products : products.filter((p) => p.category === currentCat);
    if (!list.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">No products yet.</div>`;
      return;
    }
    grid.innerHTML = list
      .map(
        (p) => `
        <article class="product-card">
          <div class="product-image">
            <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'"/>
          </div>
          <div class="product-cat">${p.category || "General"}</div>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-price">${money(p.price, p.currency)}</div>
          <p class="product-desc">${p.description || ""}</p>
          <button class="add-btn" data-id="${p.id}">Add to Cart</button>
        </article>`
      )
      .join("");
    grid.querySelectorAll(".add-btn").forEach((b) => {
      b.addEventListener("click", () => addToCart(b.dataset.id));
    });
  }

  /* ---------- Cart ---------- */
  function addToCart(id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const existing = cart.find((x) => x.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id: p.id, name: p.name, price: p.price, currency: p.currency, image: p.image, qty: 1 });
    saveCart();
    showToast(`${p.name} added to cart`);
  }

  function removeFromCart(id) {
    cart = cart.filter((x) => x.id !== id);
    saveCart();
  }

  function changeQty(id, delta) {
    const item = cart.find((x) => x.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else saveCart();
  }

  function saveCart() {
    localStorage.setItem("carlol_cart", JSON.stringify(cart));
    renderCart();
  }

  function renderCart() {
    const count = cart.reduce((s, x) => s + x.qty, 0);
    cartCount.textContent = count;
    if (!cart.length) {
      cartItems.innerHTML = `<div class="cart-empty">Your cart is empty.</div>`;
      cartTotal.textContent = money(0);
      return;
    }
    cartItems.innerHTML = cart
      .map(
        (i) => `
        <div class="cart-item">
          <img src="${i.image}" alt="${i.name}" onerror="this.style.background='#E3DED4';this.src=''"/>
          <div class="cart-item-info">
            <div class="cart-item-name">${i.name}</div>
            <div class="cart-item-price">${money(i.price, i.currency)}</div>
            <div class="qty-row">
              <button class="qty-btn" data-act="dec" data-id="${i.id}">−</button>
              <span>${i.qty}</span>
              <button class="qty-btn" data-act="inc" data-id="${i.id}">+</button>
              <button class="remove-btn" data-act="rm" data-id="${i.id}">Remove</button>
            </div>
          </div>
        </div>`
      )
      .join("");
    cartItems.querySelectorAll("[data-act]").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        if (b.dataset.act === "inc") changeQty(id, 1);
        else if (b.dataset.act === "dec") changeQty(id, -1);
        else removeFromCart(id);
      });
    });
    const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
    cartTotal.textContent = money(total, cart[0]?.currency);
  }

  function openCart() {
    cartDrawer.classList.add("open");
    overlay.classList.add("open");
  }
  function closeCart() {
    cartDrawer.classList.remove("open");
    overlay.classList.remove("open");
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  /* ---------- Checkout ---------- */
  function checkout() {
    if (!cart.length) return;
    const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
    const lines = cart.map((i) => `${i.qty}× ${i.name} — ${money(i.price * i.qty, i.currency)}`).join("%0A");
    const subject = encodeURIComponent(`Order from carlol (${money(total, cart[0].currency)})`);
    const body = encodeURIComponent(`Hi carlol,%0A%0AI'd like to order:%0A${lines}%0A%0ATotal: ${money(total, cart[0].currency)}%0A%0APlease reply with payment details.`);
    window.location.href = `mailto:hello@carlol.store?subject=${subject}&body=${body}`;
  }

  /* ---------- Init ---------- */
  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.getElementById("checkoutBtn").addEventListener("click", checkout);

  renderFilters();
  renderProducts();
  renderCart();
})();
