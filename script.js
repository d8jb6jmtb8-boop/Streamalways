/* =========================================================
   STREAMALWAYS
   SUPABASE + PRODUITS + PANIER + PAIEMENT
========================================================= */

const SUPABASE_URL =
    "https://effatbwukrldzghvakut.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_v2XtiLdrdsKVRAGhgWoZ_A_MBhVjval";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   VARIABLES
========================================================= */

let products = [];
let cart = [];
let paymentMethods = [];


/* =========================================================
   ELEMENTS
========================================================= */

const captchaScreen =
    document.getElementById("captchaScreen");

const robotCheck =
    document.getElementById("robotCheck");

const enterButton =
    document.getElementById("enterButton");

const site =
    document.getElementById("site");

const productsContainer =
    document.getElementById("products");

const searchInput =
    document.getElementById("searchInput");

const cartButton =
    document.getElementById("cartButton");

const cartOverlay =
    document.getElementById("cartOverlay");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const cartCount =
    document.getElementById("cartCount");

const closeCart =
    document.getElementById("closeCart");

const checkoutButton =
    document.getElementById("checkoutButton");


/* =========================================================
   CAPTCHA
========================================================= */

if (robotCheck && enterButton) {

    robotCheck.addEventListener(
        "change",
        function () {

            enterButton.disabled =
                !robotCheck.checked;

        }
    );


    enterButton.addEventListener(
        "click",
        async function () {

            if (!robotCheck.checked) {
                return;
            }

            captchaScreen.classList.add(
                "hidden"
            );

            site.classList.remove(
                "hidden"
            );

            await loadProducts();

            await loadPaymentMethods();

        }
    );

}


/* =========================================================
   PRODUITS
========================================================= */

async function loadProducts() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .eq("active", true)
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(error);

            productsContainer.innerHTML = `
                <p>
                    Impossible de charger les abonnements.
                </p>
            `;

            return;
        }


        products = data || [];

        renderProducts(products);

    }

    catch (error) {

        console.error(error);

    }

}


/* =========================================================
   AFFICHAGE PRODUITS
========================================================= */

