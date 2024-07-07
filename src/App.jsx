import Map from "./MapModule/Map";
import { Toaster } from "@/components/ui/toaster";
// import "./App.css";
import "./global.css";

export default function App() {
  return (
    <div className="p-2 flex gap-2">
      <Map />
      <Toaster />
      <div id="map" className="flex-1 h-[calc(100vh-40px)]"></div>
    </div>
  );
}
