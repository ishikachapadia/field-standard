//main.js
// routing for Easy Groceries Wireframe
let user = {};
window.globalCart = window.globalCart || {};
window.globalProducts = window.globalProducts || {};
window.globalDepartments = window.globalDepartments || [];
window.currentDepartmentName = window.currentDepartmentName || '';

const normalizeDepartment = (name) => String(name || '').trim().toLowerCase();

window.renderDepartmentMenus = (currentDepartment = '') => {
    const departments = Array.isArray(window.globalDepartments) ? window.globalDepartments : [];
    const activeDepartment = normalizeDepartment(currentDepartment || window.currentDepartmentName);

    let dropdownContent = '';
    let sidebarContent = '';

    $.each(departments, function (i, departmentName) {
        const safeName = String(departmentName || '');
        const normalizedName = normalizeDepartment(safeName);
        const activeClass = normalizedName === activeDepartment ? ' active' : '';

        dropdownContent += `<li class="pointer click-department${activeClass}" data-name="${safeName}">${safeName}</li>`;
        sidebarContent += `<li class="click-department${activeClass}" data-name="${safeName}">${safeName}</li>`;
    });

    $(".department-dropdown").html(dropdownContent);
    $(".department-sidebar-list").html(sidebarContent);
};

window.renderCartPage = () => {
    let html = '';
    let subtotal = 0;
    let items = Object.values(window.globalCart);
    if(items.length === 0) {
        html = '<div style="padding:40px; text-align:center;"><h2>Your cart is empty.</h2><br><button class="primary-btn" onclick="location.href=\'#/home/\'">Continue Shopping</button></div>';
    } else {
        items.forEach(entry => {
            let item = entry.item;
            let price = parseFloat(item.price || 0);
            subtotal += price * entry.qty;
            html += `
            <div class="cart-card">
              <div class="cart-row">
                <div class="cart-row__img"><img src="${(item.image && item.image.trim() !== '') ? item.image : 'assets/img/placeholder.png'}" style="max-width:60px; barder-radius: 4px;"></div>
                <div class="cart-row__info">
                  <div class="cart-row__name">${item.product_name || ''}</div>
                  <div class="cart-row__detail">${item.eg_unit_id || ''} | SKU: ${item.upc || ''}</div>
                </div>
                <div class="cart-row__qty">
                  <button class="qty-btn" onclick="window.cartChangeQty('${item.upc}', -1)">-</button>
                  <span class="qty-val">${entry.qty}</span>
                  <button class="qty-btn" onclick="window.cartChangeQty('${item.upc}', 1)">+</button>
                </div>
                <div class="cart-row__price">${price.toFixed(2)}</div>
                <button class="cart-row__remove" onclick="window.cartRemoveFromCart('${item.upc}')">Remove</button>
              </div>
            </div>`;
        });
        html += '<button type="button" class="cart-continue" onclick="location.href=\'#/home/\'">Continue Shopping</button>';
    }
    $('.cart-left').html(html);
    let tax = subtotal * 0.08;
    let total = subtotal + tax;
    $('.summary-card__body').first().html(`
        <div class="summary-line"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div class="summary-line"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
        <div class="summary-promo">
            <input type="text" placeholder="Promo code" class="promo-input" />
            <button type="button" class="promo-apply">Apply</button>
        </div>
        <div class="summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        <button type="button" class="summary-checkout" onclick="location.href=\'#/shipping/\'">Proceed to Checkout</button>
    `);
    
    // update other order summaries (like on checkout pages)
    $('.summary-card__body').not(':first').html(`
        <div class="summary-line"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div class="summary-line"><span><span>Tax</span><span>${tax.toFixed(2)}</span></div>
        <div class="summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
    `);

    // Also update Review page items
    let reviewHtml = '';
    items.forEach(entry => {
        let item = entry.item;
        let price = parseFloat(item.price || 0);
        reviewHtml += `<rv-item>
           <div class="rv-item">
            <div class="rv-item__img"><img src="${(item.image && item.image.trim() !== '') ? item.image : 'assets/img/placeholder.png'}" style="max-width:50px;"></div>
            <div class="rv-item__info"><strong>${item.product_name}</strong><br>Qty: ${entry.qty}</div>
            <div class="rv-item__price">${((price * entry.qty).toFixed(2))}</div>
         </div>`;
    });
    $('#review .co-card:last-of-type .co-card__body').first().html(reviewHtml);
};

