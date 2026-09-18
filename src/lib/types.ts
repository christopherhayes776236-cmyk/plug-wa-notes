export interface Product {
  id: string;
  type: 'notes' | 'video' | 'videoSlides' | 'fullPack';
  name: string;
  description: string;
  price: number;
  fileUrl?: string | null;
}

export interface Unit {
  code: string;
  name: string;
  description: string;
  lecturer?: string;
  products: Product[];
}

export interface Order {
  id: string;
  orderId: string;
  unitCode: string;
  productType: string;
  phone: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  fileUrl?: string | null;
  checkoutRequestId?: string;
  createdAt: string;
}
