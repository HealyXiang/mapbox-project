import Map from "./MapModule/Map";
import { Toaster } from "@/components/ui/toaster";
import MapBar from "@/MapModule/MapBar";
// import "./App.css";
import "./global.css";

export default function App() {
  return (
    <div className="p-2 flex gap-2">
      <Map />
      <Toaster />
      <div className="flex flex-col flex-1 gap-4">
        <div id="map" className="flex-1"></div>
        <div className="h-[300px] flex">
          <MapBar />
        </div>
      </div>
    </div>
  );
}
