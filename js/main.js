
const productLayout = document.querySelector('.product-layout'),
    navigationLink = document.querySelectorAll('.navigation-link'),
    basketPreview = document.querySelector('.basket-preview'),
    basket = document.querySelector('.basket'),
    createOrder = document.querySelector('.create-order'),
    close = document.querySelector('.close'),
    basketContent = document.querySelector('.basket-content'),
    badge = document.querySelector('.badge'),
    totalPrice = document.querySelector('.total-price'),
    basketEmpty = document.querySelector('.basket-empty'),
    modal = document.querySelector('.modal'),
    modalBody = document.querySelector('.modal-body')
    btnOrder = document.querySelector('.btn-order')

let cartContainer = []
let cart = []
let modalTotal = ''
///Products
class Products {
    async getProducts() {
        try {
            const result = await fetch('db/db.json')
            const data = await result.json();
            return data;
        } catch (e) {
            console.log(e)
        }

    }

}
/// Render 
class Render {
    displayProducts(products) {
        let productCart = '';
        products.forEach(_product => {
            productCart += `
            <div class="col-lg-3 col-6 p-2 p-md-3">
            <div class="goods-card" data-id = "${_product.id}">
                <div class="goods-card__img">
                    <img class = "open" src=".${_product.img}" alt="${_product.name}</">
                    <span class="label-weight">${_product.weight}гр.</span>
                    ${_product.label ? `<span class="label"><img src="img/new.png" alt="peper"></span>` : ''}
                </div>
                <h2 class="goods-card__title">${_product.name}</h2>
                
               <button class="goods-card__button"><span class="goods-card__button-price" >${_product.price}.грн</span>
               <span class="goods-card__button-text" >Добавить</span>
               </button>
            </div>
        </div>
            `
        });
        productLayout.innerHTML = productCart;
        this.productsButtons()
    };
    filterProducts(data) {
        navigationLink.forEach((el) => {

            el.addEventListener('click', (e) => {
                navigationLink.forEach(element => {
                    element.classList.remove('active')
                });
                const result = e.target.closest('.navigation-link').dataset.field
                e.target.closest('.navigation-link').classList.add('active')
                if (result) {
                    const filteredGoods = data.filter((good) => {
                        return good.category === result
                    })
                    this.displayProducts(filteredGoods)

                }
            })
        })
    }

