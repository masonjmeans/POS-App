import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, Timestamp, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ShoppingCart, X, PlusCircle, MinusCircle, Send, Trash2, Settings, ArrowLeft, Plus, Edit, Save, Eraser, LogIn, LogOut, Users, Store, Utensils } from 'lucide-react';

// Admin Panel Component with new features
const AdminPanel = ({ setShowAdminPanel, db, appId, menuItems, employees, settings, refreshData }) => {
  // Menu Item Management States
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Main' });
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Employee Management States
  const [newEmployee, setNewEmployee] = useState({ username: '', password: '' });
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showEmployeeConfirmModal, setShowEmployeeConfirmModal] = useState(false);

  // Business Settings States
  const [businessSettings, setBusinessSettings] = useState(settings);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingItem(prev => ({ ...prev, [prev.id === 'new' ? 'id' : name]: value }));
  };

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setBusinessSettings(prev => ({ ...prev, [name]: value }));
  };

  // Add/Update/Delete Menu Items
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name && newItem.price) {
      try {
        const itemToAdd = {
          name: newItem.name,
          price: parseFloat(newItem.price),
          category: newItem.category,
        };
        await addDoc(collection(db, `artifacts/${appId}/public/data/menuItems`), itemToAdd);
        setNewItem({ name: '', price: '', category: 'Main' });
        console.log("New menu item added.");
      } catch (error) {
        console.error("Error adding menu item:", error);
      }
    }
  };

  const startEditing = (item) => {
    setEditingItem({ ...item });
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  const updateItem = async (e) => {
    e.preventDefault();
    if (editingItem) {
      try {
        const itemRef = doc(db, `artifacts/${appId}/public/data/menuItems`, editingItem.id);
        await setDoc(itemRef, {
          name: editingItem.name,
          price: parseFloat(editingItem.price),
          category: editingItem.category
        }, { merge: true });
        setEditingItem(null);
        console.log("Menu item updated.");
      } catch (error) {
        console.error("Error updating menu item:", error);
      }
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/menuItems`, itemToDelete.id));
        console.log("Menu item deleted.");
      } catch (error) {
        console.error("Error deleting menu item:", error);
      } finally {
        setShowConfirmModal(false);
        setItemToDelete(null);
      }
    }
  };
  
  // Add/Delete Employees
  const addEmployee = async (e) => {
    e.preventDefault();
    if (newEmployee.username && newEmployee.password) {
      try {
        // In a real app, you would hash the password before saving
        await addDoc(collection(db, `artifacts/${appId}/public/data/employees`), newEmployee);
        setNewEmployee({ username: '', password: '' });
        refreshData(); // Refresh the employee list
        console.log("New employee added.");
      } catch (error) {
        console.error("Error adding employee:", error);
      }
    }
  };

  const handleDeleteEmployeeClick = (employee) => {
    setEmployeeToDelete(employee);
    setShowEmployeeConfirmModal(true);
  };

  const confirmEmployeeDelete = async () => {
    if (employeeToDelete) {
      try {
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/employees`, employeeToDelete.id));
        refreshData(); // Refresh the employee list
        console.log("Employee deleted.");
      } catch (error) {
        console.error("Error deleting employee:", error);
      } finally {
        setShowEmployeeConfirmModal(false);
        setEmployeeToDelete(null);
      }
    }
  };

  // Update Business Settings
  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      const settingsRef = doc(db, `artifacts/${appId}/public/data/settings`, 'business');
      await setDoc(settingsRef, businessSettings, { merge: true });
      console.log("Business settings updated.");
      refreshData(); // Refresh main app with new settings
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-10 bg-gray-900 text-white font-inter min-h-screen relative">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setShowAdminPanel(false)}
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-teal-400">Admin Controls</h1>
      </div>

      {/* Business Settings Section */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-200 mb-4 border-b pb-2 border-gray-700 flex items-center gap-2">
          <Settings size={24} />
          Business Settings
        </h2>
        <form onSubmit={saveSettings} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={businessSettings.businessName}
              onChange={handleSettingsChange}
              placeholder="Business Name"
              required
              className="w-full bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Color Theme</label>
            <select
              name="colorTheme"
              value={businessSettings.colorTheme}
              onChange={handleSettingsChange}
              className="w-full bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="teal">Teal</option>
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-2">App Type</label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setBusinessSettings(prev => ({ ...prev, appType: 'Restaurant' }))}
                className={`flex-1 flex items-center justify-center p-3 rounded-lg transition ${businessSettings.appType === 'Restaurant' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                <Utensils className="mr-2" />
                Restaurant
              </button>
              <button
                type="button"
                onClick={() => setBusinessSettings(prev => ({ ...prev, appType: 'Business' }))}
                className={`flex-1 flex items-center justify-center p-3 rounded-lg transition ${businessSettings.appType === 'Business' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                <Store className="mr-2" />
                Business
              </button>
            </div>
          </div>
          <button type="submit" className="w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 bg-teal-600 hover:bg-teal-700 text-white shadow-lg">
            <Save className="mr-2" />
            Save Settings
          </button>
        </form>
      </div>

      {/* Menu Item Management Section */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-200 mb-4 border-b pb-2 border-gray-700 flex items-center gap-2">
          <Utensils size={24} />
          Menu Item Management
        </h2>
        <form onSubmit={addItem} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" name="name" value={newItem.name} onChange={handleInputChange} placeholder="Item Name" required className="bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input type="number" name="price" value={newItem.price} onChange={handleInputChange} placeholder="Price" step="0.01" required className="bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <select name="category" value={newItem.category} onChange={handleInputChange} className="bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="Main">Main</option>
              <option value="Side">Side</option>
              <option value="Drink">Drink</option>
            </select>
          </div>
          <button type="submit" className="w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 bg-teal-600 hover:bg-teal-700 text-white shadow-lg">
            <Plus className="mr-2" />
            Add Menu Item
          </button>
        </form>
        {menuItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No menu items found. Add some above!</p>
        ) : (
          <div className="space-y-3">
            {menuItems.map(item => (
              <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md">
                {editingItem?.id === item.id ? (
                  <form onSubmit={updateItem} className="flex flex-col md:flex-row items-center justify-between w-full gap-2">
                    <div className="flex-1 flex flex-col md:flex-row gap-2 w-full">
                      <input type="text" name="name" value={editingItem.name} onChange={handleEditChange} className="bg-gray-600 text-white p-2 rounded-lg flex-1" required />
                      <input type="number" name="price" value={editingItem.price} onChange={handleEditChange} step="0.01" className="bg-gray-600 text-white p-2 rounded-lg w-24" required />
                      <select name="category" value={editingItem.category} onChange={handleEditChange} className="bg-gray-600 text-white p-2 rounded-lg">
                        <option value="Main">Main</option>
                        <option value="Side">Side</option>
                        <option value="Drink">Drink</option>
                      </select>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2 mt-2 md:mt-0">
                      <button type="submit" className="p-2 rounded-full bg-green-600 hover:bg-green-700 transition">
                        <Save size={20} />
                      </button>
                      <button type="button" onClick={cancelEditing} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition">
                        <Eraser size={20} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-200">{item.name}</h3>
                      <p className="text-sm text-gray-400">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                      <span className="text-xl font-bold text-green-400">${item.price.toFixed(2)}</span>
                      <button onClick={() => startEditing(item)} className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDeleteClick(item)} className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Employee Management Section */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-200 mb-4 border-b pb-2 border-gray-700 flex items-center gap-2">
          <Users size={24} />
          Employee Management
        </h2>
        <form onSubmit={addEmployee} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="username" value={newEmployee.username} onChange={handleEmployeeChange} placeholder="Username" required className="bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input type="password" name="password" value={newEmployee.password} onChange={handleEmployeeChange} placeholder="Password" required className="bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <button type="submit" className="w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 bg-teal-600 hover:bg-teal-700 text-white shadow-lg">
            <Plus className="mr-2" />
            Add Employee
          </button>
        </form>
        {employees.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No employees found. Add one above!</p>
        ) : (
          <div className="space-y-3">
            {employees.map(employee => (
              <div key={employee.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md">
                <span className="text-lg font-semibold text-gray-200">{employee.username}</span>
                <button onClick={() => handleDeleteEmployeeClick(employee)} className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-200 mb-4">Confirm Deletion</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition">Delete</button>
            </div>
          </div>
        </div>
      )}
      
      {showEmployeeConfirmModal && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-200 mb-4">Confirm Employee Deletion</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete employee "{employeeToDelete?.username}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEmployeeConfirmModal(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 transition">Cancel</button>
              <button onClick={confirmEmployeeDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Employee Sign-in Screen
const SignInScreen = ({ handleSignIn, signInError, setShowLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSignIn(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white font-inter">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-sm w-full">
        <div className="flex flex-col items-center mb-6">
          <LogIn size={48} className="text-teal-400 mb-4" />
          <h2 className="text-3xl font-bold text-teal-400">Employee Sign In</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
          {signInError && <p className="text-red-400 text-sm text-center">{signInError}</p>}
          <button type="submit" className="w-full mt-4 flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 bg-teal-600 hover:bg-teal-700 text-white shadow-lg">Sign In</button>
          
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="w-full mt-2 flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 bg-gray-600 hover:bg-gray-700 text-white shadow-lg"
          >
            <Settings className="mr-2" />
            Admin
          </button>
        </form>
      </div>
    </div>
  );
};

const PosStand = () => {
  const [order, setOrder] = useState([]);
  const [db, setDb] = useState(null);
  const [appId, setAppId] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Data from Firestore
  const [menuItems, setMenuItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [settings, setSettings] = useState({
    businessName: 'My Business',
    colorTheme: 'teal',
    appType: 'Restaurant',
  });

  // State for employee sign-in
  const [isEmployeeSignedIn, setIsEmployeeSignedIn] = useState(false);
  const [signInError, setSignInError] = useState('');
  
  // State for password-protected admin access
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const adminPassword = 'Means';

  // Combined Effect to initialize Firebase and fetch all data
  useEffect(() => {
    console.log("Starting Firebase initialization and data fetching...");
    
    if (typeof __firebase_config === 'undefined' || typeof __app_id === 'undefined') {
      console.error('Firebase configuration and app ID are not defined.');
      setLoading(false);
      return;
    }
    
    let unsubscribeMenu = () => {};
    let unsubscribeEmployees = () => {};
    let unsubscribeSettings = () => {};

    try {
      const firebaseConfig = JSON.parse(__firebase_config);
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const auth = getAuth(app);
      setDb(firestore);
      setAppId(__app_id);
      
      const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          try {
            console.log("No user found, signing in anonymously...");
            if (typeof __initial_auth_token !== 'undefined') {
              await signInWithCustomToken(auth, __initial_auth_token);
            } else {
              await signInAnonymously(auth);
            }
            console.log("Anonymous sign-in successful.");
          } catch (error) {
            console.error('Error during anonymous sign-in:', error);
            setLoading(false);
            return;
          }
        }
        
        console.log("Auth state changed. User is authenticated. Starting data listeners...");
        // After auth is confirmed, set up Firestore listeners
        
        const menuRef = collection(firestore, `artifacts/${__app_id}/public/data/menuItems`);
        unsubscribeMenu = onSnapshot(menuRef, (snapshot) => {
          const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMenuItems(fetchedItems);
          console.log(`Fetched ${fetchedItems.length} menu items.`);
        }, (error) => {
          console.error("Error fetching menu items:", error);
        });

        const employeesRef = collection(firestore, `artifacts/${__app_id}/public/data/employees`);
        unsubscribeEmployees = onSnapshot(employeesRef, (snapshot) => {
          const fetchedEmployees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEmployees(fetchedEmployees);
          console.log(`Fetched ${fetchedEmployees.length} employees.`);
        }, (error) => {
          console.error("Error fetching employees:", error);
        });

        const settingsRef = doc(firestore, `artifacts/${__app_id}/public/data/settings`, 'business');
        unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
          if (docSnap.exists()) {
            const fetchedSettings = docSnap.data();
            setSettings(fetchedSettings);
            console.log("Fetched business settings.");
          } else {
            console.log("No business settings found, creating with defaults.");
            setDoc(settingsRef, settings); // Create default settings if none exist
          }
        }, (error) => {
          console.error("Error fetching settings:", error);
        });

        // All listeners are set up. We can now stop the loading state.
        setLoading(false);
      });

      return () => {
        console.log("Cleaning up Firebase listeners...");
        authUnsubscribe();
        unsubscribeMenu();
        unsubscribeEmployees();
        unsubscribeSettings();
      };
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      setLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once

  // Function to refresh data - useful for admin panel actions
  const refreshData = () => {
    // This is handled by onSnapshot listeners, but a function is needed for the AdminPanel prop
    console.log("Refresh data requested. Listeners will update automatically.");
  };

  // Handle employee sign-in
  const handleEmployeeSignIn = async (username, password) => {
    const employee = employees.find(emp => emp.username === username && emp.password === password);
    if (employee) {
      setIsEmployeeSignedIn(true);
      setSignInError('');
    } else {
      setSignInError('Invalid username or password.');
    }
  };

  const handleEmployeeSignOut = () => {
      setIsEmployeeSignedIn(false);
      setOrder([]);
  };

  // Handle password submission for admin access
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (password === adminPassword) {
      setShowLogin(false);
      setShowAdminPanel(true);
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('Invalid password. Please try again.');
    }
  };

  // Function to add or update an item in the current order
  const addItemToOrder = (item) => {
    setOrder(prevOrder => {
      const existingItemIndex = prevOrder.findIndex(orderItem => orderItem.id === item.id);
      if (existingItemIndex > -1) {
        const newOrder = [...prevOrder];
        const updatedItem = { ...newOrder[existingItemIndex], quantity: newOrder[existingItemIndex].quantity + 1 };
        newOrder.splice(existingItemIndex, 1, updatedItem);
        return newOrder;
      } else {
        return [...prevOrder, { ...item, quantity: 1 }];
      }
    });
  };

  // Function to change the quantity of an item
  const updateItemQuantity = (itemId, change) => {
    setOrder(prevOrder => {
      const newOrder = prevOrder.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0);
      return newOrder;
    });
  };

  // Function to remove an item from the order
  const removeItemFromOrder = (itemId) => {
    setOrder(prevOrder => prevOrder.filter(item => item.id !== itemId));
  };

  // Function to clear the entire order
  const clearOrder = () => {
    setOrder([]);
  };

  // Function to send the order to the kitchen (save to Firestore)
  const sendOrderToKitchen = async () => {
    if (!db || order.length === 0) {
      console.log('No order to send or database not initialized.');
      return;
    }

    const tableNumber = Math.floor(Math.random() * 100) + 1;

    const newOrder = {
      tableNumber,
      items: order,
      status: 'pending',
      timestamp: Timestamp.now(),
    };

    try {
      const docRef = await addDoc(collection(db, `artifacts/${appId}/public/data/orders`), newOrder);
      console.log('Order sent to kitchen with ID:', docRef.id);
      clearOrder();
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const subtotal = order.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Set theme class based on settings
  const themeClass = {
    'teal': 'bg-teal-600 hover:bg-teal-700',
    'blue': 'bg-blue-600 hover:bg-blue-700',
    'purple': 'bg-purple-600 hover:bg-purple-700'
  }[settings.colorTheme];
  const highlightClass = {
    'teal': 'text-teal-400',
    'blue': 'text-blue-400',
    'purple': 'text-purple-400'
  }[settings.colorTheme];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-teal-400">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-xl">Loading POS...</p>
        </div>
      </div>
    );
  }

  // Conditional rendering for Admin Panel
  if (showAdminPanel) {
    return <AdminPanel setShowAdminPanel={setShowAdminPanel} db={db} appId={appId} menuItems={menuItems} employees={employees} settings={settings} refreshData={refreshData} />;
  }
  
  // Conditional rendering for Login Screen
  if (showLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white font-inter">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-sm w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${highlightClass}`}>Admin Login</h2>
            <button onClick={() => setShowLogin(false)} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"><X size={24} /></button>
          </div>
          <form onSubmit={handleAdminLogin}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className={`w-full bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-${settings.colorTheme}-500`} />
            {loginError && <p className="text-red-400 text-sm mt-2">{loginError}</p>}
            <button type="submit" className={`w-full mt-4 flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 ${themeClass} text-white shadow-lg`}>
              <Settings className="mr-2" />
              Unlock Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show employee sign-in screen if not signed in
  if (!isEmployeeSignedIn) {
    return <SignInScreen handleSignIn={handleEmployeeSignIn} signInError={signInError} setShowLogin={setShowLogin} />;
  }

  return (
    <div className={`flex min-h-screen bg-gray-900 text-white font-inter theme-${settings.colorTheme}`}>
      {/* Main Menu Area */}
      <div className="flex-1 p-6 lg:p-10">
        <h1 className={`text-4xl lg:text-5xl font-extrabold ${highlightClass} mb-6`}>
          {settings.businessName}
        </h1>
        <p className="text-xl text-gray-400 mb-8">{settings.appType} POS Stand</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => addItemToOrder(item)} className="bg-gray-800 p-4 rounded-xl shadow-lg hover:bg-gray-700 transition duration-200 ease-in-out transform hover:scale-105 border border-gray-700 flex flex-col justify-between">
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-200">{item.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{item.category}</p>
              </div>
              <p className="text-right text-3xl font-black text-green-400 mt-2">${item.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="w-full lg:w-1/3 bg-gray-800 p-6 lg:p-8 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-3xl lg:text-4xl font-extrabold ${highlightClass}`}>
            <ShoppingCart className="inline-block mr-2" />
            Current Order
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowLogin(true)} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition" aria-label="Open Admin Controls">
              <Settings size={24} className="text-gray-400" />
            </button>
            <button onClick={handleEmployeeSignOut} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition" aria-label="Sign Out">
              <LogOut size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 pr-2">
          {order.length === 0 ? (
            <div className="text-center text-gray-500 text-lg py-12">
              <p>Your order is empty.</p>
              <p>Add items from the menu!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {order.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg shadow-md">
                  <div className="flex items-center space-x-3">
                    <button onClick={() => removeItemFromOrder(item.id)} className="text-red-400 hover:text-red-500 transition"><X size={18} /></button>
                    <span className="text-lg font-semibold">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-600 rounded-md">
                      <button onClick={() => updateItemQuantity(item.id, -1)} className="px-2 py-1 text-gray-400 hover:text-white transition"><MinusCircle size={20} /></button>
                      <span className="px-2 text-xl font-bold">{item.quantity}</span>
                      <button onClick={() => updateItemQuantity(item.id, 1)} className="px-2 py-1 text-gray-400 hover:text-white transition"><PlusCircle size={20} /></button>
                    </div>
                    <span className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-600 pt-6 space-y-2">
          <div className="flex justify-between text-xl font-medium text-gray-300"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-xl font-medium text-gray-300"><span>Tax (8%):</span><span>${tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-4xl font-extrabold text-green-400 mt-4"><span>Total:</span><span>${total.toFixed(2)}</span></div>
        </div>

        <div className="mt-6 space-y-4">
          <button onClick={sendOrderToKitchen} disabled={order.length === 0} className={`w-full flex items-center justify-center font-bold py-4 px-6 rounded-lg transition duration-200 ${order.length > 0 ? `${themeClass} text-white shadow-lg` : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
            <Send className="mr-2" />
            Send to Kitchen
          </button>
          <button onClick={clearOrder} disabled={order.length === 0} className={`w-full flex items-center justify-center font-bold py-4 px-6 rounded-lg transition duration-200 ${order.length > 0 ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
            <Trash2 className="mr-2" />
            Clear Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosStand;
