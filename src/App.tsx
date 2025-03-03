
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import Layout from "./components/layout/Layout";
import Catalog from "./pages/Catalog";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import BookDetail from "./pages/BookDetail";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/admin/AdminRoute";
import AdminBooks from "./pages/admin/Books";
import BooksReservation from "./pages/admin/BooksReservation";
import BookRequests from "./pages/admin/BookRequests";
import MyBooks from "./pages/MyBooks";
import MyRequests from "@/pages/MyRequests";
import Settings from "./pages/admin/Settings";
import Feedback from "./pages/Feedback";
import Recommendations from "./pages/Recommendations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/auth/signin" element={<SignIn />} />
              <Route path="/auth/signup" element={<SignUp />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route
                path="/my-books"
                element={
                  <ProtectedRoute>
                    <MyBooks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-requests"
                element={
                  <ProtectedRoute>
                    <MyRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book/:id"
                element={
                  <ProtectedRoute>
                    <BookDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books"
                element={
                  <AdminRoute>
                    <AdminBooks />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reservations"
                element={
                  <AdminRoute>
                    <BooksReservation />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/book-requests"
                element={
                  <AdminRoute>
                    <BookRequests />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminRoute>
                    <Settings />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
