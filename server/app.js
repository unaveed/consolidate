import express from "express";
import transactionRoutes from "./routes/transactions.js";

const app = express();
const PORT = 5000;

app.use("/transactions", transactionRoutes);

app.listen(PORT, () => {
    console.log(`Server running on localhost:${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Hello world");
});
