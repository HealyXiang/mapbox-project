// import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import mapboxgl from "mapbox-gl";

import { useEffect } from "react";
import Panel from "./Panel";
import CreateAddUserPopup from "@/MapModule/AddUserPopup";
import useMapBoxStore from "@/store/mapBox";

function Map() {
  const {
    mapInstance,
    loadedLayers,
    downloadRectangles,
    loadRectanglesFile,
    unloadRectangles,
    filterPointsByRectangles,
    loadUserMapData,
    downloadUserData,
    addHeatmapLayer,
    addClusterLayer,
    addLineLayer,
    initMapInstance,
  } = useMapBoxStore((state) => state);

  useEffect(() => {
    if (mapInstance) return;
    initMapInstance?.();
  }, [mapInstance, initMapInstance]);

  useEffect(() => {
    if (mapInstance) {
      mapInstance.on("click", (e) => {
        console.log("e eee.lngLat:", e.lngLat);
        console.log(`A click event has occurred at ${e.lngLat}`);
        const markerHeight = 50;
        const markerRadius = 10;
        const linearOffset = 25;
        const popupOffsets = {
          top: [0, 0],
          "top-left": [0, 0],
          "top-right": [0, 0],
          bottom: [0, -markerHeight],
          "bottom-left": [
            linearOffset,
            (markerHeight - markerRadius + linearOffset) * -1,
          ],
          "bottom-right": [
            -linearOffset,
            (markerHeight - markerRadius + linearOffset) * -1,
          ],
          left: [markerRadius, (markerHeight - markerRadius) * -1],
          right: [-markerRadius, (markerHeight - markerRadius) * -1],
        };
        const popup = new mapboxgl.Popup({
          offset: popupOffsets,
          className: "my-class",
        })
          .setLngLat(e.lngLat)
          .setDOMContent(
            CreateAddUserPopup({
              latitude: `${e.lngLat.lat}`,
              longitude: `${e.lngLat.lng}`,
            })
          )
          .setMaxWidth("300px")
          .addTo(mapInstance);
      });
    }
  }, [mapInstance]);

  const handleAddHeatmapLayer = () => {
    if (mapInstance) {
      addHeatmapLayer();
    }
  };

  return (
    <div className="flex flex-col border gap-1">
      <Panel
        // loadedLayers={loadedLayers}
        downloadRectangles={downloadRectangles}
        loadRectanglesFile={loadRectanglesFile}
        unloadRectangles={unloadRectangles}
        filterPointsByRectangles={filterPointsByRectangles}
        loadUserMapData={loadUserMapData}
        downloadUserData={downloadUserData}
        addHeatmapLayer={handleAddHeatmapLayer}
        addClusterLayer={addClusterLayer}
        addLineLayer={addLineLayer}
      />
      <div id="features">
        <strong>Selected Features:</strong>
        <div id="featureDetails"></div>
      </div>
    </div>
  );
}

export default Map;
