require('dotenv').config();

const express = require("express");
const productRoutes = require("./routes/product.routes");
const shoppingCartRoutes = require("./routes/shoppingcart.routes");
const authRoutes = require("./routes/auth.routes")
const cors = require('cors');
const app = express();


app.use(express.json());
app.use(cors({ origin: 'https://electronic-store-nu.vercel.app' }));

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/product", productRoutes);
app.use("/api/shoppingcart", shoppingCartRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
