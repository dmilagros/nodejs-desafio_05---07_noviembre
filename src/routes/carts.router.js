import express from "express";

import CartManager from '../CartsManager.js';

export const routerCarts = express.Router();

const cartManager = new CartManager('./src/public/carts.json');
const carritos = cartManager.getCarts(); 

routerCarts.get("/", (req, res) => {
	const limit = req.query.limit;

	if (carritos.length < 1) {

		return res.status(200).json({
			status: "success",
			msg: "Se encontraron 0 carritos",
			data: [],
		});

	} else {
		if (req.query && limit) {
			const qty = Number(req.query.limit);
			const carritosConLimite = carritos.slice(0, qty);

			return res.status(200).json({
				status: "success",
				msg: `Listando los ${carritosConLimite.length} carritos solicitados`,
				data: carritosConLimite,
			});

		} else {

			return res.status(200).json({
				status: "success",
				msg: `${carritos.length} carritos encontrados con exito`,
				data: carritos,
			});
		}
	}
});

// * http://localhost:8080/api/carts/100919
routerCarts.get("/:cid", (req, res) => {
	const id = Number(req.params.cid);
	const carrito = carritos.find((c) => c.id === id);

	// const params = req.params;
	// const query = req.query;
	
	if (carrito) {

		return res.status(200).json({
			status: "success",
			msg: `Listando el carrito de id: ${id}`,
			data: carrito,
		});

	} else {

		return res.status(400).json({
      status: "error",
      msg: `no se encontró el carrito de id: ${id}`,
      data: {},
    });
	}
});

// * http://localhost:8080/api/carts/
routerCarts.post("/", (req, res) => {
	const products = req.body;

	if (!products || products.length < 1) {
    return res.status(400).json({
      status: "error",
      msg: `los carritos son obligatorios`,
    });
  } else {
		const carritoAgregado = cartManager.addCartByProducts(products);
		
		return res.status(201).json({
			status: "success",
			msg: `El carrito fue creado con el id: ${carritoAgregado.id} y los productos agregados son: ${carritoAgregado.products.map(product => product.id)}`,
			data: carritoAgregado,
		});
	}
});

// * http://localhost:8080/api/carts/byidproducts/
// agrega productos enviando un array de id de productos
routerCarts.post("/byidproducts/", (req, res) => {
	const idProducts = req.body;

	if (!idProducts || idProducts.length < 1) {
    return res.status(400).json({
      status: "error",
      msg: `los carritos son obligatorios`,
    });
  } else {
		const carritoAgregado = cartManager.addCartByProductsId(idProducts);
		return res.status(201).json({
			status: "success",
			msg: `El carrito fue creado con el id: ${carritoAgregado.id} y los productos agregados son: ${carritoAgregado.products.map(product => product.id)}`,
			data: carritoAgregado,
		});
	}
});

// * http://localhost:8080/api/carts/100005/product/100111
routerCarts.post("/:cid/product/:pid", (req, res) => {
	const idCart = Number(req.params.cid);
	const idProduct = Number(req.params.pid);
	const quantity = req.body.quantity;

  const indice = carritos.findIndex((p) => p.id === idCart);

	if (indice == -1) {

		return res.status(404).json({
			status: "error",
      msg: `error ya que carrito de id ${idCart} no existe`,
      data: {},
    });
  } else {
		const carritoActualizado = cartManager.updateCart(idCart, idProduct, quantity);

    return res.status(201).json({
      status: "success",
      msg: `El carrito de id: ${idCart} fue modificado correctamente`,
      data: carritoActualizado
    });
  }
});

// * http://localhost:8080/api/carts/100102
/* routerCarts.delete("/:pid", (req, res) => {
	const id = Number(req.params.pid);
  const indice = carritos.findIndex((p) => p.id === id);

	if (indice == -1) {

		return res.status(404).json({
			status: "error",
      msg: `error el carrito de id ${id} no existe`,
      data: {},
    });
  } else {
		cartManager.deleteCart(id);

    return res.status(200).json({
      status: "success",
      msg: `El carrito de id: ${id} fue eliminado correctamente`,
			data: {},
    });
  }
}); */
