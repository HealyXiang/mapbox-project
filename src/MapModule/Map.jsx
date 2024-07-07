// import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import Panel from "./Panel";
import useMap from "../hooks/useMap";

function Map() {
  const {
    // map,
    // draw,
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
  } = useMap();

  return (
    <div className="flex flex-col border gap-1">
      <Panel
        loadedLayers={loadedLayers}
        downloadRectangles={downloadRectangles}
        loadRectanglesFile={loadRectanglesFile}
        unloadRectangles={unloadRectangles}
        filterPointsByRectangles={filterPointsByRectangles}
        loadUserMapData={loadUserMapData}
        downloadUserData={downloadUserData}
        addHeatmapLayer={addHeatmapLayer}
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
