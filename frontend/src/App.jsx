import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateRide from "./pages/CreateRide";
import RideDetails from "./pages/RideDetails";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProtectedRoute from "./auth/ProtectedRoute";
import SearchRides from "./pages/SearchRides";

const App = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<SearchRides />} />

      <Route path="/create" element={
        <ProtectedRoute role="driver"><CreateRide /></ProtectedRoute>
      }/>

      <Route path="/ride/:id" element={<RideDetails />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
    </Routes>
  </>
);

export default App;
