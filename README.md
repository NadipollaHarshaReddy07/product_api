# Product API

Simple Express API that stores products in a local file `products.json`.

Available endpoints:

- GET /products — return all products
- GET /products/instock — return only products where `inStock` is true
- POST /products — add a product (body: `{ name, price, inStock }`)
- PUT /products/:id — update product
- DELETE /products/:id — delete product

How to run

1. Install Node.js (includes npm)
2. In this folder run:

```powershell
npm install
npm run dev   # or npm start
```

By default the server listens on port 3001 to avoid conflicts. To run on a different port set the PORT environment variable before starting, for example:

```powershell
#$env:PORT=3002; npm run dev
# or
PORT=3002 npm run dev
```
