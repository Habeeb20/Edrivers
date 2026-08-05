// // src/App.jsx
// import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
// import { Toaster } from 'sonner';  // ← Import this
// import { useEffect } from 'react';
// import Home from './pages/Home';
// import Login from './pages/auth/Login';
// import Signup from './pages/auth/Signup';
// import { useLocation } from 'react-router-dom';
// import Navbar from './component/Navbar';
// import { Link } from 'react-router-dom';
// import Dashboard from './pages/Dashboard/Dashboard';
// import Overview from './pages/Dashboard/Overview';
// import ProfileUpdate from './pages/Dashboard/ProfileUpdate';
// import ForgotPassword from './pages/auth/Forgotpassword';
// import ResetPassword from './pages/auth/Resetpassword';
// import AdminLogin from './pages/admin/AdminLogin';
// import AdminDashboard from './pages/admin/AdminDashboard';
// import DriverService from './component/DriverService/DriverService';
// import JoinDriverTraining from './component/JoinDriverTraining';
// import Footer from './component/Footer';
// import AboutUs from './component/AboutUs';
// import NotFound from './component/NotFound';

// import { trackPageView } from './utils/analytics';

// import EAuthLoginMinimal from './pages/auth/LoginFromOtherWeb';
// import GoToTopButton from './pages/GotoTopButton';
// // Layout Component
// const Layout = () => {
//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navbar />
//       <main className="flex-1">
//         <Outlet />
//       </main>
//       <Footer />
//     </div>
//   );
// };

// const Layout2 = () => {
//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navbar />
//       <main className="flex-1">
//         <Outlet />
//       </main>
   
//     </div>
//   );
// };


// function ScrollToTop() {
//   const { pathname } = useLocation();

//   useEffect(() => {
//     // Scroll to top on every route change
//     window.scrollTo(0, 0);
//   }, [pathname]);

//   return null;
// }

// function App() {
//   const location = useLocation();

//   useEffect(() => {
//     trackPageView(location.pathname + location.search);
//   }, [location]);
//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Router>
//         {/* Toaster must be inside Router but outside Routes so it's always present */}
//         <Toaster
//           position="top-center"     // or "top-right", "bottom-center", etc.
//           richColors                // Beautiful colors (success green, error red)
//           closeButton               // Optional: adds X button
//           toastOptions={{
//             duration: 5000,
//             style: {
//               fontSize: '14px',
//             },
//           }}
//         />
// <ScrollToTop />
//         <Routes>
//           <Route element={<Layout />}>
//             <Route path="/" element={<Home />} index />
//             <Route path="/login" element={<Login />} />
//             <Route path="/loginfromotherweb" element={<EAuthLoginMinimal />} />
//             <Route path="/admin/login" element={<AdminLogin />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/reset-password/:token" element={<ResetPassword />} />
//            <Route path="/services" element={<DriverService />} />
//            <Route path="/about" element={<AboutUs />} />
//            <Route path="/training" element={<JoinDriverTraining />} />

//            <Route path="*" element={<NotFound />} />
//           </Route>


// <Route element={<Layout2 />}>

//   <Route path="/dashboard" element={<Dashboard />} />


//   <Route path="/admin/dashboard" element={<AdminDashboard />} />

// </Route>

//           {/* 404 */}
//           <Route path="*" element={
//             <Layout>
//               <div className="flex items-center justify-center min-h-screen text-gray-600 text-xl">
//                 404 - Page Not Found
//               </div>
//             </Layout>
//           } />
//         </Routes>
//       </Router>

//       <GoToTopButton />
//     </div>
//   );
// }

// export default App;



// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Navbar from './component/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import Overview from './pages/Dashboard/Overview';
import ProfileUpdate from './pages/Dashboard/ProfileUpdate';
import ForgotPassword from './pages/auth/Forgotpassword';
import ResetPassword from './pages/auth/Resetpassword';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import DriverService from './component/DriverService/DriverService';
import JoinDriverTraining from './component/JoinDriverTraining';
import Footer from './component/Footer';
import AboutUs from './component/AboutUs';
import NotFound from './component/NotFound';

import { trackPageView } from './utils/analytics';

import EAuthLoginMinimal from './pages/auth/LoginFromOtherWeb';
import GoToTopButton from './pages/GotoTopButton';

// ==================== Layout Components ====================
const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const Layout2 = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

// ==================== Router-dependent helper components ====================
// These MUST be rendered inside <Router>, since they call useLocation().
// Rendering them here (as their own components) instead of calling
// useLocation() directly in App() is what fixes the "useLocation() may be
// used only in the context of a <Router>" error.

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

// ==================== App ====================
function App() {
  // No useLocation() call here — App is the component that creates the
  // Router, so it is not itself a descendant of one.

  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
        {/* Toaster must be inside Router but outside Routes so it's always present */}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            duration: 5000,
            style: {
              fontSize: '14px',
            },
          }}
        />

        <ScrollToTop />
        <PageViewTracker />

        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} index />
            <Route path="/login" element={<Login />} />
            <Route path="/loginfromotherweb" element={<EAuthLoginMinimal />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/services" element={<DriverService />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/training" element={<JoinDriverTraining />} />
            {/* Catch-all for anything under this layout */}
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<Layout2 />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Router>

      <GoToTopButton />
    </div>
  );
}

export default App;