function renderProducts(list) {

    productsContainer.innerHTML = "";


    if (!list.length) {

        productsContainer.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;
            ">
                Aucun abonnement disponible.
            </div>
        `;

        return;
    }


    list.forEach(
        function(product) {

            const card =
                document.createElement("article");


            card.className =
                "product";


            card.innerHTML = `

                <div class="product-logo">

                    ${
                        product.logo_url

                        ?

                        `<img
                            src="${escapeAttribute(
                                product.logo_url
                            )}"
                            alt="${escapeAttribute(
                                product.name
                            )}"
                        >`

                        :

                        `<span>
                            ${getLogoLetter(
                                product.name
                            )}
                        </span>`
                    }

                </div>


                <div class="product-info">

                    <span class="product-type">
                        ${getCategoryName(
                            product.category
                        )}
                    </span>


                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            product.description || ""
                        )}
                    </p>

                </div>


                <div class="product-bottom">

                    <strong>
                        ${formatPrice(
                            product.price,
                            product.currency
                        )}
                    </strong>


                    <button
                        class="buy-button"
                        type="button"
                    >
                        Acheter
                    </button>

                </div>

            `;


            card.querySelector(
                ".buy-button"
            ).addEventListener(
                "click",
                function() {

                    addToCart(product);

                }
            );


            productsContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   LOGO TEMPORAIRE
========================================================= */

function getLogoLetter(name) {

    const value =
        String(name || "")
            .toLowerCase();


    if (value.includes("spotify"))
        return "S";

    if (value.includes("apple"))
        return "";

    if (value.includes("netflix"))
        return "N";

    if (value.includes("youtube"))
        return "▶";

    if (value.includes("prime"))
        return "▶";

    if (value.includes("canva"))
        return "C";

    if (value.includes("capcut"))
        return "C";

    if (value.includes("chatgpt"))
        return "✦";

    if (value.includes("snapchat"))
        return "👻";

    if (value.includes("telegram"))
        return "✈";

    if (value.includes("duolingo"))
        return "D";

    if (value.includes("crunchyroll"))
        return "◉";

    return "✦";

}


/* =========================================================
   CATÉGORIES
========================================================= */

function getCategoryName(category) {

    const categories = {

        music: "MUSIQUE",

        video: "VIDÉO",

        creative: "CRÉATIF",

        ai: "IA",

        social: "SOCIAL",

        education: "ÉDUCATION",

        anime: "ANIME",

        other: "AUTRES"

    };


    return categories[category]
        || "AUTRES";

}


/* =========================================================
   PRIX
========================================================= */

function formatPrice(
    price,
    currency = "XAF"
) {

    return (
        Number(price || 0)
            .toLocaleString("fr-FR")
        + " "
        + currency
    );

}


/* =========================================================
   PANIER
========================================================= */

function addToCart(product) {

    cart.push(product);

    updateCart();

    openCart();

}


function removeFromCart(index) {

    cart.splice(
        index,
        1
    );

    updateCart();

}


function updateCart() {

    if (!cartItems)
        return;


    cartItems.innerHTML = "";


    let total = 0;


    cart.forEach(
        function(product, index) {

            total +=
                Number(product.price || 0);


            const item =
                document.createElement("div");


            item.className =
                "cart-item";


            item.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(
                            product.name
                        )}
                    </strong>

                    <small>
                        ${formatPrice(
                            product.price,
                            product.currency
                        )}
                    </small>

                </div>


                <button
                    type="button"
                >
                    ×
                </button>

            `;


            item.querySelector(
                "button"
            ).addEventListener(
                "click",
                function() {

                    removeFromCart(index);

                }
            );


            cartItems.appendChild(
                item
            );

        }
    );


    const currency =
        cart.length
            ? cart[0].currency || "XAF"
            : "XAF";


    if (cartTotal) {

        cartTotal.innerText =
            formatPrice(
                total,
                currency
            );

    }


    if (cartCount) {

        cartCount.innerText =
            cart.length;

    }

}


/* =========================================================
   PANIER
========================================================= */

function openCart() {

    if (cartOverlay) {

        cartOverlay.classList.add(
            "show"
        );

    }

}


function closeCartWindow() {

    if (cartOverlay) {

        cartOverlay.classList.remove(
            "show"
        );

    }

}


if (cartButton) {

    cartButton.addEventListener(
        "click",
        openCart
    );

}


if (closeCart) {

    closeCart.addEventListener(
        "click",
        closeCartWindow
    );

}


if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                cartOverlay
            ) {

                closeCartWindow();

            }

        }
    );

}


/* =========================================================
   MOYENS DE PAIEMENT
========================================================= */

async function loadPaymentMethods() {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("payment_settings")

            .select("*")

            .eq("active", true)

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Erreur moyens de paiement :",
                error
            );

            return;
        }


        paymentMethods =
            data || [];

    }

    catch (error) {

        console.error(error);

    }

}


/* =========================================================
   OUVRIR PAIEMENT
========================================================= */

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        function() {

            if (!cart.length) {

                alert(
                    "Votre panier est vide."
                );

                return;
            }


            showPaymentForm();

        }
    );

}


/* =========================================================
   FORMULAIRE DE PAIEMENT
========================================================= */

