## Lien repo: ##
https://github.com/FloMenus/temps-reel-tp1

## Lancement ##

```
docker compose up --build -d
```

Le serveur répond sur http://localhost:3000. Page de suivi d'une commande : http://localhost:3000/?id=1

## Routes ##

- `GET /users` : liste des utilisateurs (200)
- `GET /users/:id` : un utilisateur (200, 404)
- `GET /products` : liste des produits (200)
- `GET /products/:id` : un produit (200, 404)
- `GET /orders` : liste des commandes (200)
- `GET /orders/:id` : une commande (200, 404)
- `POST /orders` `{ userId, productId, quantity }` : crée une commande (201, 400 invalide, 404 client/produit inconnu, 409 stock insuffisant)
- `PUT /orders/:id/status` `{ status }` : change le statut (200, 400 status manquant, 404, 409 transition interdite)
- `GET /stream` : flux SSE (événements `order-created`, `order-status`, `order-cancelled`, `stock-updated`)


