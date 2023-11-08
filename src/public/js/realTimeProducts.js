import express from "express";
import handlebars from "express-handlebars";
import { routerCarts } from "./routes/carts.router.js";
import { routerVistaHome } from "./routes/productos.vista.router.js";
import { routerProducts } from "./routes/products.router.js";
import { routerVistaProductsSocket } from "./routes/realTimeProducts.vista.router.js";

import ProductManager from './ProductManager.js';

import { Server } from "socket.io";
import { __dirname } from "./utils.js";

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//CONFIGURACION DEL MOTOR DE HANDLEBARS
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//archivos publicos
app.use(express.static(__dirname + "/public"));

//ENDPOINT TIPO API CON DATOS CRUDOS EN JSON
app.use("/api/products", routerProducts);
app.use("/api/carts", routerCarts);

//HTML REAL TIPO VISTA
app.use("/vista/productos", routerVistaHome);

//VISTA Sockets
app.use("/vista/realtimeproducts", routerVistaProductsSocket);

app.get("*", (req, res) => {
	return res.status(404).json({
		status: "error",
		msg: "error esa ruta no existe",
		data: {},
	});
});

const httpServer = app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
const socketServer = new Server(httpServer);
const productsManager = new ProductManager('./public/productos.json');

socketServer.on("connection", (socket) => {

	socket.on("new-product", async (product) => {

		try {
			const newProduct = await productsManager.addProduct(product);
			socketServer.emit("update-products", await productsManager.getProducts());

		} catch (error) {
			console.error(error);
		}
	});
	socket.on("edit-product", async (product) => {

		try {
			const updatedProduct = await productsManager.updateProduct(product);
			socketServer.emit("update-products", await productsManager.getProducts());
		} catch (error) {
			console.error(error);
		}
	});

	socket.on("delete-product", async (productId) => {

		try {
			await productsManager.deleteProduct(productId);
			socketServer.emit("update-products", await productsManager.getProducts());
		} catch (error) {
			console.error(error);
		}
	});
});