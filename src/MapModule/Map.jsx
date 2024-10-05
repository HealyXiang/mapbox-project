// import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import mapboxgl from "mapbox-gl";
import { useEffect } from "react";
import { booleanPointInPolygon, point } from "@turf/turf";

import Panel from "./Panel";
import CreateAddUserPopup from "@/MapModule/AddUserPopup";
import useMapBoxStore from "@/store/mapBox";
import { USER_SOURCE_ID, USER_LAYER_ID, sourceIdGenerator } from "@/utils/map";

function Map() {
  const {
    mapInstance,
    draw,
    addGeoJSONSource,
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
    addCommonHeatmapLayer,
  } = useMapBoxStore((state) => state);

  useEffect(() => {
    if (mapInstance) return;
    initMapInstance?.();
  }, [mapInstance, initMapInstance]);

  useEffect(() => {
    if (mapInstance) {
      mapInstance.on("draw.selectionchange", (e) => {
        const selectedFeatures = draw.getSelected().features;
        console.log("selectedFeatures:", selectedFeatures);
        const isPolygon = selectedFeatures?.[0]?.geometry.type === "Polygon";
        if (isPolygon) {
          // 多边形里的点单独绘制热力图
          const featureId = selectedFeatures[0].id;
          const polygonFeature = draw.get(featureId);
          const sourceData = mapInstance.getSource(USER_SOURCE_ID)._data;
          const filteredFeatures = sourceData.features.filter((point) => {
            return booleanPointInPolygon(
              point.geometry.coordinates,
              polygonFeature.geometry
            );
          });
          console.log("filteredFeatures:", filteredFeatures);
          addCommonHeatmapLayer({ ...sourceData, features: filteredFeatures });
        }
      });
      // 绑定了点击事件，在点击时获取point feature时，弹出添加用户的popup
      mapInstance.on("click", (e) => {
        console.log("e e:", e);
        const featureId = draw.getFeatureIdsAt(e.point);
        const pointFeature = draw.get(featureId);
        const isPoint = pointFeature && pointFeature.geometry.type === "Point";
        if (isPoint && pointFeature) {
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
            .setLngLat(pointFeature.geometry.coordinates)
            .setDOMContent(
              CreateAddUserPopup({
                latitude: `${e.lngLat.lat}`,
                longitude: `${e.lngLat.lng}`,
              })
            )
            .setMaxWidth("300px")
            .addTo(mapInstance);
        }
      });
    }
  }, [mapInstance, draw, addCommonHeatmapLayer]);

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
