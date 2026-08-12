/* =========================================================
   STREAMALWAYS — SCRIPT COMPLET
   Supabase + Turnstile + Produits + Panier + Paiement
========================================================= */


/* =========================================================
   1. CONFIGURATION SUPABASE
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
   2. VARIABLES
========================================================= */

let products = [];
let cart = [];
let paymentMethods = [];
let turnstileToken = null;


/* =========================================================
   3. ELEMENTS HTML
========================================================= */

let captchaScreen;
let enterButton;
let site;
let productsContainer;
let searchInput;
let cartButton;
let cartOverlay;
let cartItems;
let cartTotal;
let cartCount;
let closeCart;
let checkoutButton;


/* =========================================================
   4. INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        captchaScreen =
            document.getElementById(
                "captchaScreen"
            );

        enterButton =
            document.getElementById(
                "enterButton"
            );

        site =
            document.getElementById(
                "site"
            );

        productsContainer =
            document.getElementById(
                "products"
            );

        searchInput =
            document.getElementById(
                "searchInput"
            );

        cartButton =
            document.getElementById(
                "cartButton"
            );

        cartOverlay =
            document.getElementById(
                "cartOverlay"
            );

        cartItems =
            document.getElementById(
                "cartItems"
            );

        cartTotal =
            document.getElementById(
                "cartTotal"
            );

        cartCount =
            document.getElementById(
                "cartCount"
            );

        closeCart =
            document.getElementById(
                "closeCart"
            );

        checkoutButton =
            document.getElementById(
                "checkoutButton"
            );


        setupEnterButton();

        setupCart();

        setupSearch();

        setupCategories();

        updateCart();

    }
);


/* =========================================================
   5. CLOUDFLARE TURNSTILE
========================================================= */

window.turnstileVerified =
    function (token) {

        turnstileToken =
            token;


        if (enterButton) {

            enterButton.disabled =
                false;

            enterButton.classList.add(
                "ready"
            );

        }

    };


window.turnstileExpired =
    function () {

        turnstileToken =
            null;


        if (enterButton) {

            enterButton.disabled =
                true;

            enterButton.classList.remove(
                "ready"
            );

        }

    };


window.turnstileError =
    function () {

        turnstileToken =
            null;


        if (enterButton) {

            enterButton.disabled =
                true;

            enterButton.classList.remove(
                "ready"
            );

        }

    };


/* =========================================================
   6. BOUTON ENTRER
========================================================= */

function setupEnterButton() {

    if (!enterButton)
        return;


    enterButton.addEventListener(
        "click",
        async function () {

            if (!turnstileToken) {

                alert(
                    "Veuillez terminer la vérification anti-robot."
                );

                return;

            }


            enterButton.disabled =
                true;

            enterButton.innerText =
                "Chargement...";


            if (captchaScreen) {

                captchaScreen.classList.add(
                    "hidden"
                );

            }


            if (site) {

                site.classList.remove(
                    "hidden"
                );

            }


            await loadProducts();

            await loadPaymentMethods();


            enterButton.innerText =
                "Entrer sur StreamAlways";

        }
    );

}


/* =========================================================
   7. CHARGER LES PRODUITS SUPABASE
========================================================= */

async function loadProducts() {

    if (!productsContainer)
        return;


    productsContainer.innerHTML = `
        <div class="loading">
            Chargement des abonnements...
        </div>
    `;


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("products")

            .select("*")

            .eq(
                "active",
                true
            )

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Erreur produits :",
                error
            );

            productsContainer.innerHTML = `
                <div class="loading">
                    Impossible de charger les abonnements.
                </div>
            `;

            return;

        }


        products =
            data || [];


        renderProducts(
            products
        );

    }

    catch (error) {

        console.error(
            error
        );


        productsContainer.innerHTML = `
            <div class="loading">
                Une erreur est survenue.
            </div>
        `;

    }

}


/* =========================================================
   8. AFFICHER LES PRODUITS
========================================================= */

