import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import ProductManager from './ProductManager.js';

const productManager = new ProductManager('./src/public/productos.json');
const filePathTested = './src/public/archivo.json';

const directoryPath = './src';

export default class CartManager {
  constructor(filePath) {
    this.path = filePath;
    this.carts = [];
    this.loadCarts();
  }

  loadCarts() {
    try {
      const data = readFileSync(this.path, 'utf8');
      if (data) {
        this.carts = JSON.parse(data);
      }
    } catch (error) {
      console.error(`Error al leer el archivo: ${error.message}`);
    }
  }

  saveCarts() {
    try {
      const data = JSON.stringify(this.carts);
      writeFileSync(this.path, data);
    } catch (error) {
      console.error(`Error al escribir en el archivo: ${error.message}`);
    }
  }

  addCart(products) {
    const lastCart = this.carts[this.carts.length - 1];
    const id = lastCart ? lastCart.id + 1 : 100001;
    const newCart = { id, products };
    this.carts.push(newCart);
    this.saveCarts();
    return newCart;
  }

  addCartByProducts(products) {
    const lastCart = this.carts[this.carts.length - 1];
    const id = lastCart ? lastCart.id + 1 : 100001;
    const newCart = { id, products };
    this.carts.push(newCart);
    this.saveCarts();
    return newCart;
  }

  addCartByProductsId(idProducts) {
		const productDetails = idProducts.map(idProduct => {
			const productFinded = productManager.getProduct(Number(idProduct))
			if(productFinded) {
				return productFinded
			} else ;
		})
		const newArray = productDetails.filter(Boolean) //evitar valores: null undefined NaN 0 '' false
    const lastCart = this.carts[this.carts.length - 1];
    const id = lastCart ? lastCart.id + 1 : 100001;
    const newCart = { id, products: newArray };
    this.carts.push(newCart);
    this.saveCarts();
    return newCart;
  }

  getCart(id) {
    return this.carts.find(cart => cart.id === id);
  }
	
  getCarts() {
    return this.carts;
  }

  updateCart(idCart, idProduct, qtyProduct) {
    const indexCart = this.carts.findIndex(cart => cart.id === idCart);

    if (indexCart !== -1) {
			const { products } = this.carts[indexCart];
			
			const product = products.find(product => product.id === idProduct);
			const indexProduct = products.findIndex(product => product.id === idProduct);

			if (indexProduct !== -1) {
				products[indexProduct] = { ...product, quantity: product.quantity ? product.quantity + qtyProduct : qtyProduct}
			} else {
				const productFind = productManager.getProduct(Number(idProduct))
				if(productFind && productFind.id) {
					products.push({...productFind, quantity: qtyProduct});
				}
			}
      this.saveCarts();
    }
		return this.carts.find(cart => cart.id === idCart);
  }  
}


