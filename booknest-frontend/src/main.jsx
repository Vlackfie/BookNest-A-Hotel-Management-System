//import React from 'react'
// import ReactDOM from 'react-dom/client'
// import { AuthProvider, useAuth } from './context/AuthContext'
// import Login from './pages/Login'
// import DashboardLayout from './layouts/DashboardLayout'
// import RoomManagement from './pages/RoomManagement'
// import './index.css'

// function AppContent() {
  // const { token } = useAuth();
  // return token ? <DashboardLayout><RoomManagement /></DashboardLayout> : <Login />;
// }

// ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    // <AuthProvider>
      // <AppContent />
    // </AuthProvider>
  // </React.StrictMode>,
// )
import React from 'react'
import ReactDOM from 'react-dom/client'
import RoomManagement from './pages/RoomManagement' // Ensure this is imported
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Bypassed Login view to inspect dashboard directly */}
    <RoomManagement />
  </React.StrictMode>,
)