function renderProducts(
    list
) {

    if (!productsContainer)
        return;


    productsContainer.innerHTML =
        "";


    if (!list.length) {

        productsContainer.innerHTML = `
            <div class="loading">
                Aucun abonnement disponible.
            </div>
        `;

        return;

    }


    list.forEach(
        function (product) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "product";


            const logo =
                product.logo_url

                    ?

                `
                <img
                    src="${escapeAttribute(
                        product.logo_url
                    )}"
                    alt="${escapeAttribute(
                        product.name
                    )}"
                >
                `

                    :

                `
                <span class="logo-letter">
                    ${getLogoLetter(
                        product.name
                    )}
                </span>
                `;


            card.innerHTML = `

                <div class="product-logo">

                    ${logo}

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
                        type="button"
                        class="buy-button"
                    >
                        Acheter
                    </button>

                </div>

            `;


            const buyButton =
                card.querySelector(
                    ".buy-button"
                );


            buyButton.addEventListener(
                "click",
                function () {

                    addToCart(
                        product
                    );

                }
            );


            productsContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   9. LOGOS PAR DÉFAUT
========================================================= */

function getLogoLetter(
    name
) {

    const value =
        String(name || "")
            .toLowerCase();


    if (
        value.includes("spotify")
    )
        return "S";


    if (
        value.includes("apple")
    )
        return "";


    if (
        value.includes("netflix")
    )
        return "N";


    if (
        value.includes("youtube")
    )
        return "▶";


    if (
        value.includes("prime")
    )
        return "▶";


    if (
        value.includes("canva")
    )
        return "C";


    if (
        value.includes("capcut")
    )
        return "C";


    if (
        value.includes("chatgpt")
    )
        return "✦";


    if (
        value.includes("snapchat")
    )
        return "👻";


    if (
        value.includes("telegram")
    )
        return "✈";


    if (
        value.includes("duolingo")
    )
        return "D";


    if (
        value.includes("crunchyroll")
    )
        return "◉";


    return "✦";

}


/* =========================================================
   10. CATEGORIES
========================================================= */

function getCategoryName(
    category
) {

    const categories = {

        music:
            "MUSIQUE",

        video:
            "VIDÉO",

        creative:
            "CRÉATIF",

        ai:
            "IA",

        social:
            "SOCIAL",

        education:
            "ÉDUCATION",

        anime:
            "ANIME",

        other:
            "AUTRES"

    };


    return (
        categories[category]
        ||
        "AUTRES"
    );

}


/* =========================================================
   11. FORMAT PRIX
========================================================= */

function formatPrice(
    price,
    currency = "XAF"
) {

    const number =
        Number(
            price || 0
        );


    return (
        number.toLocaleString(
            "fr-FR"
        )
        +
        " "
        +
        currency
    );

}


/* =========================================================
   12. PANIER
========================================================= */

function addToCart(
    product
) {

    cart.push(
        product
    );


    updateCart();

    openCart();

}


function removeFromCart(
    index
) {

    cart.splice(
        index,
        1
    );


    updateCart();

}


/* =========================================================
   13. ACTUALISER PANIER
========================================================= */

function updateCart() {

    if (!cartItems)
        return;


    cartItems.innerHTML =
        "";


    let total = 0;


    cart.forEach(
        function (
            product,
            index
        ) {

            total +=
                Number(
                    product.price || 0
                );


            const item =
                document.createElement(
                    "div"
                );


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
                    aria-label="Supprimer"
                >
                    ×
                </button>

            `;


            item.querySelector(
                "button"
            ).addEventListener(
                "click",
                function () {

                    removeFromCart(
                        index
                    );

                }
            );


            cartItems.appendChild(
                item
            );

        }
    );


    if (!cart.length) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                Votre panier est vide.
            </div>
        `;

    }


    const currency =
        cart.length
            ?
            (
                cart[0].currency
                ||
                "XAF"
            )
            :
            "XAF";


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
   14. OUVRIR / FERMER PANIER
========================================================= */

function setupCart() {

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
            function (event) {

                if (
                    event.target ===
                    cartOverlay
                ) {

                    closeCartWindow();

                }

            }
        );

    }


    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            function () {

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

}


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


/* =========================================================
   15. RECHERCHE
========================================================= */

function setupSearch() {

    if (!searchInput)
        return;


    searchInput.addEventListener(
        "input",
        function () {

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filtered =
                products.filter(
                    function (
                        product
                    ) {

                        return (

                            String(
                                product.name
                                || ""
                            )
                            .toLowerCase()
                            .includes(
                                search
                            )

                            ||

                            String(
                                product.description
                                || ""
                            )
                            .toLowerCase()
                            .includes(
                                search
                            )

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
   16. CATEGORIES
========================================================= */

function setupCategories() {

    const buttons =
        document.querySelectorAll(
            ".category"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    buttons.forEach(
                        function (
                            item
                        ) {

                            item.classList.remove(
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


                    const filtered =
                        products.filter(
                            function (
                                product
                            ) {

                                return (
                                    product.category
                                    ===
                                    category
                                );

                            }
                        );


                    renderProducts(
                        filtered
                    );

                }
            );

        }
    );

}


/* =========================================================
   17. MOYENS DE PAIEMENT
========================================================= */

async function loadPaymentMethods() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient

                .from(
                    "payment_settings"
                )

                .select("*")

                .eq(
                    "active",
                    true
                )

                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        if (error) {

            console.error(
                "Erreur paiement :",
                error
            );

            return;

        }


        paymentMethods =
            data || [];

    }

    catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   18. FORMULAIRE PAIEMENT
========================================================= */

function showPaymentForm() {

    const total =
        cart.reduce(
            function (
                sum,
                product
            ) {

                return (
                    sum
                    +
                    Number(
                        product.price
                        ||
                        0
                    )
                );

            },
            0
        );


    const currency =
        cart[0].currency
        ||
        "XAF";


    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "payment-modal";


    modal.id =
        "paymentModal";


    const methods =
        paymentMethods.length
            ?
            paymentMethods
            :
            [];


    const methodsHTML =
        methods.map(
            function (
                method,
                index
            ) {

                return `

                    <label
                        class="payment-method"
                    >

                        <input
                            type="radio"
                            name="paymentProvider"
                            value="${escapeAttribute(
                                method.id
                            )}"
                            ${
                                index === 0
                                ?
                                "checked"
                                :
                                ""
                            }
                        >


                        <span
                            class="payment-icon"
                        >

                            ${getPaymentIcon(
                                method.provider
                            )}

                        </span>


                        <span>

                            <strong>

                                ${escapeHTML(
                                    method.provider
                                )}

                            </strong>


                            <small>

                                ${escapeHTML(
                                    method.phone_number
                                    ||
                                    ""
                                )}

                            </small>

                        </span>

                    </label>

                `;

            }
        ).join("");


    modal.innerHTML = `

        <div class="payment-card">

            <button
                type="button"
                class="payment-close"
                id="closePayment"
            >
                ×
            </button>


            <span class="payment-label">
                STREAMALWAYS
            </span>


            <h2>
                Finaliser la commande
            </h2>


            <div class="payment-total">

                <span>
                    Total
                </span>

                <strong>

                    ${formatPrice(
                        total,
                        currency
                    )}

                </strong>

            </div>


            <h3>
                Moyen de paiement
            </h3>


            <div
                class="payment-methods"
            >

                ${
                    methodsHTML
                    ||
                    `
                    <p>
                        Aucun moyen de paiement
                        disponible.
                    </p>
                    `
                }

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
                    placeholder="Ex : Bryan"
                    autocomplete="name"
                >

            </label>


            <label>

                Numéro utilisé pour payer

                <input
                    type="tel"
                    id="customerPhone"
                    placeholder="6XXXXXXXX"
                    autocomplete="tel"
                >

            </label>


            <label>

                Référence de transaction

                <input
                    type="text"
                    id="transactionReference"
                    placeholder="Référence de votre paiement"
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


    const closeButton =
        modal.querySelector(
            "#closePayment"
        );


    closeButton.addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );


    const providers =
        modal.querySelectorAll(
            'input[name="paymentProvider"]'
        );


    providers.forEach(
        function (
            input
        ) {

            input.addEventListener(
                "change",
                updatePaymentInstructions
            );

        }
    );


    const confirm =
        modal.querySelector(
            "#confirmPayment"
        );


    confirm.addEventListener(
        "click",
        submitPayment
    );


    updatePaymentInstructions();

}


/* =========================================================
   19. INSTRUCTIONS MTN / ORANGE
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
            function (
                item
            ) {

                return String(
                    item.id
                )
                ===
                String(
                    selected.value
                );

            }
        );


    if (!method)
        return;


    const instructions =
        modal.querySelector(
            "#paymentInstructions"
        );


    instructions.innerHTML = `

        <div>

            <strong>

                ${escapeHTML(
                    method.provider
                )}

            </strong>


            <p>

                Envoyez le montant
                indiqué au numéro :

            </p>


            <div class="payment-number">

                ${escapeHTML(
                    method.phone_number
                    ||
                    ""
                )}

            </div>


            <p>

                Après le paiement,
                indiquez votre référence
                de transaction ci-dessous.

            </p>

        </div>

    `;

}


/* =========================================================
   20. ENREGISTRER COMMANDE
========================================================= */

async function submitPayment() {

    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (!modal)
        return;


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


    const selected =
        modal.querySelector(
            'input[name="paymentProvider"]:checked'
        );


    const message =
        modal.querySelector(
            "#paymentMessage"
        );


    const button =
        modal.querySelector(
            "#confirmPayment"
        );


    if (
        !name ||
        !phone ||
        !reference ||
        !selected
    ) {

        message.innerText =
            "Veuillez remplir tous les champs.";

        return;

    }


    const method =
        paymentMethods.find(
            function (
                item
            ) {

                return String(
                    item.id
                )
                ===
                String(
                    selected.value
                );

            }
        );


    if (!method) {

        message.innerText =
            "Moyen de paiement invalide.";

        return;

    }


    const total =
        cart.reduce(
            function (
                sum,
                product
            ) {

                return (
                    sum
                    +
                    Number(
                        product.price
                        ||
                        0
                    )
                );

            },
            0
        );


    const currency =
        cart[0].currency
        ||
        "XAF";


    button.disabled =
        true;


    button.innerText =
        "Enregistrement...";


    message.innerText =
        "";


    try {

        /* ===============================================
           CLIENT
        =============================================== */

        const {
            data: customer,
            error: customerError
        } =
            await supabaseClient

                .from(
                    "customers"
                )

                .insert({

                    name:
                        name,

                    phone:
                        phone

                })

                .select()

                .single();


        if (customerError)
            throw customerError;


        /* ===============================================
           COMMANDE
        =============================================== */

        const {
            data: order,
            error: orderError
        } =
            await supabaseClient

                .from(
                    "orders"
                )

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


        /* ===============================================
           ARTICLES
        =============================================== */

        const orderItems =
            cart.map(
                function (
                    product
                ) {

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
            error: itemError
        } =
            await supabaseClient

                .from(
                    "order_items"
                )

                .insert(
                    orderItems
                );


        if (itemError)
            throw itemError;


        /* ===============================================
           PAIEMENT
        =============================================== */

        const {
            error: paymentError
        } =
            await supabaseClient

                .from(
                    "payments"
                )

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


        /* ===============================================
           SUCCÈS
        =============================================== */

        message.innerHTML = `

            <strong>
                ✓ Commande enregistrée
            </strong>

            <br><br>

            Votre paiement est en cours
            de vérification.

            <br><br>

            Référence :

            <strong>
                ${escapeHTML(
                    reference
                )}
            </strong>

        `;


        cart = [];

        updateCart();


        button.style.display =
            "none";

    }

    catch (error) {

        console.error(
            "Erreur commande :",
            error
        );


        message.innerText =
            "Impossible d'enregistrer la commande. Réessayez.";


        button.disabled =
            false;


        button.innerText =
            "J'ai effectué le paiement";

    }

}


/* =========================================================
   21. ICÔNE PAIEMENT
========================================================= */

function getPaymentIcon(
    provider
) {

    const value =
        String(
            provider || ""
        )
        .toLowerCase();


    if (
        value.includes("mtn")
    ) {

        return "MTN";

    }


    if (
        value.includes("orange")
    ) {

        return "OM";

    }


    return "₣";

}


/* =========================================================
   22. SÉCURITÉ AFFICHAGE
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /[&<>"']/g,
        function (
            character
        ) {

            const entities = {

                "&":
                    "&amp;",

                "<":
                    "&lt;",

                ">":
                    "&gt;",

                '"':
                    "&quot;",

                "'":
                    "&#039;"

            };


            return (
                entities[
                    character
                ]
                ||
                character
            );

        }
    );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}
