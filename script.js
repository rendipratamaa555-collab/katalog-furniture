const categories = [
  { id: "ruang_tamu", label: "Ruang Tamu", files: ["image1.jpeg", "image2.jpeg", "image3.jpeg"] },
  { id: "ruang_keluarga", label: "Ruang Keluarga", files: ["image1.jpeg", "image2.jpeg", "image3.jpeg", "image4.jpeg"] },
  { id: "kamar_tidur", label: "Kamar Tidur", files: ["image1.jpeg", "image2.jpeg", "image3.jpeg", "image4.jpeg"] },
  { id: "ruang_makan", label: "Ruang Makan", files: [
    "WhatsApp Image 2026-10-19 at 14.49.42.jpeg",
    "WhatsApp Image 2026-10-19 at 14.49.43.jpeg",
    "WhatsApp Image 2026-10-19 at 14.49.43 (1).jpeg",
    "WhatsApp Image 2026-10-19 at 14.49.43 (2).jpeg",
  ] },
  { id: "ruang_kerja", label: "Ruang Kerja", files: [
    "WhatsApp Image 2026-10-19 at 17.02.59.jpeg",
    "image1.jpeg",
    "image2.jpeg",
    "image3.jpeg",
  ] },
  { id: "dapur", label: "Dapur", files: ["image1.jpeg", "image2.jpeg", "image3.jpeg", "image4.jpeg"] },
  { id: "kamar_mandi", label: "Kamar Mandi", files: ["image1.jpeg", "image2.jpeg", "image3.jpeg", "image4.jpeg"] },
  { id: "teras", label: "Teras", files: [
    "WhatsApp Image 2026-10-19 at 15.02.02.jpeg",
    "WhatsApp Image 2026-10-19 at 15.02.02 (1).jpeg",
    "WhatsApp Image 2026-10-19 at 15.02.02 (2).jpeg",
    "WhatsApp Image 2026-10-19 at 15.02.02 (1) (1).jpeg",
  ] },
  { id: "garasi", label: "Garasi", files: ["image1.jpeg", "image2.jpeg", "image3.jpeg", "image4.jpeg"] },
  { id: "ruang sholat", label: "Ruang Sholat", files: ["image1.jpeg", "image2.jpeg", "image3.jpeg", "image4.jpeg"] },
];

const products = categories.flatMap((category) =>
  category.files.map((file, index) => ({
    id: `${category.id}-${index + 1}`,
    categoryId: category.id,
    category: category.label,
    name: `Inspirasi ${category.label.toLowerCase()} ${String(index + 1).padStart(2, "0")}`,
    image: `${category.id.split("/").map(encodeURIComponent).join("/")}/${encodeURIComponent(file)}`,
    number: String(index + 1).padStart(2, "0"),
  })),
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
const themeToggle = document.querySelector("#theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

let selectedCategory = "all";

function setTheme(theme, persist = false) {
  const isDark = theme === "dark";

  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.title = `Aktifkan mode ${isDark ? "terang" : "gelap"}`;
  themeColor.content = isDark ? "#191a17" : "#f7f5f0";

  if (persist) {
    localStorage.setItem("katalog-furniture-theme", theme);
  }
}

const savedTheme = localStorage.getItem("katalog-furniture-theme");
const initialTheme = savedTheme === "light" || savedTheme === "dark"
  ? savedTheme
  : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

setTheme(initialTheme);
themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
});

function createCategoryButtons() {
  const options = [{ id: "all", label: "Semua" }, ...categories.map(({ id, label }) => ({ id, label }))];

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
    visibleProducts.sort((a, b) => a.category.localeCompare(b.category, "id") || a.name.localeCompare(b.name, "id"));
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
        <button class="product-open" type="button" data-product="${product.id}" aria-label="Lihat detail ${product.name}">
          ↗
        </button>
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
  if (!product) {
    return;
  }

  const message = encodeURIComponent(`Halo Rendi Living, saya tertarik dengan ${product.name} (${product.category}). Boleh minta informasi harga dan detailnya?`);
  const whatsappUrl = `https://wa.me/?text=${message}`;

  dialogContent.innerHTML = `
    <img class="dialog-image" src="${product.image}" alt="${product.name}" />
    <div class="dialog-copy">
      <p class="dialog-category">${product.category} · Koleksi ${product.number}</p>
      <h2 id="dialog-title">${product.name}</h2>
      <p class="dialog-description">
        Inspirasi furniture untuk melengkapi ruang favoritmu. Hubungi kami untuk informasi harga,
        ukuran, dan detail produk.
      </p>
      <a class="button button-olive" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">
        Tanya melalui WhatsApp <span aria-hidden="true">↗</span>
      </a>
    </div>
  `;

  productDialog.showModal();
}

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) {
    return;
  }

  selectedCategory = button.dataset.category;
  categoryList.querySelectorAll("[data-category]").forEach((categoryButton) => {
    categoryButton.setAttribute("aria-pressed", String(categoryButton === button));
  });
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product]");
  if (button) {
    openProduct(button.dataset.product);
  }
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
dialogClose.addEventListener("click", () => productDialog.close());
productDialog.addEventListener("click", (event) => {
  if (event.target === productDialog) {
    productDialog.close();
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();
createCategoryButtons();
renderProducts();
