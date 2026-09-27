export interface ProductFileItem {
  name: string;
  fileUrl: string;
  fileName: string;
  type: 'notes' | 'slides' | 'audio' | 'video';
}

export interface Product {
  id: string;
  type: 'notes' | 'video' | 'audio' | 'videoSlides' | 'fullPack';
  name: string;
  description: string;
  price: number;
  thumbnailSrc: string;
  fileUrl?: string | null;
  files?: ProductFileItem[];
  previewSrc?: string;
  previewSlides?: string[];
}


export interface WeekSection {
  id: string;
  title: string;
  products: Product[];
}

export interface Unit {
  code: string;
  name: string;
  description: string;
  lecturer?: string;
  sections: WeekSection[];
}

export interface Order {
  id: string;
  orderId: string;
  unitCode: string;
  productType: string;
  productId?: string;
  phone: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  fileUrl?: string | null;
  checkoutRequestId?: string;
  createdAt: string;
}
