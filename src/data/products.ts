export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stockQuantity: number;
  colors: string[];
  sizes?: string[];
  category: string;
  imageUrl: string;
  lastUpdated: string;
  isNew?: boolean; // ✅ New property
  discount?: number; // ✅ New property (percentage discount)
  oldPrice?: number; // ✅ New property (original price before discount)
}

export const products: Product[] = [
  {
    id: 1,
    name: "Black T-shirt",
    price: 120,
    description: "A classic black t-shirt, perfect for everyday wear.",
    stockQuantity: 87,
    colors: ["Black"],
    sizes: ["Small", "Medium", "Large"],
    category: "T-shirts",
    imageUrl: "/public/images/products/blackts.png",
    lastUpdated: "February 1, 2025",
  },
  {
    id: 2,
    name: "Go for the B/G T-shirt",
    price: 180,
    description:
      "A stylish blue t-shirt with gold accents, ideal for casual outings.",
    stockQuantity: 86,
    colors: ["Black"],
    sizes: ["Small", "Medium", "Large"],
    category: "T-shirts",
    imageUrl: "/public/images/products/bgts.png",
    lastUpdated: "February 2, 2025",
  },
  {
    id: 3,
    name: "Hydro Coffee",
    price: 249,
    description:
      "A reusable bottle designed for both coffee and water, keeping drinks hot or cold.",
    stockQuantity: 55,
    colors: ["Black", "Blue"],
    category: "Accessories",
    imageUrl: "/public/images/products/hydrocoffee.png",
    lastUpdated: "February 1, 2025",
  },
  {
    id: 4,
    name: "Plastic Water Bottle",
    price: 260,
    description:
      "A lightweight, durable plastic bottle for easy hydration on the go.",
    stockQuantity: 94,
    colors: ["Blue", "Yellow"],
    category: "Accessories",
    imageUrl: "/public/images/products/plasticwaterbottle.png",
    lastUpdated: "January 20, 2025",
  },
  {
    id: 5,
    name: "Sports Bag",
    price: 399,
    description:
      "A spacious bag designed to carry all your sports gear with ease.",
    stockQuantity: 40,
    colors: ["Black", "Blue"],
    category: "Bags",
    imageUrl: "/public/images/products/sportsbag.png",
    lastUpdated: "February 1, 2025",
  },
  {
    id: 6,
    name: "Tote Bag",
    price: 99,
    description:
      "A versatile and sturdy tote bag, great for shopping or daily essentials.",
    stockQuantity: 39,
    colors: ["White"],
    category: "Bags",
    imageUrl: "/public/images/products/totebag.png",
    lastUpdated: "February 3, 2025",
  },
  {
    id: 7,
    name: "Tourism Suit",
    price: 400,
    description:
      "A comfortable and practical suit tailored for travel and outdoor activities.",
    stockQuantity: 200,
    colors: ["Default"],
    sizes: ["Small", "Medium", "Large"],
    category: "Uniforms",
    imageUrl: "/public/images/products/tourismsuit.png",
    lastUpdated: "February 4, 2025",
  },
  {
    id: 8,
    name: "Traditional Polo for Female",
    price: 300,
    description:
      "A traditional outfit for women, blending cultural elegance with modern comfort.",
    stockQuantity: 295,
    colors: ["Default"],
    sizes: ["Small", "Medium", "Large"],
    category: "Uniforms",
    imageUrl: "/public/images/products/traditionalunif.png",
    lastUpdated: "February 4, 2025",
  },
  {
    id: 9,
    name: "Traditional Female Polo for SHS",
    price: 300,
    description:
      "A shorter version of the traditional female outfit, perfect for casual occasions.",
    stockQuantity: 299,
    colors: ["Default"],
    sizes: ["Small", "Medium", "Large"],
    category: "Uniforms",
    imageUrl: "/public/images/products/traditionalmaleshs.png",
    lastUpdated: "February 4, 2025",
  },
  {
    id: 10,
    name: "Traditional Polo for Male",
    price: 300,
    description:
      "A timeless traditional outfit for men, combining style and cultural heritage.",
    stockQuantity: 349,
    colors: ["Default"],
    sizes: ["Small", "Medium", "Large"],
    category: "Uniforms",
    imageUrl: "/public/images/products/traditionalunif.png",
    lastUpdated: "February 4, 2025",
  },
  {
    id: 11,
    name: "Traditional Male Polo for SHS",
    price: 300,
    description:
      "A shorter, more relaxed version of the traditional male outfit.",
    stockQuantity: 150,
    colors: ["Default"],
    sizes: ["Small", "Medium", "Large"],
    category: "Uniforms",
    imageUrl: "/public/images/products/traditionalmaleshs.png",
    lastUpdated: "February 4, 2025",
  },
  {
    id: 12,
    name: "Tumbler",
    price: 299,
    description:
      "A durable tumbler that keeps your drinks at the right temperature for hours.",
    stockQuantity: 113,
    colors: ["Black", "Blue", "Gray", "White"],
    category: "Accessories",
    imageUrl: "/public/images/products/tumbler.png",
    lastUpdated: "February 5, 2025",
  },
  {
    id: 13,
    name: "White T-shirt",
    price: 120,
    description:
      "A crisp white t-shirt, a wardrobe essential for any occasion.",
    stockQuantity: 123,
    colors: ["White"],
    sizes: ["Small", "Medium", "Large"],
    category: "T-shirts",
    imageUrl: "/public/images/products/whitets.png",
    lastUpdated: "February 1, 2025",
  },
];

export const getProductById = (id: number): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((product) => product.category === category);
};

export const searchProducts = (query: string): Product[] => {
  const searchTerm = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
  );
};
