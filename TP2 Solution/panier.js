// Fonction pour charger les produits depuis IndexedDB
function loadProductsFromCart() {
    let request = indexedDB.open('yourDatabase', 1); // Ouvrir la base de données IndexedDB

    request.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(['cart'], 'readonly');
        let cartStore = transaction.objectStore('cart');
        let getAllRequest = cartStore.getAll(); // Récupérer tous les produits du panier

        getAllRequest.onsuccess = function() {
            // Afficher les produits en appelant la fonction displayCartItem
            displayCartItem(getAllRequest.result);
        };

        getAllRequest.onerror = function() {
            console.error('Erreur lors de la récupération des produits du panier');
        };
    };
    request.onerror = function() {
        console.error('Erreur lors de l\'ouverture de la base de données');
    };
}


// Fonction pour afficher les produits du panier
function displayCartItem(pr) {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = ''; // Vider le contenu actuel

    pr.forEach(product => {
        // Ajouter chaque produit sous forme de ligne dans le tableau
        cartContainer.appendChild(createCartItemRow(product));
    });
}

// Fonction pour créer une ligne de produit
function createCartItemRow(product) {
    // Créer les éléments de la ligne du tableau
    const row = document.createElement('tr');

    const cellName = document.createElement('td');
    cellName.textContent = product.name; // Nom du produit
    
    const cellPrice = document.createElement('td');
    cellPrice.textContent = product.price + ' €'; // Prix du produit
    
    const cellQuantity = document.createElement('td');
    cellQuantity.textContent = product.quantity; // Quantité du produit
    
    const cellTotal = document.createElement('td');
    cellTotal.textContent = (product.price * product.quantity).toFixed(2) + ' €'; // Total
    
    // Ajouter les cellules à la ligne
    row.appendChild(cellName);
    row.appendChild(cellPrice);
    row.appendChild(cellQuantity);
    row.appendChild(cellTotal);

    return row;
}
function updateQuantity(itemId, newQuantity) {
    const dbRequest = openDB();
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readwrite");
        const objectStore = transaction.objectStore("cart");
        const request = objectStore.get(itemId);

        request.onsuccess = () => {
            const item = request.result;
            item.quantity = parseInt(newQuantity, 10);
            objectStore.put(item); // Mettre à jour l'item dans IndexedDB
        };
    };
}
function removeFromCart(itemId) {
    const dbRequest = openDB();
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readwrite");
        const objectStore = transaction.objectStore("cart");
        objectStore.delete(itemId); // Supprimer l'item dans IndexedDB
    };
    loadProductsFromCart(); // Rafraîchir l'affichage du panier
}