window.getCartQty = (upc) => {
    if (!upc || !window.globalCart[upc]) return 0;
    return parseInt(window.globalCart[upc].qty, 10) || 0;
};

window.syncProductCardQtyUI = (upc) => {
    if (!upc) return;
    const qty = window.getCartQty(upc);
    const $actions = $(`.js-pd-action[data-upc="${upc}"]`);

    $actions.each(function () {
        const $action = $(this);
        const $value = $action.find('.js-qty-value');
        $value.text(qty);
    });
};

window.syncAllProductCardQtyUI = () => {
    $('.js-pd-action[data-upc]').each(function () {
        const upc = $(this).attr('data-upc');
        window.syncProductCardQtyUI(upc);
    });
};

    window.cartAddToCart = (upc) => {
        let item = window.globalProducts[upc];
        if(!item) return;
        if(!window.globalCart[upc]) {
            window.globalCart[upc] = { item: item, qty: 1 };
        } else {
            window.globalCart[upc].qty++;
        }
        window.renderCartPage();
        window.syncProductCardQtyUI(upc);
    };

    window.cartRemoveFromCart = (upc) => {
        delete window.globalCart[upc];
        window.renderCartPage();
        window.syncProductCardQtyUI(upc);
    };

    window.cartChangeQty = (upc, delta) => {
        if(!window.globalCart[upc]) return;
        window.globalCart[upc].qty += delta;
        if(window.globalCart[upc].qty <= 0) {
            delete window.globalCart[upc];
        }
        window.renderCartPage();
        window.syncProductCardQtyUI(upc);
    };

    window.productCardIncrement = (upc) => {
        window.cartAddToCart(upc);
    };

    window.productCardDecrement = (upc) => {
        if (!window.globalCart[upc]) return;
        window.cartChangeQty(upc, -1);
    };


const setSidebar = (isVisible) => {
    $('body').toggleClass('no-sidebar', !isVisible);
}

const setHeaderMode = (isHomePage) => {
    $('body').toggleClass('page-home', !!isHomePage);
    $('body').toggleClass('page-inner', !isHomePage);

    const logo = document.getElementById('site-logo');
    if (logo) {
        const homeLogo = logo.dataset.homeLogo || 'assets/img/logo.png';
        logo.onerror = null;
        logo.src = homeLogo;
    }
}