function showPaymentForm() {

    const total =
        cart.reduce(
            function(sum, product) {

                return sum +
                    Number(product.price || 0);

            },
            0
        );


    const currency =
        cart[0].currency || "XAF";


    const methodsHTML =
        paymentMethods.map(
            function(method, index) {

                return `

                    <label
                        class="payment-method"
                    >

                        <input
                            type="radio"
                            name="paymentProvider"
                            value="${method.id}"
                            ${index === 0
                                ? "checked"
                                : ""}
                        >


                        ${
                            method.logo_url

                            ?

                            `<img
                                src="${escapeAttribute(
                                    method.logo_url
                                )}"
                                alt=""
                            >`

                            :

                            `<span
                                class="payment-icon"
                            >
                                ${getPaymentIcon(
                                    method.provider
                                )}
                            </span>`
                        }


                        <span>

                            <strong>
                                ${escapeHTML(
                                    method.provider
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    method.phone_number
                                )}
                            </small>

                        </span>

                    </label>

                `;

            }
        ).join("");


    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "payment-modal";


    modal.id =
        "paymentModal";


    modal.innerHTML = `

        <div class="payment-card">

            <button
                type="button"
                class="payment-close"
                id="closePayment"
            >
                ×
            </button>


            <h2>
                Paiement
            </h2>


            <p>
                Total à payer :
                <strong>
                    ${formatPrice(
                        total,
                        currency
                    )}
                </strong>
            </p>


            <h3>
                Choisissez votre moyen de paiement
            </h3>


            <div
                class="payment-methods"
            >

                ${methodsHTML}

            </div>


            <div
                id="paymentInstructions"
                class="payment-instructions"
            ></div>


            <label>
                Votre nom

                <input
                    type="text"
                    id="customerName"
                    placeholder="Votre nom"
                    required
                >
            </label>


            <label>
                Numéro utilisé pour le paiement

                <input
                    type="tel"
                    id="customerPhone"
                    placeholder="6XXXXXXXX"
                    required
                >
            </label>


            <label>
                Référence de transaction

                <input
                    type="text"
                    id="transactionReference"
                    placeholder="Référence de transaction"
                    required
                >
            </label>


            <button
                type="button"
                id="confirmPayment"
                class="primary-btn full"
            >
                J'ai effectué le paiement
            </button>


            <p
                id="paymentMessage"
                class="payment-message"
            ></p>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const providerInputs =
        modal.querySelectorAll(
            'input[name="paymentProvider"]'
        );


    providerInputs.forEach(
        function(input) {

            input.addEventListener(
                "change",
                updatePaymentInstructions
            );

        }
    );


    modal.querySelector(
        "#closePayment"
    ).addEventListener(
        "click",
        function() {

            modal.remove();

        }
    );


    modal.querySelector(
        "#confirmPayment"
    ).addEventListener(
        "click",
        submitPayment
    );


    updatePaymentInstructions();

}


/* =========================================================
   INSTRUCTIONS PAIEMENT
========================================================= */

function updatePaymentInstructions() {

    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (!modal)
        return;


    const selected =
        modal.querySelector(
            'input[name="paymentProvider"]:checked'
        );


    if (!selected)
        return;


    const method =
        paymentMethods.find(
            function(item) {

                return String(item.id)
                    === String(selected.value);

            }
        );


    if (!method)
        return;


    const instructions =
        modal.querySelector(
            "#paymentInstructions"
        );


    instructions.innerHTML = `

        <strong>
            ${escapeHTML(
                method.provider
            )}
        </strong>

        <p>
            Effectuez votre dépôt au :
        </p>

        <div class="payment-number">

            ${escapeHTML(
                method.phone_number
            )}

        </div>

        <p>
            Puis renseignez votre référence
            de transaction ci-dessous.
        </p>

    `;

}


/* =========================================================
   ENVOYER LE PAIEMENT
========================================================= */

async function submitPayment() {

    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (!modal)
        return;


    const selected =
        modal.querySelector(
            'input[name="paymentProvider"]:checked'
        );


    const name =
        modal.querySelector(
            "#customerName"
        ).value.trim();


    const phone =
        modal.querySelector(
            "#customerPhone"
        ).value.trim();


    const reference =
        modal.querySelector(
            "#transactionReference"
        ).value.trim();


    const message =
        modal.querySelector(
            "#paymentMessage"
        );


    if (
        !selected ||
        !name ||
        !phone ||
        !reference
    ) {

        message.innerText =
            "Veuillez remplir tous les champs.";

        return;

    }


    const method =
        paymentMethods.find(
            function(item) {

                return String(item.id)
                    === String(selected.value);

            }
        );


    if (!method)
        return;


    const total =
        cart.reduce(
            function(sum, product) {

                return sum +
                    Number(product.price || 0);

            },
            0
        );


    const currency =
        cart[0].currency || "XAF";


    const button =
        modal.querySelector(
            "#confirmPayment"
        );


    button.disabled =
        true;


    button.innerText =
        "Enregistrement...";


    try {

        /* ================================================
           CLIENT
        ================================================ */

        const {
            data: customer,
            error: customerError
        } = await supabaseClient

            .from("customers")

            .insert({

                name: name,

                phone: phone

            })

            .select()

            .single();


        if (customerError)
            throw customerError;


        /* ================================================
           COMMANDE
        ================================================ */

        const {
            data: order,
            error: orderError
        } = await supabaseClient

            .from("orders")

            .insert({

                customer_id:
                    customer.id,

                total:
                    total,

                currency:
                    currency,

                status:
                    "pending"

            })

            .select()

            .single();


        if (orderError)
            throw orderError;


        /* ================================================
           ARTICLES
        ================================================ */

        const items =
            cart.map(
                function(product) {

                    return {

                        order_id:
                            order.id,

                        product_id:
                            product.id,

                        product_name:
                            product.name,

                        price:
                            Number(
                                product.price
                            ),

                        quantity:
                            1

                    };

                }
            );


        const {
            error: itemsError
        } = await supabaseClient

            .from("order_items")

            .insert(items);


        if (itemsError)
            throw itemsError;


        /* ================================================
           PAIEMENT
        ================================================ */

        const {
            error: paymentError
        } = await supabaseClient

            .from("payments")

            .insert({

                order_id:
                    order.id,

                provider:
                    method.provider,

                transaction_id:
                    reference,

                amount:
                    total,

                currency:
                    currency,

                status:
                    "pending"

            });


        if (paymentError)
            throw paymentError;


        /* ================================================
           SUCCÈS
        ================================================ */

        message.innerHTML = `

            <strong>
                Commande enregistrée ✓
            </strong>

            <br><br>

            Votre commande est en attente
            de vérification du paiement.

            <br><br>

            Référence :
            <strong>
                ${escapeHTML(reference)}
            </strong>

        `;


        cart = [];

        updateCart();


        button.style.display =
            "none";


    }

    catch (error) {

        console.error(error);


        message.innerText =
            "Impossible d'enregistrer la commande. Réessayez.";

        button.disabled =
            false;

        button.innerText =
            "J'ai effectué le paiement";

    }

}


/* =========================================================
   ICÔNES PAIEMENT
========================================================= */

function getPaymentIcon(provider) {

    const value =
        String(provider || "")
            .toLowerCase();


    if (value.includes("mtn"))
        return "MTN";


    if (value.includes("orange"))
        return "OM";


    return "₣";

}


/* =========================================================
   RECHERCHE
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            const value =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filtered =
                products.filter(
                    function(product) {

                        return (

                            product.name
                                .toLowerCase()
                                .includes(value)

                            ||

                            (
                                product.description
                                || ""
                            )
                            .toLowerCase()
                            .includes(value)

                        );

                    }
                );


            renderProducts(
                filtered
            );

        }
    );

}


/* =========================================================
   CATÉGORIES
========================================================= */

document
    .querySelectorAll(".category")
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    document
                        .querySelectorAll(
                            ".category"
                        )
                        .forEach(
                            function(item) {

                                item.classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    const category =
                        button.dataset.category;


                    if (
                        category ===
                        "all"
                    ) {

                        renderProducts(
                            products
                        );

                        return;

                    }


                    renderProducts(
                        products.filter(
                            function(product) {

                                return (
                                    product.category
                                    ===
                                    category
                                );

                            }
                        )
                    );

                }
            );

        }
    );


/* =========================================================
   UTILITAIRES
========================================================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(
            /[&<>"']/g,
            function(character) {

                const entities = {

                    "&": "&amp;",

                    "<": "&lt;",

                    ">": "&gt;",

                    '"': "&quot;",

                    "'": "&#039;"

                };


                return entities[
                    character
                ];

            }
        );

}


function escapeAttribute(value) {

    return escapeHTML(value);

}
