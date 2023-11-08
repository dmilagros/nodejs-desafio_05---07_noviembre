import express from "express";

import ProductManager from '../ProductManager.js';

export const routerProducts = express.Router();

const productManager = new ProductManager('./src/public/productos.json');
const productos = productManager.getProducts(); 

routerProducts.get("/", (req, res) => {
	const limit = req.query.limit;

	if (productos.length < 1) {

		return res.status(200).json({
			status: "success",
			msg: "Se encontraron 0 productos",
			data: [],
		});

	} else {
		if (req.query && limit) {
			const qty = Number(req.query.limit);
			const productosConLimite = productos.slice(0, qty);

			return res.status(200).json({
				status: "success",
				msg: `Listando los ${productosConLimite.length} productos solicitados`,
				data: productosConLimite,
			});

		} else {

			return res.status(200).json({
				status: "success",
				msg: `${productos.length} productos encontrados con exito`,
				data: productos,
			});
		}
	}
});

// * http://localhost:8080/api/products/100919
routerProducts.get("/:pid", (req, res) => {
	const id = Number(req.params.pid);
	const producto = productos.find((p) => p.id === id);

	// const params = req.params;
	// const query = req.query;
	
	if (producto) {

		return res.status(200).json({
			status: "success",
			msg: `Listando el producto de id: ${id}`,
			data: producto,
		});

	} else {

		return res.status(400).json({
      status: "error",
      msg: `no se encontró el producto de id: ${id}`,
      data: {},
    });
	}
});

// * http://localhost:8080/api/products
routerProducts.post("/", (req, res) => {
	const {
		title,
		description,
		code,
		price,
		status,
		stock,
		category,
		thumbnails,
	} = req.body;

	if (!title || !description || !code || !price || !status || !stock || !category) {
		let varRequired = !title ? "title" : !description ? "description" : !code ? "code" : !price ? "price" : !status ? "status" : !stock ? "stock" : "category"
    return res.status(400).json({
      status: "error",
      msg: `El campo ${varRequired} es obligatorio`,
    });
  } else {
		const nuevoProducto = {
			title,
			description,
			code,
			price,
			status,
			stock,
			category,
			thumbnails,
		}
		const productoAgregado = productManager.addProduct(nuevoProducto);

		return res.status(201).json({
			status: "success",
			msg: "creamos el producto que pediste",
			data: productoAgregado,
		});
	}
});

// * http://localhost:8080/api/products/100103
routerProducts.put("/:pid", (req, res) => {
	const id = Number(req.params.pid);
	const datosNuevos = req.body;
  const indice = productos.findIndex((p) => p.id === id);

	if (indice == -1) {

		return res.status(404).json({
			status: "error",
      msg: `error ya que producto de id ${id} no existe`,
      data: {},
    });
  } else {
		const productoActualizado = productManager.updateProduct(id, datosNuevos);

    return res.status(201).json({
      status: "success",
      msg: `El producto de id: ${id} fue modificado correctamente`,
      data: productoActualizado
    });
  }
});

// * http://localhost:8080/api/products/100102
routerProducts.delete("/:pid", (req, res) => {
	const id = Number(req.params.pid);
  const indice = productos.findIndex((p) => p.id === id);

	if (indice == -1) {

		return res.status(404).json({
			status: "error",
      msg: `error el producto de id ${id} no existe`,
      data: {},
    });
  } else {
		productManager.deleteProduct(id);

    return res.status(200).json({
      status: "success",
      msg: `El producto de id: ${id} fue eliminado correctamente`,
			data: {},
    });
  }
});
