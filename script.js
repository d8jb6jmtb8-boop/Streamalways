let cart = [];

const captchaCheck =
    document.getElementById("robotCheck");

const enterButton =
    document.getElementById("enterButton");

const captchaScreen =
    document.getElementById("captchaScreen");

const site =
    document.getElementById("site");


/* =========================
   CAPTCHA
========================= */

captchaCheck.addEventListener(
    "change",
    function () {

        enterButton.disabled =
            !captchaCheck.checked;

    }
);


enterButton.addEventListener(
    "click",
    function () {

        if (!captchaCheck.checked) {
            return;
        }

        captchaScreen.classList.add(
            "hidden"
        );

        site.classList.remove(
            "hidden"
        );

    }
);


/* =========================
   AJOUT PANIER
========================= */

function addToCart(name, price) {

    cart.push({
        name: name,
        price: price
    });

    updateCart();

    document
        .getElementById("cartOverlay")
        .classList.add("show");

}


/* =========================
   SUPPRESSION
========================= */

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCart();

}


/* =========================
   PANIER
========================= */

function updateCart() {

    const items =
        document.getElementById(
            "cartItems"
        );

    const total =
        document.getElementById(
            "cartTotal"
        );

    const count =
        document.getElementById(
            "cartCount"
        );

    items.innerHTML = "";

    let sum = 0;


    cart.forEach(
        function (item, index) {

            sum += item.price;

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "cart-item";

            div.innerHTML = `

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <div>
                        ${formatPrice(item.price)}
                    </div>

                </div>

                <button
                    onclick="removeFromCart(${index})"
                >
                    ×
                </button>

            `;

            items.appendChild(div);

        }
    );


    total.innerText =
        formatPrice(sum);

    count.innerText =
        cart.length;

}


/* =========================
   PRIX
========================= */

function formatPrice(price) {

    return (
        price.toLocaleString("fr-FR")
        + " FCFA"
    );

}


/* =========================
   OUVRIR PANIER
========================= */

document
    .getElementById("cartButton")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "cartOverlay"
                )
                .classList.add("show");

        }
    );


/* =========================
   FERMER PANIER
========================= */

document
    .getElementById("closeCart")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "cartOverlay"
                )
                .classList.remove(
                    "show"
                );

        }
    );


/* =========================
   RECHERCHE
========================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );


searchInput.addEventListener(
    "input",
    function () {

        const search =
            searchInput.value
                .toLowerCase()
                .trim();

        document
            .querySelectorAll(
                ".product"
            )
            .forEach(
                function (product) {

                    const name =
                        product.dataset.name
                            .toLowerCase();

                    product.style.display =
                        name.includes(search)
                            ? ""
                            : "none";

                }
            );

    }
);


/* =========================
   CATEGORIES
========================= */

document
    .querySelectorAll(".category")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".category"
                        )
                        .forEach(
                            function (btn) {

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

                    document
                        .querySelectorAll(
                            ".product"
                        )
                        .forEach(
                            function (product) {

                                if (
                                    category ===
                                    "all" ||

                                    product
                                        .dataset
                                        .category ===
                                    category
                                ) {

                                    product.style
                                        .display = "";

                                } else {

                                    product.style
                                        .display =
                                        "none";

                                }

                            }
                        );

                }
            );

        }
    );


/* =========================
   PAIEMENT
========================= */

document
    .getElementById(
        "checkoutButton"
    )
    .addEventListener(
        "click",
        function () {

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


/* INITIALISATION */

updateCart();
