import { Routes, Route, Navigate } from "react-router-dom";
// import AdminDashboard from "../pages/admin/AdminDashboard"
// import ManageProducts from "../pages/admin/ManageProducts";
// import ManageOrders from "../pages/admin/ManageOrders";
import { useContext } from "react";
import AdminContext from "../context/AdminContext";

const AdminRoutes: React.FC = () => {
    // const { isAdmin } = useContext(AdminContext);

    // if (!isAdmin) {
    //     return <Navigate to="/login" />;
    // }

    return (
        <Routes>
            {/* <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<ManageProducts />} />
            <Route path="/admin/orders" element={<ManageOrders />} /> */}
        </Routes>
    );
};

export default AdminRoutes;
