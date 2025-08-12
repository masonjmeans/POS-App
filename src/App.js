import React, { useState, useEffect } from 'react';

// Main App component
const App = () => {
  // State to hold the list of available products
  const [products, setProducts] = useState([
    { id: 1, name: 'Basic Software License', price: 29.99 },
    { id: 2, name: 'Pro Software License', price: 99.99 },
    { id: 3, name: 'Enterprise Software Suite', price: 249.99 },
    { id: 4, name: 'Installation Service (per hour)', price: 75.00 },
  ]);

  // State to hold items in the current cart/sale
  const [cart, setCart] = useState([]);

  // State for discount and totals
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // New state for user roles: 'admin' or 'employee'
  const [userRole, setUserRole] = useState('employee');

  // New state for admin panel inputs
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  // New states for the PIN login functionality
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Constants for tax rate and currency formatting
  const TAX_RATE = 0.0825; // 8.25% tax rate
  const ADMIN_PIN = '1234'; // The hardcoded PIN for admin access
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  // useEffect hook to re-calculate all totals whenever the cart or discount changes
  useEffect(() => {
    // Calculate the subtotal (sum of all item prices in the cart)
    const newSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Apply the discount to the subtotal
    const discountAmount = newSubtotal * (discount / 100);
    const subtotalAfterDiscount = newSubtotal - discountAmount;

    // Calculate tax on the discounted subtotal
    const newTax = subtotalAfterDiscount * TAX_RATE;

    // Calculate the final total
    const newTotal = subtotalAfterDiscount + newTax;

    // Update the state with the new values
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [cart, discount]); // Dependency array: this effect runs when 'cart' or 'discount' changes

  // Function to add a product to the cart
  const addToCart = (productToAdd) => {
    // Check if the product already exists in the cart
    const existingItem = cart.find(item => item.id === productToAdd.id);

    if (existingItem) {
      // If it exists, update its quantity
      setCart(cart.map(item =>
        item.id === productToAdd.id
          ? { ...item, quantity: item.quantity + 1 } // Increment quantity
          : item
      ));
    } else {
      // If it's a new item, add it with quantity 1
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
    }
  };

  // Function to remove an item or decrease its quantity from the cart
  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        // If new quantity is 0 or less, filter out the item
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean)); // Filter out nulls (items with quantity 0)
  };

  // Function to handle changes in the discount input field
  const handleDiscountChange = (e) => {
    const value = e.target.value;
    // Ensure the value is a number and within a reasonable range (0-100)
    if (value === '' || (!isNaN(value) && value >= 0 && value <= 100)) {
      setDiscount(Number(value));
    }
  };

  // Function to handle the PIN submission
  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setUserRole('admin');
      setShowPinInput(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Please try again.');
      setPinInput(''); // Clear the input for a new attempt
    }
  };

  // Function to clear the entire cart (e.g., after a sale)
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setSubtotal(0);
    setTax(0);
    setTotal(0);
  };

  // Function to add a new product via the admin panel
  const addProduct = () => {
    if (newProductName && newProductPrice > 0) {
      const newProduct = {
        id: products.length + 1,
        name: newProductName,
        price: Number(newProductPrice)
      };
      setProducts([...products, newProduct]);
      setNewProductName('');
      setNewProductPrice('');
    }
  };

  // Function to remove a product via the admin panel
  const removeProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
    setCart(cart.filter(item => item.id !== id));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 font-inter">
      {/* Page Title */}
      <div className="flex justify-between items-center mb-8 mt-4 rounded-lg bg-white bg-opacity-80 p-4 shadow-xl">
        <h1 className="text-4xl font-extrabold text-indigo-800">
          Software POS Stand
        </h1>
        {userRole === 'admin' ? (
          <button
            onClick={() => setUserRole('employee')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200"
          >
            Switch to Employee
          </button>
        ) : (
          <button
            onClick={() => setShowPinInput(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200"
          >
            Switch to Admin
          </button>
        )}
      </div>

      {/* PIN Input Modal */}
      {showPinInput && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-purple-300">
            <h3 className="text-xl font-bold text-purple-700 mb-4">Enter Admin PIN</h3>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePinSubmit(); }}
              className={`w-full p-2 rounded-lg border-2 mb-2 focus:outline-none ${pinError ? 'border-red-500' : 'border-purple-300 focus:ring-2 focus:ring-purple-500'}`}
              placeholder="••••"
            />
            {pinError && <p className="text-red-500 text-sm mb-2">{pinError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handlePinSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
              >
                Submit
              </button>
              <button
                onClick={() => setShowPinInput(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Conditional rendering based on userRole */}
        {userRole === 'admin' ? (
          /* Admin Panel */
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-xl border border-blue-200">
            <h2 className="text-2xl font-bold text-purple-700 mb-5 pb-3 border-b-2 border-purple-300">
              Admin Panel
            </h2>

            {/* Add New Product Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-purple-600 mb-3">Add New Product</h3>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="flex-1 p-2 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  min="0"
                  className="w-full md:w-28 p-2 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={addProduct}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Current Products List */}
            <div>
              <h3 className="text-xl font-semibold text-purple-600 mb-3">Current Products</h3>
              {products.map(product => (
                <div key={product.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-2 shadow-sm border border-gray-200">
                  <div className="flex-1">
                    <p className="font-medium text-purple-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
                  </div>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg shadow-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Employee View: Products Section */
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-xl border border-blue-200">
            <h2 className="text-2xl font-bold text-indigo-700 mb-5 pb-3 border-b-2 border-blue-300">
              Available Software Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-blue-50 p-4 rounded-xl shadow-md flex flex-col justify-between transform transition duration-300 hover:scale-105 hover:shadow-lg border border-blue-200">
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">{product.name}</h3>
                    <p className="text-blue-700 text-xl font-bold">{formatCurrency(product.price)}</p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cart/Sale Section - Visible to both */}
        <div className="w-full lg:w-96 bg-white p-6 rounded-2xl shadow-xl border border-blue-200 flex flex-col">
          <h2 className="text-2xl font-bold text-indigo-700 mb-5 pb-3 border-b-2 border-blue-300">
            Current Sale
          </h2>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center flex-grow flex items-center justify-center">Cart is empty. Add some products!</p>
          ) : (
            <div className="flex-grow overflow-y-auto mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg mb-2 shadow-sm border border-blue-100">
                  <div className="flex-1">
                    <p className="font-medium text-indigo-800">{item.name}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.price)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold shadow-sm"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold text-indigo-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discount and Totals Section */}
          <div className="mt-auto pt-4 border-t-2 border-blue-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-medium text-indigo-900">Subtotal:</span>
              <span className="text-lg font-bold text-indigo-900">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="discount" className="text-lg font-medium text-indigo-900">Discount (%):</label>
              <input
                type="number"
                id="discount"
                value={discount}
                onChange={handleDiscountChange}
                min="0"
                max="100"
                className="w-20 text-lg font-bold text-right px-2 py-1 rounded-lg border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-medium text-indigo-900">Tax ({ (TAX_RATE * 100).toFixed(2) } %):</span>
              <span className="text-lg font-bold text-indigo-900">{formatCurrency(tax)}</span>
            </div>

            <div className="flex justify-between items-center my-4">
              <span className="text-2xl font-bold text-indigo-900">Total:</span>
              <span className="text-3xl font-extrabold text-green-700">{formatCurrency(total)}</span>
            </div>
            
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className={`w-full py-3 px-6 rounded-lg font-bold text-lg shadow-lg transition duration-200 ease-in-out ${
                cart.length === 0
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75'
              }`}
            >
              Process Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; // Export the App component as default
