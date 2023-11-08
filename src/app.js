/* 
Configurar nuestro proyecto para que trabaje con Handlebars y websocket.

		- Configurar el servidor para integrar el motor de plantillas Handlebars e instalar un servidor de socket.io al mismo.
		- Crear una vista “home.handlebars” la cual contenga una lista de todos los productos agregados hasta el momento
		- Además, crear una vista “realTimeProducts.handlebars”, la cual vivirá en el endpoint “/realtimeproducts” 
			en nuestro views router, ésta contendrá la misma lista de productos, sin embargo, ésta trabajará con websockets.
				- Al trabajar con websockets, cada vez que creemos un producto nuevo, o bien cada vez que eliminemos un producto, 
					se debe actualizar automáticamente en dicha vista la lista.
				
			SUGERENCIAS
				- Ya que la conexión entre una consulta HTTP y websocket no está contemplada dentro de la clase. 
					Se recomienda que, para la creación y eliminación de un producto, 
					Se cree un formulario simple en la vista  realTimeProducts.handlebars. 
					Para que el contenido se envíe desde websockets y no HTTP. 
					Sin embargo, esta no es la mejor solución, leer el siguiente punto.
					
				- Si se desea hacer la conexión de socket emits con HTTP, 
					deberás buscar la forma de utilizar el servidor io de Sockets dentro de la petición POST. 
					¿Cómo utilizarás un emit dentro del POST?

*/

import express from "express";
import handlebars from "express-handlebars";
import { routerProducts } from "./routes/products.router.js";
import { routerCarts } from "./routes/carts.router.js";
import { routerVistaHome } from "./routes/productos.vista.router.js";
import { routerVistaProductsSocket } from "./routes/realTimeProducts.vista.router.js";

import ProductManager from './ProductManager.js';

import { __dirname } from "./utils.js";
import { Server } from "socket.io";

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
const productsManager = new ProductManager('./src/public/productos.json');

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
			const updatedProduct = await productsManager.updateProduct(Number(product.id), { ...product });
			socketServer.emit("update-products", await productsManager.getProducts());
		} catch (error) {
			console.error(error);
		}
	});

	socket.on("delete-product", async (productId) => {

		try {
			await productsManager.deleteProduct(Number(productId));
			socketServer.emit("update-products", await productsManager.getProducts());
		} catch (error) {
			console.error(error);
		}
	});
});