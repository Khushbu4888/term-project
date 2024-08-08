document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById('product-list');
    const cartItems = document.getElementById('cart-items');
    const subtotalPriceSpan = document.getElementById('subtotal-price');
    const taxPriceSpan = document.getElementById('tax-price');
    const totalPriceSpan = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout');

    // Load products from JSON file
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            const products = data.products;
            loadProducts(products);
        })
        .catch(error => console.error('Error loading products:', error));

    function loadProducts(products) {
        // Render products to the page
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>$${product.price.toFixed(2)}</p>
                <button data-id="${product.id}">Add to Cart</button>
            `;
            productList.appendChild(productDiv);
        });

        // Add to cart event
        productList.addEventListener('click', event => {
            if (event.target.tagName === 'BUTTON') {
                const productId = parseInt(event.target.getAttribute('data-id'));
                addToCart(productId, products);
            }
        });

        // Initial cart update
        updateCart(products);
    }

    // Add product to cart
    function addToCart(productId, products) {
        const product = products.find(p => p.id === productId);
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(p => p.id === productId);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart(products);
    }

    // Update cart
    function updateCart(products) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItems.innerHTML = '';

        let subtotal = 0;

        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            itemDiv.innerHTML = `
                <span>${item.name}</span>
                <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="quantity">
                <span> - $${(item.price * item.quantity).toFixed(2)}</span>
                <button data-id="${item.id}">Remove</button>
            `;
            cartItems.appendChild(itemDiv);
            subtotal += item.price * item.quantity;
        });

        const tax = subtotal * 0.13;
        const total = subtotal + tax;

        subtotalPriceSpan.textContent = subtotal.toFixed(2);
        taxPriceSpan.textContent = tax.toFixed(2);
        totalPriceSpan.textContent = total.toFixed(2);
    }

    // Remove item from cart
    cartItems.addEventListener('click', event => {
        if (event.target.tagName === 'BUTTON') {
            const productId = parseInt(event.target.getAttribute('data-id'));
            removeFromCart(productId);
        }
    });

    // Update quantity in cart
    cartItems.addEventListener('change', event => {
        if (event.target.classList.contains('quantity')) {
            const productId = parseInt(event.target.getAttribute('data-id'));
            const newQuantity = parseInt(event.target.value);
            updateQuantity(productId, newQuantity);
        }
    });

    function removeFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(p => p.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        fetch('products.json')
            .then(response => response.json())
            .then(data => updateCart(data.products))
            .catch(error => console.error('Error updating cart:', error));
    }

    function updateQuantity(productId, newQuantity) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const product = cart.find(p => p.id === productId);

        if (product) {
            if (newQuantity <= 0) {
                removeFromCart(productId);
            } else {
                product.quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                fetch('products.json')
                    .then(response => response.json())
                    .then(data => updateCart(data.products))
                    .catch(error => console.error('Error updating cart:', error));
            }
        }
    }

    // Checkout
    checkoutButton.addEventListener('click', () => {
        alert(`Thank you for your purchase! Total: $${totalPriceSpan.textContent}`);
        localStorage.removeItem('cart');
        fetch('products.json')
            .then(response => response.json())
            .then(data => updateCart(data.products))
            .catch(error => console.error('Error clearing cart:', error));
    });
});