const getHome = () => {
    setHeaderMode(true);
    setSidebar(false);
    $(".hideAll").hide();
    $(".home-show").show();
    $(window).scrollTop(0);

    // Fetch products for home page
    // Using '%' as wildcard to get products from all departments, then randomize them
    let departmentForm = new FormData();
    departmentForm.append('department', '%');

    $.ajax({
        type: 'POST',
        url: './services/get_department.php',
        data: departmentForm,
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        beforeSend: function () {
        },

        error: function(xhr, status, error) { console.error('AJAX Error:', status, error, xhr.responseText); }, success: function (data) { console.log('AJAX Success Data:', data);
            if (data.error.error_id == 0) {
               // Shuffle the products randomly
               let shuffledProducts = (data.products || []).sort(() => Math.random() - 0.5);
               let productIndex = 0;
               
               // Go through each grid section on the home page separately
               $("#home .products-grid").each(function() {
                   // If slick is already initialized from a previous visit, unslick it first
                   if ($(this).hasClass('slick-initialized')) {
                       $(this).slick('unslick');
                   }
                   
                   
                   let content = ``;
                   // Put 8 unique random products in each section
                   for(let i = 0; i < 8; i++) {
                       if (productIndex < shuffledProducts.length) {
                           content += getCard(shuffledProducts[productIndex]);  
                           productIndex++;
                       }
                   }
                   $(this).html(content);

                   // Initialize Slick Carousel
                   $(this).slick({
                       slidesToShow: 4,
                       slidesToScroll: 1,
                       infinite: true,
                       prevArrow: '<button class="slider-btn prev-btn" style="position:absolute; left:-20px; top:50%; transform:translateY(-50%); z-index:10; background:#798645; color:white; border:none; border-radius:50%; width:40px; height:40px; font-size:20px; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,0.1);">&#10094;</button>',
                       nextArrow: '<button class="slider-btn next-btn" style="position:absolute; right:-20px; top:50%; transform:translateY(-50%); z-index:10; background:#798645; color:white; border:none; border-radius:50%; width:40px; height:40px; font-size:20px; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,0.1);">&#10095;</button>',
                       responsive: [
                           {
                               breakpoint: 1024,
                               settings: {
                                   slidesToShow: 3,
                                   slidesToScroll: 1
                               }
                           },
                           {
                               breakpoint: 768,
                               settings: {
                                   slidesToShow: 2,
                                   slidesToScroll: 1
                               }
                           },
                           {
                               breakpoint: 480,
                               settings: {
                                   slidesToShow: 1,
                                   slidesToScroll: 1
                               }
                           }
                       ]
                   });

                   // Ensure parent container handles absolute arrows properly  
                   $(this).css({ 'position': 'relative' });
               });
            }
        }
    });
}

const getSearch = () => {
    setHeaderMode(false);
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-search").show();
    $(window).scrollTop(0);
}

const getProduct = (product_name) => {
    setHeaderMode(false);
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-product").show();
    $(window).scrollTop(0);

    if (!product_name) return;
    product_name = decodeURIComponent(product_name);

    let productForm = new FormData();
    productForm.append('product', product_name);

    $.ajax({
        type: 'POST',
        url: './services/get_product.php',
        data: productForm,
        dataType: 'json',
        contentType: false,
        cache: false,
        processData: false,

        success: function (data) {
            if (data.error.error_id == 0 && data.products && data.products.length > 0) {
                let item = data.products[0];
                let price = item.price || 0;
                let price2 = Number(price).toFixed(2);

                $('#product .product-image-large img').attr('src', (item.image && item.image.trim() !== '') ? item.image : 'assets/img/placeholder.png');
                $('#product .brand-label').text(item.brand || '');
                $('#product .product-title').text(item.product_name || '');
                $('#product .product-sku').text('SKU: ' + (item.upc || ''));
                $('#product .product-price-large').text('$' + price2);
                $('#product .product-weight').text(item.eg_unit_id || '');
                $('#product .product-description').html('<p>' + (item.product_description || 'The daily standard. Delivered same day.') + '</p>');
                
                window.globalProducts[item.upc] = item;
                $('#product .product-action-large').html(`
                    <button class="primary-btn" style="width:100%; margin-top:10px; cursor:pointer;" onclick="window.cartAddToCart('${item.upc}')">Add to Cart</button>
                `);

                // Breadcrumb
                $('#product .breadcrumb span').text(item.product_name || '');
                $('#product .breadcrumb a:eq(1)').text(item.department_name || '');

                // Related products
                if (data.related_products && data.related_products.length > 0) {
                    let relatedContent = '';
                    $.each(data.related_products, function(i, relatedItem) {
                        relatedContent += getCard(relatedItem);
                    });
                    $('#product .related-products-grid').html(relatedContent);
                } else {
                    $('#product .related-products-grid').empty();
                }
            } else {
                console.error('Error loading product');
            }
        },
        error: function(xhr, status, error) { console.error('AJAX Error:', status, error, xhr.responseText); }
    });
}

const getCart = () => {
    setHeaderMode(false);
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-cart").show();
    $(window).scrollTop(0);
    if(window.renderCartPage) window.renderCartPage();
}

