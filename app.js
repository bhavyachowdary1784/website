const STORAGE_KEY = "hoi_cart_v1";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** @type {{id:string,name:string,price:number,category:"Silk"|"Bridal"|"Party Wear"|"Cotton",image:string,tag?:string}[]} */
const PRODUCTS = [
  {
    id: "banarasi-rose-gold",
    name: "Banarasi Silk Saree",
    price: 8999,
    category: "Silk",
    tag: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "kanchi-bridal-maroon",
    name: "Kanchipuram Bridal Saree",
    price: 12499,
    category: "Bridal",
    tag: "Bridal Edit",
    image:
      "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "georgette-party-blush",
    name: "Designer Georgette Saree",
    price: 4999,
    category: "Party Wear",
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1583391733981-2c52b6b6e9a6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cotton-handblock-cream",
    name: "Handblock Cotton Saree",
    price: 2599,
    category: "Cotton",
    tag: "Everyday",
    image:
      "https://images.unsplash.com/photo-1623082574085-157d955f59f7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "silk-temple-gold",
    name: "Temple Border Silk Saree",
    price: 10999,
    category: "Silk",
    tag: "Heritage",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "bridal-zari-ivory",
    name: "Zari Bridal Saree",
    price: 14999,
    category: "Bridal",
    tag: "Limited",
    image:
      "https://images.unsplash.com/photo-1570943732778-e19ed8ae4ede?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "party-sequin-wine",
    name: "Sequin Party Saree",
    price: 6999,
    category: "Party Wear",
    image:
      "https://images.unsplash.com/photo-1520974735194-fdb60b04b2e5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cotton-jamdani-pink",
    name: "Jamdani Cotton Saree",
    price: 3499,
    category: "Cotton",
    image:
      "https://images.pexels.com/photos/1130620/pexels-photo-1130620.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

/** @type {{id:string, qty:number}[]} */
let cart = loadCart();

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.id === "string" && Number.isFinite(x.qty))
      .map((x) => ({ id: x.id, qty: Math.max(1, Math.floor(x.qty)) }));
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartSubtotal() {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
}

function addToCart(productId) {
  const existing = cart.find((x) => x.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: productId, qty: 1 });
  saveCart();
  renderCart();
  openCart();
  toast("Added to cart");
}

function removeFromCart(productId) {
  cart = cart.filter((x) => x.id !== productId);
  saveCart();
  renderCart();
}

function setQty(productId, qty) {
  const nextQty = Math.max(1, Math.floor(qty));
  const existing = cart.find((x) => x.id === productId);
  if (!existing) return;
  existing.qty = nextQty;
  saveCart();
  renderCart();
}

function decQty(productId) {
  const existing = cart.find((x) => x.id === productId);
  if (!existing) return;
  if (existing.qty === 1) removeFromCart(productId);
  else setQty(productId, existing.qty - 1);
}

function incQty(productId) {
  const existing = cart.find((x) => x.id === productId);
  if (!existing) return;
  setQty(productId, existing.qty + 1);
}

function renderFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map((p) => productCardHTML(p)).join("");

  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function productCardHTML(p) {
  const tag = p.tag
    ? `<span class="product-tag" aria-label="${escapeHtml(p.tag)}">${escapeHtml(p.tag)}</span>`
    : "";

  return `
    <article class="product-card" data-product="${escapeHtml(p.id)}">
      <div class="product-media">
        ${tag}
        <img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy" />
      </div>
      <div class="product-body">
        <div class="product-meta">
          <p class="product-category">${escapeHtml(p.category)}</p>
          <h3 class="product-title">${escapeHtml(p.name)}</h3>
        </div>
        <div class="product-buy">
          <p class="product-price">${money.format(p.price)}</p>
          <button class="btn btn-solid" type="button" data-add="${escapeAttr(p.id)}">Add to cart</button>
        </div>
      </div>
    </article>
  `;
}

