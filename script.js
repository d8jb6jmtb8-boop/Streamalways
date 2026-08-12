/* =========================================================
   STREAMALWAYS
   Supabase + produits + recherche + catégories + panier
   ========================================================= */

const SUPABASE_URL =
    "https://effatbwukrldzghvakut.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_v2XtiLdrdsKVRAGhgWoZ_A_MBhVjval";


/* =========================================================
   CONNEXION SUPABASE
   ========================================================= */

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   VARIABLES
   ========================================================= */

let products = [];
let cart = [];

const captchaCheck =
    document.getElementById("robotCheck");

const enterButton =
    document.getElementById("enterButton");

const captchaScreen =
    document.getElementById("captchaScreen");

const site =
    document.getElementById("site");

const productsContainer =
    document.getElementById("products");

const searchInput =
    document.getElementById("searchInput");

const cartOverlay =
    document.getElementById("cartOverlay");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const cartCount =
    document.getElementById("cartCount");


/* =========================================================
   CAPTCHA
   ========================================================= */

if (captchaCheck && enterButton) {

    captchaCheck.addEventListener(
        "change",
        function () {

            enterButton.disabled =
                !captchaCheck.checked;

        }
    );


    enterButton.addEventListener(
        "click",
        async function () {

            if (!captchaCheck.checked) {
                return;
            }

            captchaScreen.classList.add("hidden");

            site.classList.remove("hidden");

            await loadProducts();

        }
    );

}


/* =========================================================
   CHARGER LES PRODUITS DEPUIS SUPABASE
   ========================================================= */

async function loadProducts() {

    if (!productsContainer) {
        return;
    }

    productsContainer.innerHTML = `
        <div style="
            grid-column:1/-1;
            text-align:center;
            padding:50px;
        ">
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

            .eq("active", true)

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Erreur Supabase :",
                error
            );

            productsContainer.innerHTML = `
                <div style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:50px;
                ">
                    Impossible de charger les abonnements.
                    <br>
                    Vérifie la configuration de Supabase.
                </div>
            `;

            return;
        }


        products = data || [];

        renderProducts(products);

    }

    catch (error) {

        console.error(error);

        productsContainer.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px;
            ">
                Une erreur est survenue.
            </div>
        `;

    }

}


/* =========================================================
   AFFICHER LES PRODUITS
   ========================================================= */

