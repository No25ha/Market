// Product Types
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  images: string[];
  ratingsAverage: number;
  ratingsQuantity: number;
  quantity: number;
  category?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

// SubCategory Types
export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
}

// Brand Types
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

// Auth Types
export interface SignUpData {
  name: string;
  email: string;
  password: string;
  rePassword: string;
  phone: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  token: string;
}

// Wishlist Types
export interface WishlistItem {
  _id: string;
  productId: string;
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  images: string[];
  ratingsAverage: number;
  ratingsQuantity: number;
  quantity?: number;
  category?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
}

export interface WishlistResponse {
  status: string;
  count: number;
  data: WishlistItem[];
}

// Cart Types
export interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    description: string;
    price: number;
    priceAfterDiscount?: number;
    imageCover: string;
    images: string[];
    ratingsAverage: number;
    ratingsQuantity: number;
    category?: {
      _id: string;
      name: string;
    };
    brand?: {
      _id: string;
      name: string;
    };
  };
  count: number;
  price: number;
}

export interface CartResponse {
  status: string;
  numOfCartItems: number;
  cartId: string;
  data: {
    _id: string;
    cartOwner: string;
    products: CartItem[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    totalCartPrice: number;
    totalPriceAfterDiscount?: number;
  };
}

// Address Types
export interface Address {
  _id: string;
  name: string;
  details: string;
  phone: string;
  city: string;
}

export interface AddAddressData {
  name: string;
  details: string;
  phone: string;
  city: string;
}

// Order Types
export interface OrderProduct {
  _id: string;
  count: number;
  price: number;
  product: {
    _id: string;
    title: string;
    imageCover: string;
  };
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  cartItems: OrderProduct[];
  totalOrderPrice: number;
  totalPriceAfterDiscount?: number;
  paymentMethodType: string;
  shippingAddress: {
    details: string;
    phone: string;
    city: string;
  };
  orderStatus: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  status: string;
  data: Order[];
}
