export interface CartItem {
  cartId: number;
  productId: number;
  productName: string;
  productPrice: number;
  imageUrl: string;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
  count: number;
}
