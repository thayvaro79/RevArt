import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Garage from "./pages/Garage";
import Sold from "./pages/Sold";
import VehicleDetail from "./pages/VehicleDetail";
import VehiclePhotos from "./pages/VehiclePhotos";
import VehiclePhotoViewer from "./pages/VehiclePhotoViewer";
import WhoWeAre from "./pages/WhoWeAre";
import TeamMemberDetail from "./pages/TeamMemberDetail";
import LocationDetail from "./pages/LocationDetail";
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;