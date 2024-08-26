const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const carItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");

let cart = [];

cartBtn.addEventListener("click", function() {
    updateCartModal();
    cartModal.style.display = "flex";
});

cartModal.addEventListener("click", function(event){
    if(event.target === cartModal){
        cartModal.style.display = "none";
    }
});

closeModalBtn.addEventListener("click", function(){
    cartModal.style.display = "none";    
});

menu.addEventListener("click", function(event){
    let parentButton = event.target.closest(".add-to-cart-btn");

    if(parentButton){
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));
        addToCart(name, price);
    }
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if(existingItem){
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
        });
    }

    updateCartModal();
}

function updateCartModal(){
    carItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const carItemElement = document.createElement("div");
        carItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        carItemElement.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <p class="font-medium">${item.name}</p>
                <p>Qtd: ${item.quantity}</p>
                <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
            </div>
            <div>
                <button class="remove-from-cart-btn" data-name="${item.name}">
                    Remover
                </button>
            </div>
        </div>
        `;

        total += item.price * item.quantity;
        carItemsContainer.appendChild(carItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.innerHTML = cart.length;
}

carItemsContainer.addEventListener("click", function(event){
    if(event.target.classList.contains("remove-from-cart-btn")){
        const name = event.target.getAttribute("data-name");
        decreaseItemQuantity(name);
    }
});

function decreaseItemQuantity(name) {
    const item = cart.find(item => item.name === name);

    if (item) {
        item.quantity -= 1;

        if (item.quantity <= 0) {
            cart = cart.filter(item => item.name !== name);
        }

        updateCartModal();
    }
}

// Função para finalizar o pedido
checkoutBtn.addEventListener("click", function() {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {

        Toastify({
            text: "Ops, o restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "#ef4444",
            },
            onClick: function(){} // Callback after click
          }).showToast();

          return;
    }

    if (addressInput.value.trim() === "") {
        addressInput.classList.add("border", "border-red-500");
        addressWarn.textContent = "Por favor, insira o endereço de entrega.";
        addressWarn.style.display = "block";
    } else {
        addressInput.classList.remove("border", "border-red-500");
        addressWarn.style.display = "none";

        // Construir a mensagem para o WhatsApp
        let message = "Olá, gostaria de fazer o seguinte pedido:\n\n";

        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.name} - R$ ${item.price.toFixed(2)}\n`;
        });

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        message += `\nTotal: R$ ${total.toFixed(2)}`;
        message += `\n\nEndereço de entrega: ${addressInput.value.trim()}`;

        // Codificar a mensagem para URL
        const encodedMessage = encodeURIComponent(message);

        // Número de WhatsApp da hamburgueria (inclua o código do país, sem espaços ou caracteres especiais)
        const phoneNumber = "5521976328873"; // Substitua pelo número real

        // URL do WhatsApp com a mensagem
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        // Log da URL gerada para debug
        console.log("WhatsApp URL: ", whatsappURL);

        // Teste se a URL funciona ao abrir diretamente
        // window.location.href = whatsappURL;

        // Redirecionar para o WhatsApp
        window.open(whatsappURL, "_blank");
    }
});


function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    return hora >= 18 && hora < 22;
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600");
} else {
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-500");
}

