import express from "express";
import ProductManager from '../ProductManager.js';

export const routerVistaProductsSocket = express.Router();

const productManager = new ProductManager('./src/public/productos.json');
const productos = productManager.getProducts(); 

routerVistaProductsSocket.get("/", (req, res) => {
  return res.render("realtimeproducts", { productos, title: 'Productos en tiempo real' });
});
