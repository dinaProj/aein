export type Locale = 'fa' | 'en'

export interface Category {
  id: string
  name_fa: string
  name_en: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  title_fa: string
  title_en: string
  description_fa: string | null
  description_en: string | null
  price: number
  category_id: string | null
  product_type: 'canvas' | 'tshirt' | 'poster'
  images: string[]
  sizes: string[]
  payment_link: string | null
  is_featured: boolean
  stock: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
}

export interface CustomerAccount {
  id: string
  name: string | null
  email: string | null
  phone: string
  password_hash?: string | null
  created_at: string
}

export interface CustomerOtp {
  phone: string
  code_hash: string
  expires_at: string
  attempts: number
  created_at: string
}

export interface CustomOrder {
  id: string
  name: string
  email: string
  phone: string | null
  product_type: string
  description: string
  file_url: string | null
  status: 'pending' | 'reviewed' | 'quoted' | 'completed' | 'cancelled'
  admin_notes: string | null
  created_at: string
}

export interface Order {
  id: string
  customer_id: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  items: CartItem[]
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: string | null
  payment_method: 'card_to_card' | 'gateway'
  payment_status: 'awaiting_admin_review' | 'approved' | 'rejected'
  payment_receipt_url: string | null
  payment_tracking_number: string | null
  created_at: string
}

export interface Dictionary {
  common: {
    home: string
    products: string
    customOrder: string
    cart: string
    admin: string
    search: string
    language: string
    shopName: string
    allRightsReserved: string
    madeWith: string
    contact: string
    about: string
    followUs: string
  }
  home: {
    heroTitle: string
    heroSubtitle: string
    shopNow: string
    featuredProducts: string
    viewAll: string
    customOrderTitle: string
    customOrderDescription: string
    startCustomOrder: string
    categoriesTitle: string
  }
  products: {
    title: string
    allCategories: string
    sortBy: string
    priceAsc: string
    priceDesc: string
    newest: string
    addToCart: string
    outOfStock: string
    selectSize: string
    price: string
    noProducts: string
  }
  cart: {
    title: string
    empty: string
    continueShopping: string
    total: string
    checkout: string
    remove: string
    quantity: string
    size: string
  }
  customOrder: {
    title: string
    subtitle: string
    nameLabel: string
    emailLabel: string
    phoneLabel: string
    productTypeLabel: string
    descriptionLabel: string
    uploadLabel: string
    submitButton: string
    successTitle: string
    successMessage: string
    canvas: string
    tshirt: string
    poster: string
    other: string
  }
  admin: {
    login: string
    email: string
    password: string
    dashboard: string
    products: string
    orders: string
    customOrders: string
    settings: string
    logout: string
    totalProducts: string
    totalOrders: string
    pendingOrders: string
    revenue: string
    addProduct: string
    editProduct: string
    deleteProduct: string
    confirmDelete: string
    save: string
    cancel: string
    status: string
    actions: string
    noOrders: string
    updateStatus: string
  }
}