const getRegister = () => {
    setHeaderMode(false);
    setSidebar(false);
    $('#loginModal').foundation('close');
    $(".hideAll").hide();
    $(".show-register").show();
    $(window).scrollTop(0);
}

const getForgot = () => {
    setHeaderMode(false);
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-forgot").show();
    $(window).scrollTop(0);
}

const getReset = () => {
    setHeaderMode(false);
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-reset").show();
    $(window).scrollTop(0);
}

const getShipping = () => {
    setHeaderMode(false);
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-shipping").show();
    $(window).scrollTop(0);
}

const getPayment = () => {
    setHeaderMode(false);
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-payment").show();
    $(window).scrollTop(0);
}

const getReview = () => {
    setHeaderMode(false);
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-review").show();
    $(window).scrollTop(0);
}

const getComplete = () => {
    setHeaderMode(false);
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-complete").show();
    $(window).scrollTop(0);
}

const getLocation = () => {
    setHeaderMode(false);
    setSidebar(false);
    $(".hideAll").hide();
    $(".show-location").show();
    $(window).scrollTop(0);
}

const validateSignUp = () => {
    let validate = true;

    if (validate) {
        createAccount();
    }
}

const createAccount = () => {
    // get field data
    let name_first = $("#billing_name_first").val();
    let name_last = $("#billing_name_last").val();
    let email = $("#email").val();
    let password = $("#password").val();

    let createAccountForm = new FormData();

    createAccountForm.append('name_first', name_first);
    createAccountForm.append('name_last', name_last);
    createAccountForm.append('email', email);
    createAccountForm.append('password', password);

    $.ajax({
        type: 'POST',
        url: './services/create_account.php',
        data: createAccountForm,
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        beforeSend: function () {
            $(`#signup`).attr("disabled", "disabled");
        },

        error: function(xhr, status, error) { console.error('AJAX Error:', status, error, xhr.responseText); }, success: function (data) { console.log('AJAX Success Data:', data);

    
            if (data.error.error_id != 0) {
                let error_id = data.error_id;
                let error_msg = data.error_message;
                alert("Something went wrong. ID: " + error_id +
                ". Message: " + error_msg);
            } else {
                // everything is OK
                // go home
                location.href = "#/home/";
                // show login
                $('#loginModal').foundation('open');
            }
            $(`#signup`).removeAttr("disabled");
        }
    });
}


const login = () => {
    // get field data
    let email = $("#loginEmail").val();
    let password = $("#loginPassword").val();

    // create ajax call and disable form
    let loginForm = new FormData();

    loginForm.append('email', email);
    loginForm.append('password', password);

    $.ajax({
        type: 'POST',
        url: './services/login.php',
        data: loginForm,
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        beforeSend: function () {
            $(`#login`).attr("disabled", "disabled");
        },

        error: function(xhr, status, error) { console.error('AJAX Error:', status, error, xhr.responseText); }, success: function (data) { console.log('AJAX Success Data:', data);
            if (data.error.error_id == 500) {
                // everything is OK
                $('#loginModal').foundation('close');
                // populate global object
                user = data.user;
                console.log(user);
                // close modal
                $("#loginModal").foundation("close");
                // switch login button
                $("#open_login").hide();
                const user_name = `${user.billing_name_first} ${user.billing_name_last}`
                $("#user_name").show().html(user_name);
                
            } else {
                let error_id = data.error_id;
                let error_msg = data.error_message;
                alert("Something went wrong. ID: " + error_id +
                ". Message: " + error_msg);
            } 
            $(`#login`).removeAttr("disabled");
        }
    });
}


