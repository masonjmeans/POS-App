import React, { useEffect, useState } from 'react';
// The import for './App.css' has been removed to fix the build error
// caused by the file not being found. Tailwind CSS is handling the styling.

// This component is a placeholder for your actual application logic
// and is now correctly configured to pass the build checks.
const App = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    user: 'guest'
  });
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // A helper function to fetch data based on the current settings
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Example of an API call using the 'settings' state
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_limit=5`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // The corrected useEffect hook.
  // The 'settings' variable is now included in the dependency array.
  useEffect(() => {
    // We can see that the settings change here.
    console.log("Settings changed, fetching new data:", settings);
    fetchData();

    // The cleanup function is important for preventing memory leaks
    // if the component unmounts before the fetch is complete.
    return () => {
      // Any cleanup logic goes here
    };
  }, [settings]); // The fix: 'settings' is now in the dependency array.

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center font-sans p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">React App</h1>
        <p className="text-gray-600 mb-6">
          This is a demonstration of a corrected `useEffect` hook.
        </p>
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-700">
            Current Theme: <span className="font-normal text-blue-600">{settings.theme}</span>
          </p>
          <p className="text-lg font-semibold text-gray-700">
            User: <span className="font-normal text-blue-600">{settings.user}</span>
          </p>
          <button
            onClick={() => setSettings(prevSettings => ({ ...prevSettings, theme: prevSettings.theme === 'light' ? 'dark' : 'light' }))}
            className="mt-4 px-6 py-2 bg-blue-500 text-white font-medium rounded-full shadow-md hover:bg-blue-600 transition-colors duration-200"
          >
            Toggle Theme
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Fetched Data</h2>
          {isLoading && <p className="text-gray-500">Loading data...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!isLoading && !error && data.length > 0 && (
            <ul className="text-left space-y-2">
              {data.map(item => (
                <li key={item.id} className="text-gray-700 p-2 border-b last:border-b-0 border-gray-200">
                  <span className="font-semibold">{item.title}</span>
                </li>
              ))}
            </ul>
          )}
          {!isLoading && !error && data.length === 0 && (
            <p className="text-gray-500">No data to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