function renderProducts(list) {

    if (!productsContainer) {
        return;
    }


    if (list.length === 0) {

        productsContainer.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px;
            ">
                Aucun abonnement disponible.
            </div>
        `;

        return;
    }


    productsContainer.innerHTML = "";


    list.forEach(function(product) {

        const article =
            document.createElement("article");

        article.className = "product";


        article.dataset.category =
            product.category || "other";


        article.dataset.name =
            product.name || "";


        const logo =
            product.logo_url

            ?

            `
            <img
                src="${escapeAttribute(product.logo_url)}"
                alt="${escapeAttribute(product.name)}"
                style="
                    width:100%;
                    height:100%;
                    object-fit:contain;
                    border-radius:14px;
                "
            >
            `

            :

            getDefaultLogo(product.name);


        const category =
            getCategoryName(
                product.category
            );


        const price =
            formatPrice(
                product.price,
                product.currency
            );


        article.innerHTML = `

            <div class="
                product-logo
                ${getLogoClass(product.name)}
            ">

                ${logo}

            </div>


            <div class="product-info">

                <span class="product-type">
                    ${category}
                </span>


                <h3>
                    ${escapeHTML(product.name)}
                </h3>


                <p>
                    ${escapeHTML(
                        product.description || ""
                    )}
                </p>

            </div>


            <div class="product-bottom">

                <strong>
                    ${price}
                </strong>


                <button
                    type="button"
                    class="buy-button"
                    data-product-id="${product.id}"
                >
                    Acheter
                </button>

            </div>

        `;


        const buyButton =
            article.querySelector(
                ".buy-button"
            );


        buyButton.addEventListener(
            "click",
            function() {

                addToCart(
                    product.id
                );

            }
        );


        productsContainer.appendChild(
            article
        );

    });

}


/* =========================================================
   LOGOS PAR DÉFAUT
   ========================================================= */

function getDefaultLogo(name) {

    const lower =
        String(name || "")
            .toLowerCase();


    if (lower.includes("spotify")) {

        return "S";

    }


    if (lower.includes("apple")) {

        return "";

    }


    if (lower.includes("netflix")) {

        return "N";

    }


    if (lower.includes("prime")) {

        return "▶";

    }


    if (lower.includes("youtube")) {

        return "▶";

    }


    if (lower.includes("canva")) {

        return "C";

    }


    if (lower.includes("capcut")) {

        return "C";

    }


    if (lower.includes("chatgpt")) {

        return "✦";

    }


    if (lower.includes("snapchat")) {

        return "👻";

    }


    if (lower.includes("telegram")) {

        return "✈";

    }


    if (lower.includes("duolingo")) {

        return "D";

    }


    if (lower.includes("crunchyroll")) {

        return "◉";

    }


    return "✦";

}


/* =========================================================
   CLASSE LOGO
   ========================================================= */

function getLogoClass(name) {

    const lower =
        String(name || "")
            .toLowerCase();


    if (lower.includes("spotify"))
        return "spotify";


    if (lower.includes("apple"))
        return "apple";


    if (lower.includes("netflix"))
        return "netflix";


    if (lower.includes("prime"))
        return "prime";


    if (lower.includes("youtube"))
        return "youtube";


    if (lower.includes("canva"))
        return "canva";


    if (lower.includes("capcut"))
        return "capcut";


    if (lower.includes("chatgpt"))
        return "chatgpt";


    if (lower.includes("snapchat"))
        return "snapchat";


    if (lower.includes("telegram"))
        return "telegram";


    if (lower.includes("duolingo"))
        return "duolingo";


    if (lower.includes("crunchyroll"))
        return "crunchyroll";


    return "";

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

    const value =
        Number(price) || 0;


    return (
        value.toLocaleString("fr-FR")
        + " "
        + currency
    );

}


/* =========================================================
   PANIER
   ========================================================= */

function addToCart(productId) {

    const product =
        products.find(
            function(item) {

                return String(item.id) ===
                    String(productId);

            }
        );


    if (!product) {
        return;
    }


    cart.push(product);


    updateCart();


    if (cartOverlay) {

        cartOverlay.classList.add(
            "show"
        );

    }

}


/* =========================================================
   SUPPRIMER DU PANIER
   ========================================================= */

function removeFromCart(index) {

    cart.splice(
        index,
        1
    );


    updateCart();

}


/* =========================================================
   ACTUALISER LE PANIER
   ========================================================= */

function updateCart() {

    if (!cartItems) {
        return;
    }


    cartItems.innerHTML = "";


    let total = 0;


    cart.forEach(
        function(product, index) {

            total +=
                Number(product.price) || 0;


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

                    <div>
                        ${formatPrice(
                            product.price,
                            product.currency
                        )}
                    </div>

                </div>


                <button
                    type="button"
                    data-index="${index}"
                >
                    ×
                </button>

            `;


            item.querySelector(
                "button"
            ).addEventListener(
                "click",
                function() {

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


    if (cartTotal) {

        const currency =
            cart.length > 0
                ? cart[0].currency || "XAF"
                : "XAF";


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
   RECHERCHE
   ========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filtered =
                products.filter(
                    function(product) {

                        return (
                            product.name
                                .toLowerCase()
                                .includes(search)

                            ||

                            (
                                product.description
                                || ""
                            )
                            .toLowerCase()
                            .includes(search)
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
   FILTRES CATÉGORIES
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
                            function(btn) {

                                btn.classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    const category =
                        button.dataset
                            .category;


                    if (category === "all") {

                        renderProducts(
                            products
                        );

                        return;

                    }


                    const filtered =
                        products.filter(
                            function(product) {

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


/* =========================================================
   OUVRIR PANIER
   ========================================================= */

const cartButton =
    document.getElementById(
        "cartButton"
    );


if (cartButton) {

    cartButton.addEventListener(
        "click",
        function() {

            if (cartOverlay) {

                cartOverlay.classList.add(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   FERMER PANIER
   ========================================================= */

const closeCart =
    document.getElementById(
        "closeCart"
    );


if (closeCart) {

    closeCart.addEventListener(
        "click",
        function() {

            if (cartOverlay) {

                cartOverlay.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   FERMER EN CLIQUANT À L'EXTÉRIEUR
   ========================================================= */

if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                cartOverlay
            ) {

                cartOverlay.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   PAIEMENT
   ========================================================= */

const checkoutButton =
    document.getElementById(
        "checkoutButton"
    );


if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        function() {

            if (cart.length === 0) {

                alert(
                    "Votre panier est vide."
                );

                return;

            }


            alert(
                "Le paiement sera connecté à MTN Mobile Money et Orange Money dans la prochaine étape."
            );

        }
    );

}


/* =========================================================
   SÉCURITÉ AFFICHAGE HTML
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


/* =========================================================
   INITIALISATION
   ========================================================= */

/*
   Si le CAPTCHA existe, les produits seront chargés
   après validation.

   Si tu enlèves le CAPTCHA plus tard,
   le site pourra charger directement.
*/

if (
    !captchaScreen &&
    productsContainer
) {

    loadProducts();

}