    productsButtons() {
        const cartButtons = [...document.querySelectorAll('.goods-card')]
        cartButtons.forEach((el) => {
            el.addEventListener('click', (e) => {
                let item = e.target
                let id = item.closest('.goods-card').dataset.id



                if (e.target.classList.contains('goods-card__button-text')) {

                    this.addCart(id)
                    console.log(item, id)
                } else if (e.target.classList.contains('open')) {
                    basket.classList.remove('active')

                    this.openModal(id)
                }


            })

        })
    }
    populateCart(data) {
        cartContainer = Storage.getCart()
        this.displayProducts(data)
        this.filterProducts(data)
        this.renderCart(cartContainer)
        cart = data


    }
    addCart(id) {
        let productItem = cart.find(product => product.id === id)
        productItem = { ...productItem, count: 1 }
        cartContainer = Storage.getCart()
        let cartItem = cartContainer.find(item => item.id === id)
        this.toast(productItem.name)

        if (!cartItem) {
            cartContainer = [...cartContainer, productItem]
        } else {
            const newCartContainer = cartContainer.map(el => {
                if (el.id === id) {
                    el.count++;
                }
                return el

            })

            cartContainer = newCartContainer
            console.log(newCartContainer)


        }
        Storage.saveCart(cartContainer)
        this.renderCart(cartContainer)
        cartContainer = [];



    }
    minusCart(id) {
        let newCartContainer = Storage.getCart()
        newCartContainer.map(el => {
            if (el.id === id && el.count > 1) {
                el.count -= 1;
            }
            return el
        })
        Storage.saveCart(newCartContainer)
        this.renderCart(newCartContainer)

    }
    cartLogic() {
        basketContent.addEventListener('click', e => {

            if (e.target.classList.contains('remove-product')) {
                let removeItem = e.target;
                let id = removeItem.dataset.remove;
                this.removeItemCart(id)
            } else if (e.target.classList.contains('plus')) {
                let plus = e.target.closest('.basket-item__content').dataset.id
                this.addCart(plus)
            } else if (e.target.classList.contains('minus')) {
                let minus = e.target.closest('.basket-item__content').dataset.id
                this.minusCart(minus)

            }
        })
        btnOrder.addEventListener('click', () => {
            this.openModal();
            basket.classList.remove('active')
        })
    }
    removeItemCart(id) {
        let basket = Storage.getCart()
        basket = basket.filter(item => item.id !== id)
        Storage.saveCart(basket)
        this.renderCart(basket)


    }
    renderCart(cartItem) {
        if (cartItem) {
            basketContent.innerHTML = ''
            cartItem.forEach(cartItems => {
                const notEmpty = document.createElement('div');
                notEmpty.classList.add('basket-item')
                notEmpty.innerHTML = `
                <button class="remove-product" data-remove = "${cartItems.id}">+</button>
                <div class="basket-item__img">
                    <img src=".${cartItems.img}" alt="${cartItems.name}">
                </div>
                <div class="basket-item__content" data-id = "${cartItems.id}">
                    <div class="basket-item__content-top">
                        <p class="content-top__title">${cartItems.name}</p>
                        <span>вес: ${cartItems.weight}</span>
                    </div>
                    <div class="basket-item__content-bottom">
                        <div class="content-bottom__count">
                            <label for="count">Количество:</label>
                            <div class="content-bottom_quantity">
                            <button type="button" class="btn-quantity minus">-</button>
                            <input class="count-product" name="count" readonly="" disabled="" type="text" min="1"
                                max="99" step="1" value="${cartItems.count}">
                            <button type="button" class="btn-quantity plus">+</button>
                            </div>
                        </div>
                        <div class="content-bottom__cost">
                            <div class="cost-product">
                                <p class="label-unit">
                                    Цена <span class="cost">${cartItems.price}</span>
                                    грн.
                                </p>
                            </div>
                            <div class="total-cost-product">
                                <p class="label-unit">Всего <span class="total-cost">${cartItems.price * cartItems.count}</span>
                                    грн.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                basketContent.append(notEmpty)


            });
            createOrder.style.display = 'block';
            let total = 0;
            cartItem.map(item => {
                total += item.price * item.count;
            })
            modalTotal = total
            totalPrice.innerHTML = total;
            badge.innerHTML = cartItem.length
            if (cartItem.length == 0) {
                const empty = document.createElement('div');
                empty.classList.add('empty-basket')
                empty.innerHTML = `
                <div>В корзине ничего нет!</div>
					<img src="img/big-shopping-basket.png" alt="empty basket" class="p-5">
                `
                basketContent.append(empty)
                createOrder.style.display = 'none';
            }

        }

    }
    openModal(id) {
        document.body.style.overflow = "hidden"
        modal.classList.add('open')
        modal.addEventListener('click', e => {

            if (e.target.classList.contains('close-modal')) {
                modal.classList.remove('open')
                document.body.style.overflow = ""
            } else if (e.target === modal) {
                modal.classList.remove('open')
                document.body.style.overflow = ""
            }


        })

        if (id) {

            let modalCartItem = cart.find(item => item.id === id)
            let modalCart = `
              <div class="row px-2">
              <div class="col-10 col-md-6 d-flex flex-column ">
              <h2 class="modal-body__title">${modalCartItem.name}</h2>
              <div class="modal-body_wheight">
                  <p>Вес:</p>
                  <span class="modal-body_wheight-icon">${modalCartItem.weight}</span>
              </div>
              <div class="modal-body_bottom">
                  <span class="modal-body_price">${modalCartItem.price} <span class="currency">  грн</span> </span>
                  <span class="modal-body_button" data-id ="${modalCartItem.id}">В корзину</span>
              </div>
          </div>
              <div class="col-2 col-md-6">
                  <div class="thumbnail">
                      <img src="${modalCartItem.img}"  alt="${modalCartItem.name}">
                  </div>
              </div>
              <div class="col-12 pt-3">
              <p class="modal-body_description">${modalCartItem.description}</p>
          </div>
             
          </div>
                  `;
            modalBody.innerHTML = modalCart
            const modalButton = document.querySelector('.modal-body_button')
            const idx = modalButton.dataset.id
            modalButton.addEventListener('click', () => {
                this.addCart(idx)
            })
        } else {

            const order = `
            <div class="order-container">
						<h2 class="order-title">Оформление заказа</h2>

						<div class="container">
							<div class="row ">
								<div class="col-12 col-md-5 d-flex ">
									<div class="order-goods">
									
									</div>
								</div>
								<div class="col-12 col-md-7 d-flex ">
									<form class="form-inputs">
										<div class="d-flex">
											<input class="order-input" type="text" placeholder="Ваше имя *">
											<input class="order-input" type="tel" name=""
												placeholder="Номер телефона *">
										</div>
										<div class="d-flex">
											<input class="order-input flex-grow-1" type="text" placeholder="Улица *">
											<input class="order-input fix" type="text" placeholder="Дом *">
											<input class="order-input fix" type="text" placeholder="Квартира"></input>
										</div>
										<div class="delivery">
											<div class="labels">
												<label>Оплата наличными
													<input type="radio"><span></span> </label>
												<label>Картой куръеру
													<input type="radio"> <span></span></label>
											</div>
											<div class="promocode"><input class="order-input" type="text"
													placeholder="Промокод"> <small>Применяется оператором</small>
											</div>
										</div>
										<textarea class="order-textarea" rows="3"
											placeholder="Комментарий к заказу"></textarea>
										<div class="total-order">
											<div class="total-order_info">
												<div class="total-order_item">
													<p>Заказ</p>
													<span>${modalTotal}грн</span>
												</div>
												<div class="total-order_item">
													<p>Скидка</p>
													<span>0грн</span>
												</div>
												<div class="total-pay">
													<p>К оплате:</p>
													<span>${modalTotal}грн</span>
												</div>
											</div>
											<div class="total-order_button">
												<button>Сделать заказ</button>
											</div>
											
										
										</div>

									</form>
								</div>
							</div>
						</div>

					</div>
            `;

            modalBody.innerHTML = order;
            const orderContainer = document.querySelector('.order-goods')
            const orderCart = Storage.getCart()
            orderCart.forEach(el => {
                const orderItem = document.createElement('div');
                orderItem .classList.add('order-goods_item')
              orderItem.innerHTML = `
            <div class="order-goods_img">
                <img src="${el.img}" alt="${el.name}">
            </div>
            <div class="order-info">
                <div class="order-info_title">
                    <h3>${el.name}</h3>
                    <span>${el.price*el.count}грн</span>
                </div>
                <div class="order-weight">
                    <small >${el.weight}гр</small>
                    <span>Количество: ${el.count}</span>
                </div>
            </div>
            `;
            orderContainer.append(orderItem)
            })
            

        }


    }
    toast(_el) {
        const tostButton = document.querySelector('.toast')
        if (tostButton) {
            tostButton.innerHTML = _el + " добавлен!"
            tostButton.classList.add('active')

            const timer = setTimeout(() => tostButton.classList.remove('active'), 3000);
        }
    }

}
//Storage

class Storage {
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

    }
}




//-----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const products = new Products();
    const render = new Render();
    products.getProducts().then(data => {
        render.populateCart(data)
        render.cartLogic()
    })

    basketPreview.addEventListener('click', () => {
        basket.classList.add('active')
    })
    close.addEventListener('click', () => {
        basket.classList.remove('active')
    })


    window.onscroll = function () { navFunction() };
    var navbar = document.querySelector('.header-content');
    var sticky = navbar.offsetTop;

    function navFunction() {
        if (window.pageYOffset >= sticky) {
            navbar.classList.add("sticky")
            basketPreview.classList.add("sticky")
        } else {
            navbar.classList.remove("sticky");
            basketPreview.classList.remove("sticky");
        }
    }


})