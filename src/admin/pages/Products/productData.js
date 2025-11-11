import productImg1 from "../../assets/products/product-01.svg"
import productImg2 from "../../assets/products/product-02.svg"
import productImg3 from "../../assets/products/product-03.svg"
import productImg4 from "../../assets/products/product-04.svg"

export const productImages = [productImg1, productImg2, productImg3, productImg4]

export const defaultProductImage = productImg1

export const initialProducts = [
  {
    id: "PRD-1040",
    name: "Men Grey Hoodie",
    sku: "SKU-2401",
    image: productImages[0],
    category: "Hoodies",
    color: "Black",
    variant: "Men",
    stock: { onHand: 96, state: "In stock", tone: "success" },
    pricing: { listPrice: "$49.90", compareAt: "$59.00" },
    status: { label: "Published", tone: "success" },
    rating: 5.0,
    votes: 32
  },
  {
    id: "PRD-1039",
    name: "Women Striped T-Shirt",
    sku: "SKU-1522",
    image: productImages[1],
    category: "T-Shirt",
    color: "White",
    variant: "Women",
    stock: { onHand: 56, state: "In stock", tone: "success" },
    pricing: { listPrice: "$34.90", compareAt: "$44.90" },
    status: { label: "Published", tone: "success" },
    rating: 4.8,
    votes: 24
  },
  {
    id: "PRD-1038",
    name: "Women White T-Shirt",
    sku: "SKU-1523",
    image: productImages[2],
    category: "T-Shirt",
    color: "White",
    variant: "Women",
    stock: { onHand: 78, state: "In stock", tone: "success" },
    pricing: { listPrice: "$40.90", compareAt: null },
    status: { label: "Published", tone: "success" },
    rating: 5.0,
    votes: 54
  },
  {
    id: "PRD-1037",
    name: "Men White T-Shirt",
    sku: "SKU-1420",
    image: productImages[3],
    category: "T-Shirt",
    color: "White",
    variant: "Men",
    stock: { onHand: 32, state: "Low stock", tone: "warning" },
    pricing: { listPrice: "$49.90", compareAt: "$59.90" },
    status: { label: "Scheduled", tone: "primary" },
    rating: 4.5,
    votes: 31
  },
  {
    id: "PRD-1036",
    name: "Women Red T-Shirt",
    sku: "SKU-1621",
    image: productImages[0],
    category: "T-Shirt",
    color: "Red",
    variant: "Women",
    stock: { onHand: 0, state: "Out of stock", tone: "danger" },
    pricing: { listPrice: "$34.90", compareAt: null },
    status: { label: "Draft", tone: "muted" },
    rating: 4.9,
    votes: 22
  }
]

export const statusToneMap = {
  published: "success",
  draft: "muted",
  scheduled: "primary",
  archived: "muted"
}

export const statusLabelMap = {
  published: "Published",
  draft: "Draft",
  scheduled: "Scheduled",
  archived: "Archived"
}

export const getStockToneClass = (tone) => {
  if (!tone) return ""
  return `stock${tone.charAt(0).toUpperCase()}${tone.slice(1)}`
}