const getDepartments = () => {
    $.ajax({
        type: 'POST',
        url: './services/get_departments.php',
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        beforeSend: function () {
        },

        error: function(xhr, status, error) { console.error('AJAX Error:', status, error, xhr.responseText); }, success: function (data) { console.log('AJAX Success Data:', data);
            if (data.error.error_id == 0) {
                // do stuff
                window.globalDepartments = [];
                $.each(data.departments, function(i, item) {
                    if (item && item.name) window.globalDepartments.push(item.name);
                });
                window.renderDepartmentMenus(window.currentDepartmentName);
            } else {
                let error_id = data.error_id;
                let error_msg = data.error_message;
                alert("Something went wrong. ID: " + error_id +
                ". Message: " + error_msg);
            }
        }
    });
}


const getCard = (item) => {
    if (!item) return '';
    
    // Ensure the global object exists to avoid errors
    window.globalProducts = window.globalProducts || {};
    window.globalProducts[item.upc] = item;

    let price = item.price || 0;
    let price2 = Number(price).toFixed(2);
    let description = item.product_description || 'The daily standard. Delivered same day. Fresh, fast, and curated specifically for you.';
    
    // encodeURIComponent is good, but we should also escape single quotes for the inline JS
    let safeName = item.product_name ? encodeURIComponent(item.product_name).replace(/'/g, "\\'") : 'unknown';
    let upc = item.upc ? String(item.upc).replace(/'/g, "\\'") : '';
    let qty = window.getCartQty(upc);

    return `
        <div class="product-card click-product" onclick="location.href='#/product/${safeName}/';">
            <div class="card-front">
                <div class="product-thumb">
                    <img src="${(item.image && item.image.trim() !== '') ? item.image : 'assets/img/placeholder.png'}" alt="${item.product_name || ''}">
                </div>
                <div class="product-details">
                    <span class="brand">${item.brand || ''}</span>
                    <h3 class="name">${item.product_name || ''}</h3>
                    <span class="sku">${item.upc || ''}</span>
                    <span class="weight">${item.eg_unit_id || ''}</span>
                    <span class="price">$${price2}</span>
                </div>
            </div>
            <div class="card-back">
                <p class="description">${description}</p>
            </div>
            <div class="product-action js-pd-action" data-upc="${upc}" onclick="event.stopPropagation();">
                <div class="qty-control js-qty-control">
                    <button type="button" class="qty-btn" onclick="event.stopPropagation(); window.productCardDecrement('${upc}');">-</button>
                    <span class="qty-value js-qty-value">${qty}</span>
                    <button type="button" class="qty-btn" onclick="event.stopPropagation(); window.productCardIncrement('${upc}');">+</button>
                </div>
            </div>
        </div>`;
};
const getDepartment = (department) => {
    if (department) department = decodeURIComponent(department);
    window.currentDepartmentName = department || '';
    setHeaderMode(false);
    setSidebar(true);
    $(".hideAll").hide();
    $(".show-department").show();
    $(window).scrollTop(0);

    $("#department .dept-name").text(window.currentDepartmentName || 'Department');
    $("#department .department-title").text(window.currentDepartmentName || 'Department');
    window.renderDepartmentMenus(window.currentDepartmentName);

    // Update department title
    const deptTitles = {
        'produce': 'Produce',
        'milk-dairy': 'Milk & Dairy',
        'bakery': 'Bakery',
        'drinks': 'Drinks',
        'snacks': 'Snacks',
        'deli': 'Deli',
        'frozen': 'Frozen'
    };
    
    let departmentForm = new FormData();

    departmentForm.append('department', department);

     $.ajax({
        type: 'POST',
        url: './services/get_department.php',
        data: departmentForm,
        dataType: "json",
        contentType: false,
        cache: false,
        processData: false,

        beforeSend: function () {
        },

        error: function(xhr, status, error) { console.error('AJAX Error:', status, error, xhr.responseText); }, success: function (data) { console.log('AJAX Success Data:', data);
            if (data.error.error_id != 0) {
                let error_id = data.error_id;
                let error_msg = data.error_message;
                alert("Something went wrong. ID: " + error_id +
                ". Message: " + error_msg);
            } else {
                // everything is OK
                // go home
               // create cards
                //    console.log(data.products);
               window.currentDepartmentProducts = data.products || [];
                window.renderProductsPage(1);
                // alert(content);
            }
        }
    });


    //$('#department-title').text(deptTitles[dept] || 'Produce');
    
}


$(window).on("load", function () {

    // Initialize Foundation
    $(document).foundation();

    getDepartments();

    // $(document).on('click', 'body .movie', function () {
    //     let movie_id = $(this).attr("data-id");
    //     location.href = `#/movie/${movie_id}`;
    // });

    $(document).on('click', 'body .click-department', function() {
            const department = $(this).attr("data-name");
            location.href = `#/department/${encodeURIComponent(department)}/`;
        }
    );


    $("#signup").click(
        function () {
            validateSignUp();
        }
    );

    $("#login").click(
        function () {
            login();
        }
    );


    $(".click-home").click(
        function (e) {
            e.preventDefault();
            location.href = "#/home/";
        }
    );
    

    $(".click-department-not-used").click(
        function (e) {
            e.preventDefault();
            const dept = $(this).data('dept') || 'produce';
            location.href = `#/department/${dept}/`;
        }
    );
    

    $(".click-search").click(
        function (e) {
            e.preventDefault();
            location.href = "#/search/";
        }
    );


    $(".click-product").click(
        function (e) {
            e.preventDefault();
            location.href = "#/product/";
        }
    );


    $(".click-cart").click(
        function (e) {
            e.preventDefault();
            location.href = "#/cart/";
        }
    );


    $(".click-register").click(
        function (e) {
            e.preventDefault();
            location.href = "#/register/";
        }
    );


    $(".click-forgot").click(
        function (e) {
            e.preventDefault();
            location.href = "#/forgot/";
        }
    );


    $(".click-reset").click(
        function (e) {
            e.preventDefault();
            location.href = "#/reset/";
        }
    );


    $(".click-shipping").click(
        function (e) {
            e.preventDefault();
            location.href = "#/shipping/";
        }
    );


    $(".click-payment").click(
        function (e) {
            e.preventDefault();
            location.href = "#/payment/";
        }
    );


    $(".click-review").click(
        function (e) {
            e.preventDefault();
            location.href = "#/review/";
        }
    );


    $(".click-complete").click(
        function (e) {
            e.preventDefault();
            location.href = "#/complete/";
        }
    );


    $(".click-location").click(
        function (e) {
            e.preventDefault();
            location.href = "#/location/";
        }
    );
    

    // Search bar: click icon or press Enter to go to search
    $(".search-bar i").click(function (e) {
        e.preventDefault();
        location.href = "#/search/";
    });


    $(".search-bar input").on("keypress", function (e) {
        if (e.which === 13) {
            e.preventDefault();
            location.href = "#/search/";
        }
    });


    // Location dropdown change
    $(".location-dropdown").change(function () {
        const val = $(this).val();
        if (val && val !== "Location") {
            location.href = "#/location/";
        }
    });


    // Login modal
    $(".open_login").click(
        function (e) {
            e.preventDefault();
            $("#loginModal").foundation("open");
        }
    );


    // Prevent form submissions from reloading the SPA
    $("form").on("submit", function (e) {
        e.preventDefault();
    });
    

    // Instacart-style add button -> qty control
    $(document).on("click", ".add-btn", function (e) {
        e.stopPropagation();
        const $btn = $(this);
        let $control = $btn.siblings(".qty-control");

        if ($control.length === 0) {
            $control = $(
                '<div class="qty-control is-active">' +
                '  <button class="qty-btn qty-minus">-</button>' +
                '  <span class="qty-value">1</span>' +
                '  <button class="qty-btn qty-plus">+</button>' +
                '</div>'
            );
            $btn.after($control);
        } else {
            $control.addClass("is-active");
        }

        $btn.hide();
    });


    $(document).on("click", ".qty-control .qty-plus", function (e) {
        e.stopPropagation();
        const $control = $(this).closest(".qty-control");
        const $value = $control.find(".qty-value");
        const current = parseInt($value.text(), 10) || 1;
        $value.text(current + 1);
    });


    $(document).on("click", ".qty-control .qty-minus", function (e) {
        e.stopPropagation();
        const $control = $(this).closest(".qty-control");
        const $value = $control.find(".qty-value");
        const current = parseInt($value.text(), 10) || 1;
        if (current <= 1) {
            $control.removeClass("is-active");
            $control.prev(".add-btn").show();
        } else {
            $value.text(current - 1);
        }
    });
    

    // Quantity selectors
    $(".qty-minus").click(
        function () {
            const $input = $(this).siblings('input');
            const val = parseInt($input.val());
            if (val > 1) {
                $input.val(val - 1);
            }
        }
    );
    

    $(".qty-plus").click(
        function () {
            const $input = $(this).siblings('input');
            const val = parseInt($input.val());
            if (val < 10) {
                $input.val(val + 1);
            }
        }
    );
    

    // SAMMY ROUTING
    // Controller in MVC
    if ($.sammy) {
        var app = $.sammy(function () {

            this.get('#/home/', function () {
                getHome();
            });

            // this.get('#/department/', function () {
            //     getDepartment('produce');
            // });

            this.get(/#\/department\/(.*)/, function () {
                let deptStr = this.params['splat'][0];
                if (deptStr.endsWith('/')) deptStr = deptStr.slice(0, -1);
                getDepartment(deptStr);
            });

            this.get('#/search/', function () {
                getSearch();
            });

            this.get('#/product/:product/', function () {
                getProduct(this.params['product']);
            });

            this.get('#/cart/', function () {
                getCart();
            });

            this.get('#/register/', function () {
                getRegister();
            });

            this.get('#/forgot/', function () {
                getForgot();
            });

            this.get('#/reset/', function () {
                getReset();
            });

            this.get('#/shipping/', function () {
                getShipping();
            });

            this.get('#/payment/', function () {
                getPayment();
            });

            this.get('#/review/', function () {
                getReview();
            });

            this.get('#/complete/', function () {
                getComplete();
            });

            this.get('#/location/', function () {
                getLocation();
            });

        });

        // default when page first loads
        if (!location.hash) {
            getHome();
            app.run('#/home/');
        } else {
            app.run();
        }
    } else {
        // Fallback: show home if Sammy isn't available
        getHome();
    }
});


// --- PAGINATION LOGIC ---
window.currentDepartmentProducts = [];
window.currentDeptPage = 1;
window.itemsPerPage = 12;

window.renderProductsPage = (page) => {
    window.currentDeptPage = page;
    const start = (page - 1) * window.itemsPerPage;
    const end = start + window.itemsPerPage;
    const paginatedItems = window.currentDepartmentProducts.slice(start, end);

    let content = '';
    $.each(paginatedItems, function(i, item) {
        content += getCard(item);
    });

    $("#department .products-grid").html(content || '<h2 class="department-empty-state">No items found</h2>');
    window.renderPaginationControls();
};

window.renderPaginationControls = () => {
    const totalPages = Math.ceil(window.currentDepartmentProducts.length / window.itemsPerPage);
    let paginationHtml = '';
    
    if (totalPages > 1) {
        paginationHtml += `<button class="page-btn prev-btn" ${window.currentDeptPage === 1 ? 'disabled' : ''} onclick="window.changePage(${window.currentDeptPage - 1})">&laquo; Prev</button>`;
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<button class="page-btn ${i === window.currentDeptPage ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`;
        }
        
        paginationHtml += `<button class="page-btn next-btn" ${window.currentDeptPage === totalPages ? 'disabled' : ''} onclick="window.changePage(${window.currentDeptPage + 1})">Next &raquo;</button>`;
    }
    
    $("#department-pagination").html(paginationHtml);
};

window.changePage = (page) => {
    window.renderProductsPage(page);
    $('html, body').animate({
        scrollTop: $("#department").offset().top - 50
    }, 200);
};
// ------------------------

