const categories = [
  { id: "ruang_tamu", label: "Ruang Tamu", count: 5 },
  { id: "ruang_keluarga", label: "Ruang Keluarga", count: 5 },
  { id: "kamar_tidur", label: "Kamar Tidur", count: 5 },
  { id: "ruang_makan", label: "Ruang Makan", count: 5 },
  { id: "ruang_kerja", label: "Ruang Kerja", count: 5 },
  { id: "dapur", label: "Dapur", count: 5 },
  { id: "kamar_mandi", label: "Kamar Mandi", count: 5 },
  { id: "teras", label: "Teras", count: 5 },
  { id: "garasi", label: "Garasi", count: 5 },
  { id: "ruang ibadah", label: "Ruang Ibadah", count: 6 },
];

let collectionIndex = 0;
const products = categories.flatMap((category) =>
  Array.from({ length: category.count }, (_, imageIndex) => {
    collectionIndex += 1;
    const number = String(collectionIndex).padStart(2, "0");
    return {
      id: `${encodeURIComponent(category.id)}-${number}`,
      categoryId: category.id,
      category: category.label,
      name: `Inspirasi ${category.label.toLocaleLowerCase("id")} ${number}`,
      image: `${encodeURIComponent(category.id)}/image${imageIndex + 1}.jpeg`,
      number,
    };
  }),
);

const categoryList = document.querySelector("#category-list");
const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const productDialog = document.querySelector("#product-dialog");
const dialogContent = document.querySelector("#dialog-content");
const dialogClose = document.querySelector("#dialog-close");
let selectedCategory = "all";

function createCategoryButtons() {
  const options = [{ id: "all", label: "Semua" }, ...categories];
  categoryList.innerHTML = options.map(({ id, label }) => `
    <button class="category-chip" type="button" data-category="${id}" aria-pressed="${id === selectedCategory}">
      ${label}
    </button>
  `).join("");
}

function getVisibleProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("id");
  const visibleProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    const matchesQuery = `${product.name} ${product.category}`.toLocaleLowerCase("id").includes(query);
    return matchesCategory && matchesQuery;
  });

  if (sortSelect.value === "name") {
    visibleProducts.sort((a, b) => a.name.localeCompare(b.name, "id"));
  } else if (sortSelect.value === "category") {
    visibleProducts.sort((a, b) =>
      a.category.localeCompare(b.category, "id") || a.name.localeCompare(b.name, "id"),
    );
  }
  return visibleProducts;
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" />
        <span class="product-index">KOLEKSI ${product.number}</span>
        <button class="product-open" type="button" data-product="${product.id}" aria-label="Lihat detail ${product.name}">↗</button>
      </div>
      <div class="product-meta"><span>${product.category}</span><span>Rendi Living</span></div>
      <h3 class="product-name">${product.name}</h3>
    </article>
  `).join("");
  resultCount.textContent = `${visibleProducts.length} inspirasi ruang`;
  emptyState.hidden = visibleProducts.length > 0;
}

function openProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const message = encodeURIComponent(
    `Halo Rendi Living, saya tertarik dengan ${product.name} (${product.category}). Boleh minta informasi harga dan detailnya?`,
  );
  dialogContent.innerHTML = `
    <img class="dialog-image" src="${product.image}" alt="${product.name}" />
    <div class="dialog-copy">
      <p class="dialog-category">${product.category} · Koleksi ${product.number}</p>
      <h2 id="dialog-title">${product.name}</h2>
      <p class="dialog-description">Inspirasi furnitur untuk melengkapi ruang favoritmu. Hubungi kami untuk informasi harga, ukuran, dan detail produk.</p>
      <a class="button button-olive" href="https://wa.me/?text=${message}" target="_blank" rel="noopener noreferrer">
        Tanya melalui WhatsApp <span aria-hidden="true">↗</span>
      </a>
    </div>
  `;
  productDialog.showModal();
}

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  categoryList.querySelectorAll("[data-category]").forEach((categoryButton) => {
    categoryButton.setAttribute("aria-pressed", String(categoryButton === button));
  });
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product]");
  if (button) openProduct(button.dataset.product);
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
dialogClose.addEventListener("click", () => productDialog.close());
productDialog.addEventListener("click", (event) => {
  if (event.target === productDialog) productDialog.close();
});

document.querySelector("#year").textContent = new Date().getFullYear();
createCategoryButtons();
renderProducts();