import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Garage from "./pages/Garage";
import Sold from "./pages/Sold";
import VehicleDetail from "./pages/VehicleDetail";
import VehiclePhotos from "./pages/VehiclePhotos";
import VehiclePhotoViewer from "./pages/VehiclePhotoViewer";
import WhoWeAre from "./pages/WhoWeAre";
import TeamMemberDetail from "./pages/TeamMemberDetail";
import LocationDetail from "./pages/LocationDetail";
import WhatWeDo from "./pages/WhatWeDo";
import Contact from "./pages/Contact";
import AiSearchChat from "./components/ai/AiSearchChat";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminVehicleNew from "./pages/admin/AdminVehicleNew";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminContent from "./pages/admin/AdminContent";
import AdminSettings from "./pages/admin/AdminSettings";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/garage" element={<Garage />} />
        <Route path="/sold" element={<Sold />} />
        <Route path="/garage/:slug" element={<VehicleDetail />} />
<Route path="/garage/:slug/photos" element={<VehiclePhotos />} />
<Route path="/garage/:slug/photos/:photoId" element={<VehiclePhotoViewer />} />
<Route path="/whoweare" element={<WhoWeAre />} />
<Route path="/team/:slug" element={<TeamMemberDetail />} />
<Route path="/locations/:slug" element={<LocationDetail />} />
<Route path="/whatwedo" element={<WhatWeDo />} />
<Route path="/contact" element={<Contact />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="vehicles/new" element={<AdminVehicleNew />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>

      <PublicSiteChat />
    </BrowserRouter>
  );
}

function PublicSiteChat() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return <AiSearchChat />;
}

export default App;