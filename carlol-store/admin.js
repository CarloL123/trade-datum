// carlol admin — product management
(function () {
  const STORAGE_KEY = "carlol_products_draft";

  // Start from products.js (loaded via <script>), but prefer local draft if present
  let products = loadProducts();

  const form = document.getElementById("productForm");
  const editId = document.getElementById("editId");
  const nameIn = document.getElementById("name");
  const catIn = document.getElementById("category");
  const priceIn = document.getElementById("price");
  const curIn = document.getElementById("currency");
  const descIn = document.getElementById("description");
  const imgUrlIn = document.getElementById("imageUrl");
  const imgFile = document.getElementById("imageFile");
  const imgPreview = document.getElementById("imgPreview");
  const imgStatus = document.getElementById("imgStatus");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const list = document.getElementById("adminList");
  const countEl = document.getElementById("prodCount");

  function loadProducts() {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try { return JSON.parse(draft); } catch (e) {}
    }
    return (window.PRODUCTS || []).map((p) => ({ ...p }));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    render();
  }

  function uid() {
    return "p-" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  }

  /* ---------- Image handling ---------- */
  imgFile.addEventListener("change", () => {
    const file = imgFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      imgUrlIn.value = e.target.result;
      showPreview(e.target.result);
      imgStatus.textContent = file.name + " (embedded)";
    };
    reader.readAsDataURL(file);
  });

  imgUrlIn.addEventListener("input", () => {
    if (imgUrlIn.value) showPreview(imgUrlIn.value);
    else {
      imgPreview.style.display = "none";
      imgStatus.textContent = "";
    }
  });

  function showPreview(src) {
    imgPreview.src = src;
    imgPreview.style.display = "block";
    if (!imgFile.files[0]) imgStatus.textContent = "";
  }

  /* ---------- Form submit ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const image = imgUrlIn.value.trim();
    const data = {
      id: editId.value || uid(),
      name: nameIn.value.trim(),
      price: parseFloat(priceIn.value) || 0,
      currency: curIn.value,
      category: catIn.value.trim() || "General",
      description: descIn.value.trim(),
      image: image || "",
    };

    if (editId.value) {
      const idx = products.findIndex((p) => p.id === editId.value);
      if (idx >= 0) products[idx] = data;
    } else {
      products.unshift(data);
    }
    resetForm();
    save();
  });

  cancelBtn.addEventListener("click", resetForm);

  function resetForm() {
    form.reset();
    editId.value = "";
    submitBtn.textContent = "Add Product";
    cancelBtn.style.display = "none";
    imgPreview.style.display = "none";
    imgStatus.textContent = "";
  }

  /* ---------- List rendering ---------- */
  function render() {
    countEl.textContent = products.length;
    if (!products.length) {
      list.innerHTML = `<div class="empty-state">No products yet. Add your first product above.</div>`;
      return;
    }
    list.innerHTML = products
      .map(
        (p) => `
        <div class="admin-item">
          <img src="${p.image}" alt="" onerror="this.style.display='none'"/>
          <div class="admin-item-meta">
            <div class="admin-item-name">${p.name}</div>
            <div class="admin-item-sub">${p.category} · ${symbol(p.currency)}${p.price.toFixed(2)}</div>
          </div>
          <div class="admin-item-actions">
            <button class="icon-btn" data-act="edit" data-id="${p.id}">Edit</button>
            <button class="icon-btn danger" data-act="del" data-id="${p.id}">Delete</button>
          </div>
        </div>`
      )
      .join("");
    list.querySelectorAll("[data-act]").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        if (b.dataset.act === "edit") editProduct(id);
        else if (b.dataset.act === "del") deleteProduct(id);
      });
    });
  }

  function symbol(c) {
    return { USD: "$", EUR: "€", GBP: "£", CNY: "¥" }[c] || "$";
  }

  function editProduct(id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    editId.value = p.id;
    nameIn.value = p.name;
    catIn.value = p.category;
    priceIn.value = p.price;
    curIn.value = p.currency;
    descIn.value = p.description;
    imgUrlIn.value = p.image;
    if (p.image) showPreview(p.image);
    submitBtn.textContent = "Update Product";
    cancelBtn.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    products = products.filter((p) => p.id !== id);
    save();
  }

  /* ---------- Reset / export ---------- */
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("Discard all changes and reload products.js?")) return;
    localStorage.removeItem(STORAGE_KEY);
    products = (window.PRODUCTS || []).map((p) => ({ ...p }));
    resetForm();
    render();
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const json = JSON.stringify(products, null, 2);
    const content =
      "// carlol — product catalog\n" +
      "// Generated from admin.html. Replace this file to update the store.\n" +
      "window.PRODUCTS = " + json + ";\n";
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("products.js downloaded. Replace the old products.js with this file, then re-upload to GitHub.");
  });

  render();
})();
