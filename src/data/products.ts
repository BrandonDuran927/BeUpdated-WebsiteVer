import { firestore } from "../config/firebase"; // Ensure this is correctly set up
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stockQuantity: number;
  color: string[] | string; // Changed from 'colors' to 'color'
  size?: string[] | string; // Changed from 'sizes' to 'size'
  category: string;
  imageUrl: string;
  lastUpdated: string;
  isNew?: boolean;
  discount?: number;
  oldPrice?: number;
}

/**
 * 🔹 Fetch all products from Firestore
 */
export const fetchProducts = async (): Promise<Product[]> => {
  const productsRef = collection(firestore, "products"); // Firestore Collection Reference
  const snapshot = await getDocs(productsRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id, // Firestore document ID
    ...doc.data(), // Firestore product data
  })) as Product[];
};

/**
 * 🔹 Get a single product by ID from Firestore
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  const productRef = doc(firestore, "products", id);
  const productSnap = await getDoc(productRef);

  if (productSnap.exists()) {
    return {
      id: productSnap.id,
      ...productSnap.data(),
    } as Product;
  } else {
    return null;
  }
};

/**
 * 🔹 Get products by category from Firestore
 */
export const getProductsByCategory = async (
  category: string
): Promise<Product[]> => {
  const productsRef = collection(firestore, "products");
  const q = query(productsRef, where("category", "==", category));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
};

/**
 * 🔹 Search products by name, description, or category from Firestore
 */
export const searchProducts = async (queryText: string): Promise<Product[]> => {
  const searchTerm = queryText.toLowerCase();
  const allProducts = await fetchProducts(); // Fetch all products first

  return allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
  );
};
