const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
// Allow overriding the port via environment variable; default to 3001 to avoid common conflicts
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(express.json());

const dataFile = path.join(__dirname, "products.json");

// Helper: Read products file
function readProducts() {
  try {
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, JSON.stringify([]));
    }
    const data = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading products file:", err);
    return [];
  }
}

// Helper: Write products file
function writeProducts(products) {
  fs.writeFileSync(dataFile, JSON.stringify(products, null, 2));
}

// ✅ GET /products → return all products
app.get("/products", (req, res) => {
  const products = readProducts();
  res.json(products);
});

// ✅ BONUS: GET /products/instock → only in-stock items
app.get("/products/instock", (req, res) => {
  const products = readProducts();
  const inStockProducts = products.filter(p => p.inStock === true);
  res.json(inStockProducts);
});

// ✅ POST /products → add a product
app.post("/products", (req, res) => {
  const { name, price, inStock } = req.body;
  if (!name || price === undefined || typeof inStock !== "boolean") {
    return res.status(400).json({ error: "Invalid product data" });
  }

  const products = readProducts();
  const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;

  const newProduct = { id: newId, name, price, inStock };
  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

// ✅ PUT /products/:id → update product
app.put("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price, inStock } = req.body;
  const products = readProducts();

  const index = products.findIndex(p => p.id === productId);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (name !== undefined) products[index].name = name;
  if (price !== undefined) products[index].price = price;
  if (inStock !== undefined) products[index].inStock = inStock;

  writeProducts(products);
  res.json(products[index]);
});

// ✅ DELETE /products/:id → remove product
app.delete("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const products = readProducts();

  const index = products.findIndex(p => p.id === productId);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  products.splice(index, 1);
  writeProducts(products);
  res.json({ message: "Product deleted successfully" });
});

// Root route: show a friendly HTML page with links to endpoints
app.get('/', (req, res) => {
  const port = PORT;
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Product API</title>
        <style>
          body{ font-family:Segoe UI,Arial,Helvetica,sans-serif; background:#f6fbff; color:#123; padding:24px }
          .box{ background:#fff; padding:18px; border-radius:8px; box-shadow:0 6px 20px rgba(15,76,129,0.08); max-width:820px; margin:auto }
          a{ color:#1e88e5 }
          ul{ line-height:1.8 }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Product API</h1>
          <p>Server running on port ${port}</p>
          <p>Available endpoints:</p>
          <ul>
            <li><a href="/products">GET /products</a> — list all products</li>
            <li><a href="/products/instock">GET /products/instock</a> — list in-stock products</li>
            <li>POST /products — add a product (JSON body)</li>
            <li>PUT /products/:id — update a product (JSON body)</li>
            <li>DELETE /products/:id — delete a product</li>
          </ul>
          <p>Use a REST client (Postman/curl) to test POST/PUT/DELETE.</p>
        </div>
      </body>
    </html>
  `);
});

// ✅ Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Start the server with a different PORT, e.g. PORT=3001 node server.js`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});
