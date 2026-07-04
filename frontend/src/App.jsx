import { BrowserRouter, Routes, Route } from "react-router-dom";
import Garage from "./pages/Garage";
import VehicleDetail from "./pages/VehicleDetail";
import VehiclePhotos from "./pages/VehiclePhotos";
import VehiclePhotoViewer from "./pages/VehiclePhotoViewer";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Garage />} />
        <Route path="/garage" element={<Garage />} />
        <Route path="/garage/:slug" element={<VehicleDetail />} />
<Route path="/garage/:slug/photos" element={<VehiclePhotos />} />
<Route path="/garage/:slug/photos/:photoId" element={<VehiclePhotoViewer />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;