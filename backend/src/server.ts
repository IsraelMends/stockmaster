import express from "express";

import cors from "cors"; //Permite que outros sites acessem minha API

import dotenv from "dotenv"; //Carrega as informações do arquivo .env

import { router as authRouter } from "./routes/authRoutes.js";

import { router as categoryRouter } from "./routes/categoriesRoutes.js";

import { router as productsRouter } from "./routes/productRoutes.js";

import { router as supplierRouter } from "./routes/suppliersRoutes.js";

import { router as stockMovimentRouter } from "./routes/stockMovementsRoutes.js";

import { router as alertsRouter } from "./routes/alertRoutes.js";

import { router as dashboardRouter } from "./routes/dashboardRoutes.js";

import { router as userRouter } from "./routes/userRoutes.js";

import { errorMiddleware } from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use(authRouter);
app.use(categoryRouter);
app.use(productsRouter);
app.use(supplierRouter);
app.use(stockMovimentRouter);
app.use(alertsRouter);
app.use(dashboardRouter);
app.use(userRouter)

app.get("/", (req, res) => {
  res.json({ message: "API Funcionando" });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 3333;

export { app };

app.listen(PORT, () => {
  //Função executada quando o servidor está ligado
  console.log(`HTTP Server is running in port ${PORT}`);
});
