/* =========================================================
   STREAMALWAYS - SCRIPT.JS
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
let paymentMethods = [];

let cart =
    JSON.parse(
        localStorage.getItem("streamalways_cart")
    ) || [];

let turnstileToken = null;


/* =========================================================
   LOGOS LOCAUX
   ========================================================= */

const LOCAL_LOGOS = {

    "netflix":
        "logos/netflix.svg",

    "spotify":
        "logos/spotify.svg",

    "prime video":
        "logos/prime-video.svg",

    "prime-video":
        "logos/prime-video.svg",

    "amazon prime":
        "logos/prime-video.svg",

    "apple music":
        "logos/apple-music.svg",

    "canva":
        "logos/canva.svg",

    "capcut":
        "logos/capcut.svg",

    "chatgpt":
        "logos/chatgpt.svg",

    "chatgpt plus":
        "logos/chatgpt.svg",

    "snapchat":
        "logos/snapchat.svg",

    "snapchat+":
        "logos/snapchat.svg",

    "telegram":
        "logos/telegram.svg",

    "telegram premium":
        "logos/telegram.svg",

    "duolingo":
        "logos/duolingo.svg"

};


/* =========================================================
   TROUVER LE LOGO
   ========================================================= */

function getProductLogo(product) {

    const name =
        String(
            product.name || ""
        )
        .trim()
        .toLowerCase();


    /*
     * On privilégie le logo local.
     */

    if (
        LOCAL_LOGOS[name]
    ) {

        return LOCAL_LOGOS[name];

    }


    /*
     * Recherche partielle.
     */

    for (
        const key in LOCAL_LOGOS
    ) {

        if (
            name.includes(key)
        ) {

            return LOCAL_LOGOS[key];

        }

    }


    /*
     * Si Supabase contient
     * quand même une logo_url,
     * on peut l'utiliser.
     */

    if (
        product.logo_url
    ) {

        return product.logo_url;

    }


    return null;

}


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        updateCartCount();

        setupCaptcha();

        setupSearch();

        setupCategories();

        await loadProducts();

        if (
            document.getElementById(
                "checkoutItems"
            )
        ) {

            await loadPaymentMethods();

            renderCheckout();

        }

    }
);


/* =========================================================
   CAPTCHA CLOUDFLARE TURNSTILE
   ========================================================= */

window.turnstileVerified =
function (token) {

    turnstileToken = token;


    const button =
        document.getElementById(
            "enterButton"
        );


    if (button) {

        button.disabled = false;

    }

};


window.turnstileExpired =
function () {

    turnstileToken = null;

};


window.turnstileError =
function () {

    turnstileToken = null;

};


/* =========================================================
   OUVERTURE DU SITE APRÈS CAPTCHA
   ========================================================= */

function setupCaptcha() {

    const button =
        document.getElementById(
            "enterButton"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            if (!turnstileToken) {

                alert(
                    "Veuillez terminer la vérification."
                );

                return;

            }


            const captchaScreen =
                document.getElementById(
                    "captchaScreen"
                );


            const site =
                document.getElementById(
                    "site"
                );


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

        }
    );

}


/* =========================================================
   CHARGEMENT DES PRODUITS
   ========================================================= */

async function loadProducts() {

    const container =
        document.getElementById(
            "products"
        );


    try {

        const {
            data,
            error
        } =
        await supabaseClient
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

            throw error;

        }


        products =
            data || [];


        if (container) {

            renderProducts(
                products
            );

        }

    }

    catch (error) {

        console.error(
            "Erreur produits :",
            error
        );


        if (container) {

            container.innerHTML = `

                <div class="loading">

                    Impossible de charger
                    les abonnements.

                </div>

            `;

        }

    }

}


/* =========================================================
   AFFICHAGE DES PRODUITS
   ========================================================= */

