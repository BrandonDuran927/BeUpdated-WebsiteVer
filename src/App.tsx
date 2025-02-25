import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';

// App.tsx
function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              <div className="App">
                <AppRoutes />
              </div>
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;