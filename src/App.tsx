import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Demands from "@/pages/Demands";
import Products from "@/pages/Products";
import Expenses from "@/pages/Expenses";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="demands" element={<Demands />} />
          <Route path="products" element={<Products />} />
          <Route path="expenses" element={<Expenses />} />
        </Route>
      </Routes>
    </Router>
  );
}