function renderProducts(list) {

    const container =
        document.getElementById(
            "products"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (!list.length) {

        container.innerHTML = `

            <p>
                Aucun abonnement trouvé.
            </p>

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
                getProductLogo(
                    product
                );


            let logoHTML;


            if (logo) {

                logoHTML = `

                    <img
                        src="${escapeHTML(logo)}"
                        alt="${escapeHTML(product.name)}"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='block';">

                    <span
                        class="logo-letter"
                        style="display:none;">

                        ${escapeHTML(
                            String(
                                product.name || "S"
                            ).charAt(0)
                        )}

                    </span>

                `;

            }

            else {

                logoHTML = `

                    <span class="logo-letter">

                        ${escapeHTML(
                            String(
                                product.name || "S"
                            ).charAt(0)
                        )}

                    </span>

                `;

            }


            card.innerHTML = `

                <div class="product-logo">

                    ${logoHTML}

                </div>


                <div>

                    <span class="product-type">

                        ${escapeHTML(
                            product.category || ""
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
                        type="button">

                        Ajouter

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


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   PANIER
   ========================================================= */

function addToCart(product) {

    cart.push(
        product
    );


    saveCart();

    updateCartCount();


    alert(
        product.name +
        " a été ajouté au panier."
    );

}


function saveCart() {

    localStorage.setItem(
        "streamalways_cart",
        JSON.stringify(cart)
    );

}


function updateCartCount() {

    const element =
        document.getElementById(
            "cartCount"
        );


    if (element) {

        element.textContent =
            cart.length;

    }

}


/* =========================================================
   CHECKOUT
   ========================================================= */

function renderCheckout() {

    const container =
        document.getElementById(
            "checkoutItems"
        );


    const totalElement =
        document.getElementById(
            "checkoutTotal"
        );


    if (!container) {

        return;

    }


    if (!cart.length) {

        container.innerHTML = `

            <p>
                Votre panier est vide.
            </p>

            <br>

            <a
                href="index.html"
                class="primary-btn">

                Choisir un abonnement

            </a>

        `;


        if (totalElement) {

            totalElement.textContent =
                "0 XAF";

        }

        return;

    }


    let total = 0;


    container.innerHTML = "";


    cart.forEach(
        function (product) {

            total +=
                Number(
                    product.price || 0
                );


            const item =
                document.createElement(
                    "div"
                );


            item.style.padding =
                "15px 0";


            item.style.borderBottom =
                "1px solid #eee";


            const logo =
                getProductLogo(
                    product
                );


            item.innerHTML = `

                <div style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                ">

                    ${
                        logo

                        ?

                        `
                        <img
                            src="${escapeHTML(logo)}"
                            style="
                                width:45px;
                                height:45px;
                                object-fit:contain;
                                border-radius:10px;
                            "
                            alt="">
                        `

                        :

                        ""
                    }


                    <div>

                        <strong>

                            ${escapeHTML(
                                product.name
                            )}

                        </strong>

                        <br>

                        <span>

                            ${formatPrice(
                                product.price,
                                product.currency
                            )}

                        </span>

                    </div>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );


    if (totalElement) {

        totalElement.textContent =
            formatPrice(
                total,
                cart[0].currency ||
                "XAF"
            );

    }


    setupPaymentForm();

}


/* =========================================================
   MOYENS DE PAIEMENT
   ========================================================= */

async function loadPaymentMethods() {

    try {

        const {
            data,
            error
        } =
        await supabaseClient
            .from("payment_settings")
            .select("*")
            .eq("active", true);


        if (error) {

            throw error;

        }


        paymentMethods =
            data || [];


        renderPaymentMethods();

    }

    catch (error) {

        console.error(
            "Erreur paiement :",
            error
        );

    }

}


/* =========================================================
   AFFICHAGE PAIEMENT
   ========================================================= */

function renderPaymentMethods() {

    const container =
        document.getElementById(
            "paymentMethods"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    paymentMethods.forEach(
        function (method, index) {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "payment-method";


            label.innerHTML = `

                <input
                    type="radio"
                    name="paymentProvider"
                    value="${escapeHTML(
                        method.id
                    )}"
                    ${index === 0
                        ? "checked"
                        : ""}>


                <span>

                    <strong>

                        ${escapeHTML(
                            method.provider
                        )}

                    </strong>


                    <br>


                    <small>

                        ${escapeHTML(
                            method.phone_number
                        )}

                    </small>

                </span>

            `;


            const input =
                label.querySelector(
                    "input"
                );


            input.addEventListener(
                "change",
                updatePaymentInstructions
            );


            container.appendChild(
                label
            );

        }
    );


    updatePaymentInstructions();

}


/* =========================================================
   INSTRUCTIONS PAIEMENT
   ========================================================= */

function updatePaymentInstructions() {

    const selected =
        document.querySelector(
            'input[name="paymentProvider"]:checked'
        );


    const box =
        document.getElementById(
            "paymentInstructions"
        );


    if (
        !selected ||
        !box
    ) {

        return;

    }


    const method =
        paymentMethods.find(
            function (item) {

                return String(item.id)
                    ===
                    String(
                        selected.value
                    );

            }
        );


    if (!method) {

        return;

    }


    box.innerHTML = `

        <strong>

            ${escapeHTML(
                method.provider
            )}

        </strong>


        <p>

            Envoyez le montant de votre
            commande au :

        </p>


        <div class="payment-number">

            ${escapeHTML(
                method.phone_number
            )}

        </div>


        <p>

            Après le dépôt, indiquez la
            référence de transaction et
            envoyez votre reçu.

        </p>

    `;

}


/* =========================================================
   FORMULAIRE CHECKOUT
   ========================================================= */

function setupPaymentForm() {

    const button =
        document.getElementById(
            "submitOrder"
        );


    if (!button) {

        return;

    }


    if (
        button.dataset.ready === "true"
    ) {

        return;

    }


    button.dataset.ready =
        "true";


    button.addEventListener(
        "click",
        submitOrder
    );


    const fileInput =
        document.getElementById(
            "proofFile"
        );


    if (fileInput) {

        fileInput.addEventListener(
            "change",
            previewFile
        );

    }

}


/* =========================================================
   APERÇU CAPTURE
   ========================================================= */

function previewFile(event) {

    const file =
        event.target.files[0];


    const preview =
        document.getElementById(
            "filePreview"
        );


    if (
        !file ||
        !preview
    ) {

        return;

    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        preview.innerHTML =
            "<p>Veuillez choisir une image.</p>";

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (e) {

            preview.innerHTML = `

                <img
                    src="${e.target.result}"
                    alt="Aperçu du reçu">

            `;

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   ENVOI COMMANDE
   ========================================================= */

async function submitOrder() {

    const message =
        document.getElementById(
            "checkoutMessage"
        );


    const button =
        document.getElementById(
            "submitOrder"
        );


    const name =
        document.getElementById(
            "customerName"
        ).value.trim();


    const phone =
        document.getElementById(
            "customerPhone"
        ).value.trim();


    const reference =
        document.getElementById(
            "transactionReference"
        ).value.trim();


    const file =
        document.getElementById(
            "proofFile"
        ).files[0];


    const selected =
        document.querySelector(
            'input[name="paymentProvider"]:checked'
        );


    if (
        !name ||
        !phone ||
        !reference ||
        !file ||
        !selected ||
        !cart.length
    ) {

        message.textContent =
            "Veuillez remplir tous les champs et ajouter la capture.";

        return;

    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        message.textContent =
            "Le reçu doit être une image.";

        return;

    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        message.textContent =
            "La capture doit faire moins de 5 Mo.";

        return;

    }


    button.disabled =
        true;


    button.textContent =
        "Envoi en cours...";


    try {

        /* CLIENT */

        const {
            data: customer,
            error: customerError
        } =
        await supabaseClient
            .from("customers")
            .insert({

                name:
                    name,

                phone:
                    phone

            })
            .select()
            .single();


        if (customerError) {

            throw customerError;

        }


        /* TOTAL */

        const total =
            cart.reduce(
                function (
                    sum,
                    product
                ) {

                    return sum +
                        Number(
                            product.price ||
                            0
                        );

                },
                0
            );


        const currency =
            cart[0].currency ||
            "XAF";


        /* COMMANDE */

        const {
            data: order,
            error: orderError
        } =
        await supabaseClient
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


        if (orderError) {

            throw orderError;

        }


        /* ARTICLES */

        const items =
            cart.map(
                function (product) {

                    return {

                        order_id:
                            order.id,

                        product_id:
                            product.id,

                        product_name:
                            product.name,

                        price:
                            Number(
                                product.price ||
                                0
                            ),

                        quantity:
                            1

                    };

                }
            );


        const {
            error: itemsError
        } =
        await supabaseClient
            .from("order_items")
            .insert(
                items
            );


        if (itemsError) {

            throw itemsError;

        }


        /* CAPTURE */

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const filePath =
            `${order.id}/${crypto.randomUUID()}.${extension}`;


        const {
            error: uploadError
        } =
        await supabaseClient
            .storage
            .from("payment-proofs")
            .upload(
                filePath,
                file,
                {

                    contentType:
                        file.type,

                    upsert:
                        false

                }
            );


        if (uploadError) {

            throw uploadError;

        }


        /* PAIEMENT */

        const method =
            paymentMethods.find(
                function (item) {

                    return String(item.id)
                        ===
                        String(
                            selected.value
                        );

                }
            );


        const {
            error: paymentError
        } =
        await supabaseClient
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

                proof_url:
                    filePath,

                status:
                    "pending"

            });


        if (paymentError) {

            throw paymentError;

        }


        /* NUMÉRO COMMANDE */

        localStorage.setItem(
            "streamalways_last_order",
            order.order_number
        );


        /* VIDER PANIER */

        localStorage.removeItem(
            "streamalways_cart"
        );


        /* REDIRECTION */

        window.location.href =
            "confirmation.html";

    }

    catch (error) {

        console.error(
            "Erreur commande :",
            error
        );


        message.textContent =
            "Une erreur est survenue. Vérifiez les informations puis réessayez.";


        button.disabled =
            false;


        button.textContent =
            "Envoyer ma commande";

    }

}


/* =========================================================
   RECHERCHE
   ========================================================= */

function setupSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        function () {

            const query =
                input.value
                    .toLowerCase()
                    .trim();


            const filtered =
                products.filter(
                    function (product) {

                        return (

                            String(
                                product.name || ""
                            )
                            .toLowerCase()
                            .includes(
                                query
                            )

                            ||

                            String(
                                product.description || ""
                            )
                            .toLowerCase()
                            .includes(
                                query
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
   CATÉGORIES
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
                        function (item) {

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
                            function (product) {

                                return String(
                                    product.category || ""
                                )
                                .toLowerCase()
                                ===
                                category
                                .toLowerCase();

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
   FORMAT PRIX
   ========================================================= */

function formatPrice(
    price,
    currency
) {

    return (

        Number(
            price || 0
        )
        .toLocaleString(
            "fr-FR"
        )

        +

        " "

        +

        (
            currency ||
            "XAF"
        )

    );

}


/* =========================================================
   PROTECTION HTML
   ========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replace(
        /[&<>"']/g,
        function (char) {

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


            return entities[
                char
            ];

        }
    );

}