function renderCart() {
  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = String(cartCount());

  const list = document.getElementById("cartItems");
  const empty = document.getElementById("cartEmpty");
  const subtotalEl = document.getElementById("cartSubtotal");

  if (subtotalEl) subtotalEl.textContent = money.format(cartSubtotal());

  if (!list || !empty) return;

  if (cart.length === 0) {
    empty.hidden = false;
    list.innerHTML = "";
    return;
  }

  empty.hidden = true;
  list.innerHTML = cart
    .map((item) => {
      const p = PRODUCTS.find((x) => x.id === item.id);
      if (!p) return "";
      return `
        <div class="cart-item" data-id="${escapeAttr(p.id)}">
          <img class="cart-item-img" src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy" />
          <div class="cart-item-main">
            <p class="cart-item-title">${escapeHtml(p.name)}</p>
            <p class="cart-item-price">${money.format(p.price)}</p>
            <div class="cart-item-actions">
              <div class="qty">
                <button class="qty-btn" type="button" data-dec="${escapeAttr(p.id)}" aria-label="Decrease quantity">−</button>
                <span class="qty-value" aria-label="Quantity">${item.qty}</span>
                <button class="qty-btn" type="button" data-inc="${escapeAttr(p.id)}" aria-label="Increase quantity">+</button>
              </div>
              <button class="link-danger" type="button" data-remove="${escapeAttr(p.id)}">Remove</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  list.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.remove));
  });
  list.querySelectorAll("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => decQty(btn.dataset.dec));
  });
  list.querySelectorAll("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => incQty(btn.dataset.inc));
  });
}

function openCart() {
  document.body.classList.add("cart-open");
  const overlay = document.getElementById("overlay");
  if (overlay) overlay.hidden = false;
}

function closeCart() {
  document.body.classList.remove("cart-open");
  const overlay = document.getElementById("overlay");
  if (overlay) overlay.hidden = true;
}

function setupNavbar() {
  const burger = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  const cartBtn = document.getElementById("cartButton");
  const closeBtn = document.getElementById("cartClose");
  const overlay = document.getElementById("overlay");

  burger?.addEventListener("click", () => {
    const isOpen = menu?.getAttribute("data-open") === "true";
    menu?.setAttribute("data-open", String(!isOpen));
    burger.setAttribute("aria-expanded", String(!isOpen));
  });

  menu?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      menu.setAttribute("data-open", "false");
      burger?.setAttribute("aria-expanded", "false");
    });
  });

  cartBtn?.addEventListener("click", openCart);
  closeBtn?.addEventListener("click", closeCart);
  overlay?.addEventListener("click", () => {
    closeCart();
    menu?.setAttribute("data-open", "false");
    burger?.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });
}

function setupTestimonials() {
  const track = document.getElementById("testimonialTrack");
  const prev = document.getElementById("testimonialPrev");
  const next = document.getElementById("testimonialNext");
  if (!track || !prev || !next) return;

  const slides = Array.from(track.querySelectorAll(".testimonial"));
  if (slides.length === 0) return;

  let idx = 0;
  const go = (nextIdx) => {
    idx = (nextIdx + slides.length) % slides.length;
    track.style.transform = `translateX(${-idx * 100}%)`;
  };

  prev.addEventListener("click", () => go(idx - 1));
  next.addEventListener("click", () => go(idx + 1));

  const timer = window.setInterval(() => go(idx + 1), 6500);
  track.addEventListener("mouseenter", () => window.clearInterval(timer), { once: true });
}

function setupNewsletter() {
  const form = document.getElementById("newsletterForm");
  const msg = document.getElementById("newsletterMsg");
  if (!form || !msg) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    if (!email.includes("@")) {
      msg.textContent = "Please enter a valid email address.";
      msg.dataset.type = "error";
      return;
    }
    msg.textContent = "Thanks! You’re subscribed to House of Isha updates.";
    msg.dataset.type = "success";
    form.reset();
  });
}

function toast(text) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = text;
  el.classList.add("toast-show");
  window.setTimeout(() => el.classList.remove("toast-show"), 1800);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("`", "&#096;");
}

function init() {
  renderFeatured();
  setupNavbar();
  setupTestimonials();
  setupNewsletter();
  renderCart();
}

document.addEventListener("DOMContentLoaded", init);

