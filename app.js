const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "*************************************************",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "************************************************",
});

// product and cart variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// navigation variables
const menuOverlay = document.querySelector(".menu-overlay");
const menuDom = document.querySelector(".menu");
const menuBtn = document.querySelector(".nav-icon");
const closeMenuBtn = document.querySelector(".close-menu");
const productsPage = document.querySelector(".products");
const homePage = document.querySelector(".hero");
const productsPageRoute = [...document.querySelectorAll(".shop")];
const homePageRoute = [...document.querySelectorAll(".home")];
const contactPage = document.querySelector(".contact");
const contactPageRoute = document.querySelector(".about");

// pagination variables
const pagingDOM = document.querySelector(".pagination");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

// cart
let cart = [];
// buttons
let buttonsDOM = [];
// page number
let page = 0;
// items per page
const itemsPerPage = 8;

// getting the products
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: "******************",
      });

      //let result = await fetch("products.json");
      //let data = await result.json();
      let products = contentful.items;
      products = products.map((item) => {
        const { title, price, details, list } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, details, list, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  hidePaging() {
    pagingDOM.classList.add("hideButtons");
  }
  showPaging() {
    pagingDOM.classList.remove("hideButtons");
  }
  deactivateBtn(pageButton) {
    pageButton.classList.add("deactivate");
    pageButton.deactivated = true;
  }
  activateBtn(pageButton) {
    pageButton.classList.remove("deactivate");
    pageButton.deactivated = false;
  }
  paginateProducts(productsArray, clicked) {
    if (productsArray.length > itemsPerPage) this.showPaging(pagingDOM);
    if (page === 0) {
      this.deactivateBtn(prevBtn);
      this.activateBtn(nextBtn);
    } else if (
      page === Math.floor(productsArray.length / itemsPerPage) ||
      page === productsArray.length / itemsPerPage - 1
    ) {
      this.deactivateBtn(nextBtn);
      this.activateBtn(prevBtn);
    } else {
      this.activateBtn(prevBtn);
      this.activateBtn(nextBtn);
    }
    if (clicked) {
      let current = page * itemsPerPage;
      if (clicked.target.classList.contains("next")) {
        let previous = (page - 1) * itemsPerPage;
        for (let i = current - 1; i >= previous; i--) {
          productsArray[i].classList.add("hide");
        }
        for (let i = current; i < current + itemsPerPage; i++) {
          if (!productsArray[i]) break;
          productsArray[i].classList.remove("hide");
        }
      } else {
        let previous = (page + 1) * itemsPerPage;
        for (let i = previous; i < previous + itemsPerPage; i++) {
          if (!productsArray[i]) break;
          productsArray[i].classList.add("hide");
        }
        for (let i = current; i < current + itemsPerPage; i++) {
          productsArray[i].classList.remove("hide");
        }
      }
    } else {
      for (let i = 0; i < productsArray.length; i++) {
        if (i >= itemsPerPage) productsArray[i].classList.add("hide");
      }
      nextBtn.addEventListener("click", (event) => {
        if (!event.target.classList.contains("deactivate")) {
          page++;
          this.paginateProducts(productsArray, event);
        }
      });
      prevBtn.addEventListener("click", (event) => {
        if (!event.target.classList.contains("deactivate")) {
          page--;
          this.paginateProducts(productsArray, event);
        }
      });
    }
  }
  addListItems(detailsList, products) {
    for (let i = 0; i < products.length; i++) {
      let list = products[i].list;
      if (list) {
        for (let item of list) {
          let li = document.createElement("li");
          li.innerText = `${item}`;
          detailsList[i].appendChild(li);
        }
      }
    }
  }
  displayProducts(products) {
    let result = ``;
    products.forEach((product) => {
      result += `
          <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart">
                add to cart
              </i>
            </button>
          </div>
          <div class="info">
            <div class="details">
              <h3>${product.title}</h3>
              <h4>$${product.price}</h4>
            </div>
            <div class="info-icon" data-id=${product.id}>
              <i class="fa fa-info-circle" aria-hidden="true"> Info</i>
            </div>
          </div>
          <div class="modal-overlay" data-id=${product.id}>
            <div class="modal-product" data-id=${product.id}>
              <span class="close-modal" data-id=${product.id}>
                <i class="fas fa-times"></i>
              </span>
              <div class="modal-center">
                <h2>${product.title}</h2>
                <img src=${product.image} alt="product" />
                <div class="modal-details">
                <ul class="details-list">
                </ul>
                <h4>$${product.price}</h4>
                  <p>
                    ${product.details}
                  </p>
                  <button class="extra-bag-btn banner-btn" data-id=${product.id}>Add to cart</button>
                </div>
              </div>
            </div>
          </div>
        </article>
        <!-- end of single product -->`;
    });
    productsDOM.innerHTML = result;
    // separate displayed products into percieved pages with next and prev buttons
    const productsArray = [...document.querySelectorAll(".product")];
    this.paginateProducts(productsArray);
    // add list information from server to product modals
    const detailsList = document.querySelectorAll(".details-list");
    this.addListItems(detailsList, products);
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn, .extra-bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        // deactivate specifc item add to cart buttons and change text on click
        buttons.forEach((btn) => {
          let buttonId = btn.dataset.id;
          if (buttonId === event.currentTarget.dataset.id) {
            btn.innerText = "In Cart";
            btn.disabled = true;
          }
        });
        // close modal if modal cart button clicked
        if (event.target.classList.contains("extra-bag-btn")) {
          let modalItem =
            event.target.parentElement.parentElement.parentElement;
          modalItem.classList.remove("show");
          modalItem.parentElement.classList.remove("transparentBcg");
        }
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
      });
    });
  }
  getModals() {
    // modal variables
    const modalOverlays = [...document.querySelectorAll(".modal-overlay")];
    const modalDoms = [...document.querySelectorAll(".modal-product")];
    const openBtns = [...document.querySelectorAll(".info-icon")];
    const closeBtns = [...document.querySelectorAll(".close-modal")];

    // open modal
    openBtns.forEach((button) => {
      button.addEventListener("click", (event) => {
        modalOverlays.forEach((overlay) => {
          if (overlay.dataset.id === event.currentTarget.dataset.id)
            overlay.classList.add("transparentBcg");
        });
        modalDoms.forEach((modal) => {
          if (modal.dataset.id === event.currentTarget.dataset.id)
            modal.classList.add("show");
        });
      });
    });

    // close modal
    closeBtns.forEach((button) => {
      button.addEventListener("click", (event) => {
        modalOverlays.forEach((overlay) => {
          if (overlay.dataset.id === event.currentTarget.dataset.id)
            overlay.classList.remove("transparentBcg");
        });
        modalDoms.forEach((modal) => {
          if (modal.dataset.id === event.currentTarget.dataset.id)
            modal.classList.remove("show");
        });
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} />
            <div>
              <h4>${item.title}</h4>
              <h5>£${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>
                remove
              </span>
            </div>
            <div class="cart-arithmetic">
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  showMenu() {
    menuOverlay.classList.add("transparentBcg");
    menuDom.classList.add("show");
  }
  hideMenu() {
    menuOverlay.classList.remove("transparentBcg");
    menuDom.classList.remove("show");
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
    menuBtn.addEventListener("click", this.showMenu);
    closeMenuBtn.addEventListener("click", this.hideMenu);
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
  getModalButton(id) {
    return [...buttonsDOM].reverse().find((button) => button.dataset.id === id);
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id != id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    let mButton = this.getModalButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    mButton.disabled = false;
    mButton.innerHTML = `Add to cart`;
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount++;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let removeAmount = event.target;
        let id = removeAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount--;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          removeAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(removeAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  displayPage(page) {
    page.classList.remove("hide");
  }
  hidePage(page) {
    page.classList.add("hide");
  }
  setupPageRoute() {
    this.hidePage(productsPage);
    this.hidePage(contactPage);
    productsPageRoute.forEach((button) => {
      button.addEventListener("click", () => {
        document.title = "Store - Comfy Home";
        this.hidePage(homePage);
        this.hidePage(contactPage);
        this.displayPage(productsPage);
        this.hideMenu();
      });
    });
    homePageRoute.forEach((button) => {
      button.addEventListener("click", () => {
        document.title = "Home - Comfy Home";
        this.hidePage(productsPage);
        this.hidePage(contactPage);
        this.displayPage(homePage);
        this.hideMenu();
      });
    });
    contactPageRoute.addEventListener("click", () => {
      document.title = "Contact - Comfy Home";
      this.hidePage(productsPage);
      this.hidePage(homePage);
      this.displayPage(contactPage);
      this.hideMenu();
    });
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupAPP();
  // disable paging
  ui.hidePaging(pagingDOM);
  // get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      /*ui.setUpPaging();*/
      ui.getBagButtons();
      ui.getModals();
      ui.cartLogic();
      ui.setupPageRoute();
    });
});
