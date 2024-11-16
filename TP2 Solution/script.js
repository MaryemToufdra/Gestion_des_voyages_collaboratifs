// Lancer l'application quand le DOM est chargé
document.addEventListener('onload', getProducts());

function openDB() { 

    const dbRequest = indexedDB.open("CoffeeShopDB", 1); 
    dbRequest.onupgradeneeded = (event) => { 
        const db = event.target.result; 
        if (!db.objectStoreNames.contains("products")) { 
        db.createObjectStore("products", { keyPath: "id" }); 
        } 
        if (!db.objectStoreNames.contains("cart")) { 
        db.createObjectStore("cart", { keyPath: "id" }); 
        } 
        }; 
        dbRequest.onerror = (event) => {
            console.error("Erreur lors de l'ouverture de la base de données:", event.target.errorCode);
        };
        return dbRequest; 
    }

    function addProductsToDB(products) {
        const dbRequest = openDB();
    
        dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("products", "readwrite");
            const store = transaction.objectStore("products");
    
            products.forEach(product => {
                store.put(product);  
            });
    
            transaction.oncomplete = () => {
                console.log("Les produits ont été ajoutés à la base de données IndexedDB avec succès.");
            };
    
            transaction.onerror = (event) => {
                console.error("Erreur lors de l'ajout des produits à IndexedDB:", event.target.errorCode);
            };
        };
    
        dbRequest.onerror = (event) => {
            console.error("Erreur lors de l'ouverture de la base de données pour l'ajout des produits:", event.target.errorCode);
        };
    }
    
    function getProducts() {
        fetch('https://fake-coffee-api.vercel.app/api')
            .then(response => response.json())
            .then(data => {
                products = data;
                displayProducts(products);  // Display products on the page
                addProductsToDB(products);  // Store products in IndexedDB
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des produits:", error);
                loadProductsFromDB();  // Load from IndexedDB in case of failure
            });
    }
    

function loadProductsFromDB() {
    const dbRequest = openDB();

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("products", "readonly");
        const store = transaction.objectStore("products");

        const productsRequest = store.getAll();

        productsRequest.onsuccess = () => {
            const storedProducts = productsRequest.result;
            if (storedProducts.length > 0) {
                displayProducts(storedProducts);  // Display products from IndexedDB
                console.log("Produits chargés depuis IndexedDB (mode hors ligne).");
            } else {
                console.log("Aucun produit trouvé dans IndexedDB.");
            }
        };

        productsRequest.onerror = () => {
            console.error("Erreur lors de la récupération des produits depuis IndexedDB.");
        };
    };

    dbRequest.onerror = (event) => {
        console.error("Erreur lors de l'ouverture de la base de données pour le chargement des produits:", event.target.errorCode);
    };
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image_url}" alt="${product.title}"  >
        <h3>${product.name}</h3>
        <div class="product-info">
        <h4 class="price">${product.price}dh </h4>
        <p class="description">${product.description}</p>
        <button onclick="addToCart('${product.id}')" class="add-to-cart">+</button> 
        </div>
    `;
    return card;
}

// Afficher les produits
function displayProducts(products) {
    const grid = document.querySelector('.product-content');
    grid.innerHTML = '';
    products.forEach(product => {
        grid.appendChild(createProductCard(product));
    });
}

function addToCart(productId) {
    // Find the product details from the products array
    let product_detail = products.find(p => p.id == productId);

    if (!product_detail) {
        console.error("Produit non trouvé:", productId);
        return;
    }

    // Create the cart item object
    const cartItem = {
        id: productId,
        image_url: product_detail.image_url,
        name: product_detail.name,
        price: product_detail.price,
        quantity: 1
    };

    // Open the database and add the item to the cart store
    const dbRequest = openDB();

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readwrite");
        const store = transaction.objectStore("cart");

        // Check if the item already exists in the cart
        const getRequest = store.get(productId);
        
        getRequest.onsuccess = () => {
            const existingItem = getRequest.result;
            
            if (existingItem) {
                // If the item is already in the cart, increase the quantity
                existingItem.quantity += 1;
                store.put(existingItem);
                console.log("Quantité mise à jour pour le produit dans le panier:", existingItem);
            } else {
                // If the item is not in the cart, add it as a new item
                store.add(cartItem);
                console.log("Produit ajouté au panier:", cartItem);
            }
        };

        getRequest.onerror = () => {
            console.error("Erreur lors de la récupération de l'article du panier:", getRequest.error);
        };

        transaction.oncomplete = () => {
            console.log("Transaction pour l'ajout au panier terminée avec succès.");
        };

        transaction.onerror = (event) => {
            console.error("Erreur lors de l'ajout du produit au panier:", event.target.errorCode);
        };
    };

    dbRequest.onerror = (event) => {
        console.error("Erreur lors de l'ouverture de la base de données pour le panier:", event.target.errorCode);
    };
}

// Mode view
const container = document.querySelector('.product-content');
const gridIcon = document.getElementById('grid');
const listIcon = document.getElementById('list');

// Fonction pour passer en vue grille
function setGridView() {
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.flexWrap = 'wrap';
    container.style.gap = '20px';
    container.style.justifyContent = 'flex-start';
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.maxWidth = '300px';
    });


}

// Fonction pour passer en vue liste
function setListView() {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    
    document.querySelectorAll('.product-card').forEach(card => {
        
        card.style.display = 'flex';
        card.style.flexDirection = 'row';
        card.style.maxWidth = '100%';
        card.style.alignItems = 'center';
        card.style.gap = '20px';
    });

    document.querySelectorAll('.product-card img ').forEach(img => {
        img.style.maxWidth="200px";
    });
    
    document.querySelectorAll('.product-card button').forEach(btn => {
        btn.style.alignSelf  = 'flex-end';
    });

}

// Ajouter les écouteurs d'événements aux icônes
gridIcon.addEventListener('click', setGridView);
listIcon.addEventListener('click', setListView);

// Initialiser la vue par défaut (grille)
setGridView();




// Fonction pour filtrer les produits
function filterProducts() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    if (!keyword) {
        displayProducts(products);
        return;
    }
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        (product.description && product.description.toLowerCase().includes(keyword))
    );
    displayProducts(filteredProducts);
}
// Écouteur d'événement pour le champ de recherche
document.getElementById('search-input').addEventListener('input', filterProducts);
document.getElementById('grid-view').addEventListener('click', setGridView);
document.getElementById('list-view').addEventListener('click', setListView);
getProducts();




