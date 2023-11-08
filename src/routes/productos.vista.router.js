import express from "express";
import ProductManager from '../ProductManager.js';

export const routerVistaHome = express.Router();

const productManager = new ProductManager('./src/public/productos.json');
const productos = productManager.getProducts(); 

routerVistaHome.get("/", (req, res) => {
  return res.render("home", {
    titulo: "LISTADO DE PRODUCTOS",
    productos: productos,
  });
});
