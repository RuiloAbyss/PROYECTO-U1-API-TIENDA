const express = require("express");
const productRoutes = require("./routes/product.routes");
const shoppingCartRoutes = require("./routes/shoppingCart.routes");
const authRoutes = require("./routes/auth.routes")
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/product", productRoutes);
app.use("/api/cart", shoppingCartRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
