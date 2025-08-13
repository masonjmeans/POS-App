import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, Timestamp, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { PlusCircle, MinusCircle, Send, Trash2, Settings, ArrowLeft, Plus, Edit, Save, Eraser, LogIn, LogOut, Users, Store, Utensils, Palette, Sun, Moon, Lock } from 'lucide-react';

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

  // Available colors for the theme
  const themeColors = ['teal', 'blue', 'purple', 'green', 'red', 'yellow', 'orange', 'indigo', 'rose'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingItem(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setBusinessSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeModeChange = (isDarkMode) => {
    setBusinessSettings(prev => ({ ...prev, isDarkMode }));
  };

  // --- FIXED: ADD/UPDATE MENU ITEMS LOGIC ---
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name && newItem.price) {
      try {
        const itemToAdd = {
          name: newItem.name,
          price: parseFloat(newItem.price),
          category: newItem.category,
        };
        // Use addDoc to add a new document to the menuItems collection
        await addDoc(collection(db, `artifacts/${appId}/public/data/menuItems`), itemToAdd);
        // Reset the form input fields after successful submission
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
  
  // --- FIXED: ADD EMPLOYEE LOGIC ---
  const addEmployee = async (e) => {
    e.preventDefault();
    if (newEmployee.username && newEmployee.password) {
      try {
        // Use addDoc to add a new document to the employees collection
        await addDoc(collection(db, `artifacts/${appId}/public/data/employees`), newEmployee);
        // Reset the form input fields after successful submission
        setNewEmployee({ username: '', password: '' });
        console.log("New employee added successfully.");
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
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };
  
  // Determine text and background colors based on dark mode
  const isDarkMode = businessSettings.isDarkMode;
  const bgColorClass = isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800';
  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const cardHoverClass = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const inputClass = isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600 focus:ring-teal-500' : 'bg-gray-200 text-gray-800 border-gray-300 focus:ring-teal-500';

  const primaryBtnClass = `bg-${businessSettings.primaryColor}-${isDarkMode ? '600' : '500'} hover:bg-${businessSettings.primaryColor}-${isDarkMode ? '700' : '600'} text-white shadow-lg`;
  const primaryTextClass = `text-${businessSettings.primaryColor}-${isDarkMode ? '400' : '600'}`;

  const secondaryBtnClass = isDarkMode ? `bg-gray-700 hover:bg-gray-600 text-white` : `bg-gray-300 hover:bg-gray-400 text-gray-800`;
  const secondaryTextClass = isDarkMode ? `text-gray-400` : `text-gray-600`;

  return (
    <div className={`flex-1 p-6 lg:p-10 font-inter min-h-screen relative ${bgColorClass} transition-colors duration-500`}>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setShowAdminPanel(false)}
          className={`p-3 rounded-full ${cardBgClass} ${cardHoverClass} transition`}
        >
          <ArrowLeft size={24} className={secondaryTextClass} />
        </button>
        <h1 className={`text-4xl lg:text-5xl font-extrabold ${primaryTextClass}`}>Admin Controls</h1>
      </div>

      {/* Theme Settings Section */}
      <div className={`${cardBgClass} p-8 rounded-xl shadow-lg mb-8`}>
        <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${borderClass} flex items-center gap-2 ${primaryTextClass}`}>
          <Palette size={24} />
          Theme Settings
        </h2>
        <form onSubmit={saveSettings} className="space-y-4">
          {/* Light/Dark Mode Toggle */}
          <div>
            <label className={`${secondaryTextClass} block mb-2`}>App Mode</label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleThemeModeChange(false)}
                className={`flex-1 flex items-center justify-center p-3 rounded-lg transition ${!businessSettings.isDarkMode ? primaryBtnClass : secondaryBtnClass}`}
              >
                <Sun className="mr-2" />
                Light Mode
              </button>
              <button
                type="button"
                onClick={() => handleThemeModeChange(true)}
                className={`flex-1 flex items-center justify-center p-3 rounded-lg transition ${businessSettings.isDarkMode ? primaryBtnClass : secondaryBtnClass}`}
              >
                <Moon className="mr-2" />
                Dark Mode
              </button>
            </div>
          </div>
          {/* Primary Color Picker */}
          <div>
            <label className={`${secondaryTextClass} block mb-2`}>Primary Color</label>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {themeColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBusinessSettings(prev => ({ ...prev, primaryColor: color }))}
                  className={`p-4 rounded-lg transition duration-200 ${businessSettings.primaryColor === color ? `bg-${color}-500 text-white ring-2 ring-${color}-400` : `bg-${color}-300 hover:bg-${color}-400`}`}
                />
              ))}
            </div>
          </div>
          {/* Secondary Color Picker */}
          <div>
            <label className={`${secondaryTextClass} block mb-2`}>Secondary Color</label>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {themeColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBusinessSettings(prev => ({ ...prev, secondaryColor: color }))}
                  className={`p-4 rounded-lg transition duration-200 ${businessSettings.secondaryColor === color ? `bg-${color}-500 text-white ring-2 ring-${color}-400` : `bg-${color}-300 hover:bg-${color}-400`}`}
                />
              ))}
            </div>
          </div>
          <button type="submit" className={`w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 ${primaryBtnClass}`}>
            <Save className="mr-2" />
            Save Settings
          </button>
        </form>
      </div>

      {/* Business Settings Section */}
      <div className={`${cardBgClass} p-8 rounded-xl shadow-lg mb-8`}>
        <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${borderClass} flex items-center gap-2 ${primaryTextClass}`}>
          <Settings size={24} />
          Business Settings
        </h2>
        <form onSubmit={saveSettings} className="space-y-4">
          <div>
            <label className={`${secondaryTextClass} block mb-2`}>Business Name</label>
            <input
              type="text"
              name="businessName"
              value={businessSettings.businessName}
              onChange={handleSettingsChange}
              placeholder="Business Name"
              required
              className={`w-full p-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2`}
            />
          </div>
          <div>
            <label className={`${secondaryTextClass} block mb-2`}>App Type</label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setBusinessSettings(prev => ({ ...prev, appType: 'Restaurant' }))}
                className={`flex-1 flex items-center justify-center p-3 rounded-lg transition ${businessSettings.appType === 'Restaurant' ? primaryBtnClass : secondaryBtnClass}`}
              >
                <Utensils className="mr-2" />
                Restaurant
              </button>
              <button
                type="button"
                onClick={() => setBusinessSettings(prev => ({ ...prev, appType: 'Business' }))}
                className={`flex-1 flex items-center justify-center p-3 rounded-lg transition ${businessSettings.appType === 'Business' ? primaryBtnClass : secondaryBtnClass}`}
              >
                <Store className="mr-2" />
                Business
              </button>
            </div>
          </div>
          <button type="submit" className={`w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 ${primaryBtnClass}`}>
            <Save className="mr-2" />
            Save Settings
          </button>
        </form>
      </div>

      {/* Menu Item Management Section */}
      <div className={`${cardBgClass} p-8 rounded-xl shadow-lg mb-8`}>
        <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${borderClass} flex items-center gap-2 ${primaryTextClass}`}>
          <Utensils size={24} />
          Menu Item Management
        </h2>
        {/* The form's onSubmit event is now properly linked to addItem */}
        <form onSubmit={addItem} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" name="name" value={newItem.name} onChange={handleInputChange} placeholder="Item Name" required className={`p-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2`} />
            <input type="number" name="price" value={newItem.price} onChange={handleInputChange} placeholder="Price" step="0.01" required className={`p-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2`} />
            <select name="category" value={newItem.category} onChange={handleInputChange} className={`p-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2`}>
              <option value="Main">Main</option>
              <option value="Side">Side</option>
              <option value="Drink">Drink</option>
            </select>
          </div>
          <button type="submit" className={`w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 ${primaryBtnClass}`}>
            <Plus className="mr-2" />
            Add Menu Item
          </button>
        </form>
        {menuItems.length === 0 ? (
          <p className={`${secondaryTextClass} text-center py-4`}>No menu items found. Add some above!</p>
        ) : (
          <div className="space-y-3">
            {menuItems.map(item => (
              <div key={item.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between ${secondaryBtnClass} p-4 rounded-lg shadow-md`}>
                {editingItem?.id === item.id ? (
                  <form onSubmit={updateItem} className="flex flex-col md:flex-row items-center justify-between w-full gap-2">
                    <div className="flex-1 flex flex-col md:flex-row gap-2 w-full">
                      <input type="text" name="name" value={editingItem.name} onChange={handleEditChange} className={`p-2 rounded-lg flex-1 ${inputClass}`} required />
                      <input type="number" name="price" value={editingItem.price} onChange={handleEditChange} step="0.01" className={`p-2 rounded-lg w-24 ${inputClass}`} required />
                      <select name="category" value={editingItem.category} onChange={handleEditChange} className={`p-2 rounded-lg ${inputClass}`}>
                        <option value="Main">Main</option>
                        <option value="Side">Side</option>
                        <option value="Drink">Drink</option>
                      </select>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2 mt-2 md:mt-0">
                      <button type="submit" className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition">
                        <Save size={20} />
                      </button>
                      <button type="button" onClick={cancelEditing} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition">
                        <Eraser size={20} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-sm">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                      <span className="text-xl font-bold text-green-400">${item.price.toFixed(2)}</span>
                      <button onClick={() => startEditing(item)} className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDeleteClick(item)} className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition">
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
      <div className={`${cardBgClass} p-8 rounded-xl shadow-lg`}>
        <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${borderClass} flex items-center gap-2 ${primaryTextClass}`}>
          <Users size={24} />
          Employee Management
        </h2>
        {/* The form's onSubmit event is now properly linked to addEmployee */}
        <form onSubmit={addEmployee} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="username" value={newEmployee.username} onChange={handleEmployeeChange} placeholder="Username" required className={`p-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2`} />
            <input type="password" name="password" value={newEmployee.password} onChange={handleEmployeeChange} placeholder="Password" required className={`p-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2`} />
          </div>
          <button type="submit" className={`w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 ${primaryBtnClass}`}>
            <Plus className="mr-2" />
            Add Employee
          </button>
        </form>
        {employees.length === 0 ? (
          <p className={`${secondaryTextClass} text-center py-4`}>No employees found. Add one above!</p>
        ) : (
          <div className="space-y-3">
            {employees.map(employee => (
              <div key={employee.id} className={`flex items-center justify-between ${secondaryBtnClass} p-4 rounded-lg shadow-md`}>
                <span className="text-lg font-semibold">{employee.username}</span>
                <button onClick={() => handleDeleteEmployeeClick(employee)} className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className={`p-6 rounded-xl shadow-2xl max-w-sm w-full ${cardBgClass}`}>
            <h3 className={`text-xl font-bold mb-4 ${primaryTextClass}`}>Confirm Deletion</h3>
            <p className={`mb-6 ${secondaryTextClass}`}>Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowConfirmModal(false)} className={`px-4 py-2 rounded-lg ${secondaryBtnClass}`}>Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition">Delete</button>
            </div>
          </div>
        </div>
      )}
      
      {showEmployeeConfirmModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className={`p-6 rounded-xl shadow-2xl max-w-sm w-full ${cardBgClass}`}>
            <h3 className={`text-xl font-bold mb-4 ${primaryTextClass}`}>Confirm Employee Deletion</h3>
            <p className={`mb-6 ${secondaryTextClass}`}>Are you sure you want to delete employee "{employeeToDelete?.username}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEmployeeConfirmModal(false)} className={`px-4 py-2 rounded-lg ${secondaryBtnClass}`}>Cancel</button>
              <button onClick={confirmEmployeeDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Employee Sign-in Screen
const SignInScreen = ({ handleSignIn, signInError, setShowLogin, settings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSignIn(username, password);
  };
  
  // Determine text and background colors based on dark mode
  const isDarkMode = settings.isDarkMode;
  const bgColorClass = isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800';
  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const inputClass = isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600 focus:ring-teal-500' : 'bg-gray-200 text-gray-800 border-gray-300 focus:ring-teal-500';

  const primaryBtnClass = `bg-${settings.primaryColor}-${isDarkMode ? '600' : '500'} hover:bg-${settings.primaryColor}-${isDarkMode ? '700' : '600'} text-white shadow-lg`;
  const primaryTextClass = `text-${settings.primaryColor}-${isDarkMode ? '400' : '600'}`;
  const secondaryBtnClass = isDarkMode ? `bg-gray-700 hover:bg-gray-600 text-white` : `bg-gray-300 hover:bg-gray-400 text-gray-800`;

  return (
    <div className={`flex items-center justify-center min-h-screen font-inter transition-colors duration-500 ${bgColorClass}`}>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className={`p-8 rounded-xl shadow-lg max-w-sm w-full ${cardBgClass}`}>
        <div className="flex flex-col items-center mb-6">
          <LogIn size={48} className={`mb-4 ${primaryTextClass}`} />
          <h2 className={`text-3xl font-bold ${primaryTextClass}`}>{settings.businessName}</h2>
          <h3 className={`text-xl font-bold ${primaryTextClass}`}>Employee Sign In</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 ${inputClass}`} required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 ${inputClass}`} required />
          {signInError && <p className="text-red-400 text-sm text-center">{signInError}</p>}
          <button type="submit" className={`w-full mt-4 flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 ${primaryBtnClass}`}>Sign In</button>
          
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className={`w-full mt-2 flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 ${secondaryBtnClass}`}
          >
            <Settings className="mr-2" />
            Admin
          </button>
        </form>
      </div>
    </div>
  );
};

// Main Point of Sale Stand Application
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
    isDarkMode: false,
    primaryColor: 'teal',
    secondaryColor: 'gray',
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
  const adminPassword = 'Means'; // This is a placeholder for a real admin password

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

    const DEFAULT_SETTINGS = {
        businessName: 'My Business',
        isDarkMode: false,
        primaryColor: 'teal',
        secondaryColor: 'gray',
        appType: 'Restaurant',
    };

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
            setDoc(settingsRef, DEFAULT_SETTINGS); // Create default settings if none exist
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
  }, []);

  // Function to refresh data - this is handled by onSnapshot, but included for clarity
  const refreshData = () => {
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

    const newOrder = {
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
  
  // Dynamic class helpers based on settings
  const theme = {
    isDarkMode: settings.isDarkMode,
    primary: settings.primaryColor,
    secondary: settings.secondaryColor
  };

  const primaryBtn = `bg-${theme.primary}-${theme.isDarkMode ? '600' : '500'} hover:bg-${theme.primary}-${theme.isDarkMode ? '700' : '600'} text-white shadow-lg`;
  const primaryText = `text-${theme.primary}-${theme.isDarkMode ? '400' : '600'}`;
  const secondaryBtn = `bg-${theme.secondary}-${theme.isDarkMode ? '700' : '300'} hover:bg-${theme.secondary}-${theme.isDarkMode ? '600' : '400'} text-${theme.isDarkMode ? 'white' : 'gray-800'}`;
  const cardBgClass = theme.isDarkMode ? 'bg-gray-800' : 'bg-white';
  const borderClass = theme.isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const inputClass = theme.isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-200 text-gray-800 border-gray-300';
  const bgColorClass = theme.isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800';

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${bgColorClass}`}>
        <div className="text-xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  // --- Rendering Logic ---
  // If the admin panel is visible, show it.
  if (showAdminPanel) {
    return (
      <AdminPanel
        setShowAdminPanel={setShowAdminPanel}
        db={db}
        appId={appId}
        menuItems={menuItems}
        employees={employees}
        settings={settings}
        refreshData={refreshData}
      />
    );
  }
  
  // If the admin login screen is visible, show it.
  if (showLogin) {
    return (
      <div className={`flex items-center justify-center min-h-screen font-inter transition-colors duration-500 ${bgColorClass}`}>
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
        `}</style>
        <div className={`p-8 rounded-xl shadow-lg max-w-sm w-full ${cardBgClass}`}>
          <div className="flex flex-col items-center mb-6">
            <Lock size={48} className={`mb-4 ${primaryText}`}/>
            <h2 className={`text-3xl font-bold ${primaryText}`}>Admin Access</h2>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 ${inputClass} focus:ring-${theme.primary}-${theme.isDarkMode ? '400' : '600'}`}
              required
            />
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            <button type="submit" className={`w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 ${primaryBtn}`}>
              <LogIn className="mr-2" />
              Submit
            </button>
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className={`w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg transition duration-200 ${secondaryBtn}`}
            >
              <ArrowLeft className="mr-2" />
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If an employee is signed in, show the main POS screen.
  if (isEmployeeSignedIn) {
    return (
      <div className={`flex flex-col lg:flex-row min-h-screen font-inter ${bgColorClass} transition-colors duration-500`}>
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
        `}</style>
        {/* Main Menu & Order-Taking Section */}
        <div className="w-full lg:w-2/3 p-4 lg:p-6 flex flex-col">
          <header className={`flex justify-between items-center p-4 lg:p-6 mb-4 rounded-xl shadow-lg ${cardBgClass}`}>
            <h1 className={`text-3xl lg:text-4xl font-extrabold ${primaryText}`}>{settings.businessName} POS</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEmployeeSignOut}
                className={`p-3 rounded-full transition-colors ${secondaryBtn}`}
              >
                <LogOut size={24} />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto flex-1 p-2 rounded-xl">
            {menuItems.length > 0 ? (
              menuItems.map(item => (
                <div key={item.id} className={`p-4 rounded-xl shadow-md cursor-pointer transition-all duration-200 ${cardBgClass} hover:ring-2 hover:ring-${theme.primary}-500 transform hover:scale-105`} onClick={() => addItemToOrder(item)}>
                  <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                  <p className={`text-sm mb-2 ${primaryText}`}>{item.category}</p>
                  <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className={`col-span-full text-center p-8 ${cardBgClass} rounded-xl shadow-md`}>
                <p className="text-lg">No menu items available. Please check the admin panel.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary and Checkout Section */}
        <div className={`w-full lg:w-1/3 p-4 lg:p-6 ${cardBgClass} shadow-lg flex flex-col`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-2xl font-bold ${primaryText}`}>Current Order</h2>
            <button onClick={clearOrder} className={`p-2 rounded-full ${secondaryBtn}`} aria-label="Clear Order">
              <Trash2 size={20} />
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto space-y-3 pr-2">
            {order.length > 0 ? (
              order.map(item => (
                <li key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${borderClass} border-b`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateItemQuantity(item.id, -1)} className={`p-1 rounded-full ${secondaryBtn}`}><MinusCircle size={20} /></button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateItemQuantity(item.id, 1)} className={`p-1 rounded-full ${secondaryBtn}`}><PlusCircle size={20} /></button>
                  </div>
                  <span className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">No items in the order.</div>
            )}
          </ul>
          <div className={`mt-4 pt-4 ${borderClass} border-t-2`}>
            <div className="flex justify-between text-lg font-medium mb-1">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-medium mb-4">
              <span>Tax ({taxRate * 100}%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold mb-4">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={sendOrderToKitchen}
              className={`w-full py-4 rounded-lg flex items-center justify-center font-bold text-lg transition duration-200 ${primaryBtn}`}
            >
              <Send className="mr-2" />
              Send to Kitchen
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If no one is signed in, show the sign-in screen.
  return (
    <SignInScreen
      handleSignIn={handleEmployeeSignIn}
      signInError={signInError}
      setShowLogin={setShowLogin}
      settings={settings}
    />
  );
};
export default PosStand;
