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
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminVehicleNew from "./pages/admin/AdminVehicleNew";
import AdminVehicleEdit from "./pages/admin/AdminVehicleEdit";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminContent from "./pages/admin/AdminContent";
import AdminContentEditor from "./pages/admin/AdminContentEditor";
import AdminLocations from "./pages/admin/AdminLocations";
import AdminLocationForm from "./pages/admin/AdminLocationForm";
import AdminTeamMembers from "./pages/admin/AdminTeamMembers";
import AdminTeamMemberForm from "./pages/admin/AdminTeamMemberForm";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserForm from "./pages/admin/AdminUserForm";
import AdminSettings from "./pages/admin/AdminSettings";
import RequireAuth, { RequireRole } from "./components/admin/RequireAuth";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

function App() {
  return (
    <AuthProvider>
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

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="vehicles" element={<AdminVehicles />} />
              <Route path="vehicles/new" element={<AdminVehicleNew />} />
              <Route path="vehicles/:id/edit" element={<AdminVehicleEdit />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="content/:slug" element={<AdminContentEditor />} />
              <Route path="locations" element={<AdminLocations />} />
              <Route path="locations/new" element={<AdminLocationForm />} />
              <Route path="locations/:id/edit" element={<AdminLocationForm />} />
              <Route path="team-members" element={<AdminTeamMembers />} />
              <Route path="team-members/new" element={<AdminTeamMemberForm />} />
              <Route
                path="team-members/:id/edit"
                element={<AdminTeamMemberForm />}
              />
              <Route
                path="users"
                element={
                  <RequireRole role="Admin">
                    <AdminUsers />
                  </RequireRole>
                }
              />
              <Route
                path="users/new"
                element={
                  <RequireRole role="Admin">
                    <AdminUserForm />
                  </RequireRole>
                }
              />
              <Route
                path="users/:id/edit"
                element={
                  <RequireRole role="Admin">
                    <AdminUserForm />
                  </RequireRole>
                }
              />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>

        <PublicSiteChat />
      </BrowserRouter>
    </AuthProvider>
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