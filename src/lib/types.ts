export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  badge?: string | null;
  description: string;
  sizes: string[];
  inStock: boolean;
  images: string[];
  cardScale?: number;
  detailsScale?: number;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  user?: { id: string; name: string; email: string };
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  unitPrice: number;
}
