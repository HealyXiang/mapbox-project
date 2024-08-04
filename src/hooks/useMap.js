import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useCallback } from "react";
import { booleanPointInPolygon } from "@turf/turf";

import { convertToGeoJSON } from "@/utils/map";
import { useToast } from "@/components/ui/use-toast";
import { MetaData } from "@/constant";
import { useMapDataStore } from "@/store";

const { user: userMeta } = MetaData;

console.log("VITE_MAP_BOX_ACCESS_TOKEN", import.meta.env);
mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_ACCESS_TOKEN;
//   "pk.eyJ1IjoiaHVhbmdkb3UiLCJhIjoiY2x0d2IxYnp3MDY2MjJpbG05Y3cwc3h3ZCJ9.LXYt_VZsq0WO8m8V-ucw-A";

const rectangleLayers = [];
export default function useMap() {
  const mapContainer = useRef(null);
  const [draw, setDraw] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [lng, setLng] = useState(110.201575627399);
  // eslint-disable-next-line no-unused-vars
  const [lat, setLat] = useState(28.20947515918781);
  // eslint-disable-next-line no-unused-vars
  const [zoom, setZoom] = useState(15);
  const [loadedLayers, setLoadedLayers] = useState({});
  const { toast } = useToast();
  const setAreas = useMapDataStore((state) => state.setAreas);
  const setUsers = useMapDataStore((state) => state.setUsers);

  const addLoadedLayer = useCallback(
    (layer) => {
      const newLoadedLayers = { ...loadedLayers };
      newLoadedLayers[layer.id] = layer;
      setLoadedLayers(newLoadedLayers);
    },
    [loadedLayers]
  );

  const removeLoadedLayer = useCallback(
    (layerId) => {
      if (loadedLayers[layerId]) {
        const newLoadedLayers = { ...loadedLayers, [layerId]: null };
        setLoadedLayers(newLoadedLayers);
      }
    },
    [loadedLayers]
  );

  function addGeoJSONSource(data, sourceId, layerId, layerType = "circle") {
    if (mapInstance.getSource(sourceId)) {
      mapInstance.removeLayer(layerId);
      mapInstance.removeSource(sourceId);
      removeLoadedLayer(layerId);
    }

    mapInstance.addSource(sourceId, {
      type: "geojson",
      data,
    });

    const layer = {
      id: layerId,
      source: sourceId,
      type: layerType,
    };

    if (layerType === "circle") {
      layer.paint = {
        "circle-radius": 3,
        "circle-stroke-width": 2,
        "circle-color": "black",
        "circle-stroke-color": "white",
      };
    } else if (layerType === "fill") {
      layer.paint = {
        "fill-color": "#888888",
        "fill-opacity": 0.4,
      };
    } else if (layerType === "heatmap") {
      layer.type = "heatmap";
      layer.paint = {
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "mag"],
          0,
          0,
          1,
          1,
        ],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.2,
          "rgb(103,169,207)",
          0.4,
          "rgb(209,229,240)",
          0.6,
          "rgb(253,219,199)",
          0.8,
          "rgb(239,138,98)",
          1,
          "rgb(178,24,43)",
        ],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
        "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 0],
      };
    } else if (layerType === "cluster") {
      mapInstance.addLayer({
        id: `${layerId}-cluster`,
        type: "circle",
        source: sourceId,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            100,
            "#f1f075",
            750,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
        },
      });

      mapInstance.addLayer({
        id: `${layerId}-cluster-count`,
        type: "symbol",
        source: sourceId,
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      mapInstance.addLayer({
        id: `${layerId}-unclustered-point`,
        type: "circle",
        source: sourceId,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 5,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });
      return;
    } else if (layerType === "line") {
      layer.type = "line";
      layer.paint = {
        "line-color": "#888",
        "line-width": 8,
      };
    }

    mapInstance.addLayer(layer);

    addLoadedLayer({ ...layer, data });
    updateLayerList();
  }

  const toggleLayerVisibility = useCallback(
    (layerId, isVisible) => {
      const visibility = isVisible ? "visible" : "none";
      mapInstance.setLayoutProperty(layerId, "visibility", visibility);
    },
    [mapInstance]
  );

  function loadUserMapData(jsonData) {
    try {
      const userGeoJSONData = convertToGeoJSON(jsonData);
      // 用户数据 addGeoJSONSource(data, sourceId, layerId, layerType = "circle")
      console.log("user geoJSONData:", userGeoJSONData);
      setUsers(userGeoJSONData);
      addGeoJSONSource(userGeoJSONData, userMeta.sourceId, userMeta.layerId);
      return true;
    } catch (error) {
      console.error("load user map data error:", error);
      return false;
    }
  }

  const downloadUserData = () => {
    const userData = mapInstance.getSource(userMeta.sourceId);
    console.log("userData:", userData);
    if (!userData) {
      toast({
        description: "No user data to download.",
      });
      return;
    }
    const res = mapInstance.querySourceFeatures(userMeta.sourceId);
    console.log("res:", res);
    const blob = new Blob([JSON.stringify(userData._data)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "userData.geojson";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  function loadRectanglesFile(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = JSON.parse(e.target.result);
        setAreas(data);
        draw.set({
          type: "FeatureCollection",
          features: data.features,
        });
        addGeoJSONSource(
          data,
          "rectanglesData",
          "rectanglesData-layer",
          "fill"
        );
      };
      reader.readAsText(file);
    }
  }

  function unloadRectangles() {
    rectangleLayers.forEach((layer) => {
      if (mapInstance.getLayer(layer.id)) {
        mapInstance.removeLayer(layer.id);
      }
      if (mapInstance.getSource(layer.source)) {
        mapInstance.removeSource(layer.source);
      }
    });
    rectangleLayers.length = 0;
    updateLayerList();
  }

  const updateLayerList = useCallback(() => {
    const layerList = document.getElementById("layers");
    layerList.innerHTML = "";

    if (Object.keys(loadedLayers).length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.textContent = "No loaded layers";
      layerList.appendChild(emptyMessage);
    } else {
      Object.values(loadedLayers).forEach((layer) => {
        const listItem = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.onchange = (event) =>
          toggleLayerVisibility(layer.id, event.target.checked);
        listItem.appendChild(checkbox);
        listItem.appendChild(document.createTextNode(` ${layer.id}`));
        layerList.appendChild(listItem);
      });
    }
  }, [toggleLayerVisibility, loadedLayers]);

  function displayProperties(properties) {
    const featureDetails = document.getElementById("featureDetails");
    featureDetails.innerHTML = "";
    for (const key in properties) {
      const detailItem = document.createElement("div");
      detailItem.textContent = `${key}: ${properties[key]}`;
      featureDetails.appendChild(detailItem);
    }
  }

  function filterPointsByRectangles() {
    const selectedFeatures = draw.getSelected().features;
    if (selectedFeatures.length === 0) {
      alert("No rectangles selected for filtering.");
      return;
    }

    const points = mapInstance.querySourceFeatures("sampleData");
    const filteredPoints = points.filter((point) => {
      return selectedFeatures.some((rectangle) => {
        return booleanPointInPolygon(
          point.geometry.coordinates,
          rectangle.geometry
        );
      });
    });

    const geoJSONData = {
      type: "FeatureCollection",
      features: filteredPoints.map((point) => ({
        type: "Feature",
        geometry: point.geometry,
        properties: point.properties,
      })),
    };
    console.log("filteredPoints size:", filteredPoints);

    addGeoJSONSource(geoJSONData, "filteredData", "filteredData-layer");
  }

  function downloadRectangles() {
    const data = draw.getAll();
    if (data.features.length === 0) {
      toast({
        description: "No rectangles to download.",
      });
      return;
    }

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rectangles.geojson";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function addHeatmapLayer() {
    const sampleData = mapInstance.getSource("sampleData");
    if (!sampleData) {
      alert("Load sample data first.");
      return;
    }
    addGeoJSONSource(
      sampleData._data,
      "sampleData",
      "heatmap-layer",
      "heatmap"
    );
  }

  function addClusterLayer() {
    const sampleData = mapInstance.getSource("sampleData");
    if (!sampleData) {
      alert("Load sample data first.");
      return;
    }
    mapInstance.addSource("clusterData", {
      type: "geojson",
      data: sampleData._data,
      cluster: true,
      clusterMaxZoom: 8,
      clusterRadius: 5000,
    });
    addGeoJSONSource(
      sampleData._data,
      "clusterData",
      "cluster-layer",
      "cluster"
    );
  }

  function addLineLayer() {
    const sampleData = mapInstance.getSource("sampleData");
    if (!sampleData) {
      alert("Load sample data first.");
      return;
    }
    addGeoJSONSource(sampleData._data, "sampleData", "line-layer", "line");
  }

  // Initial load event
  const initLoad = useCallback(() => {
    if (mapInstance) {
      mapInstance.on("click", (e) => {
        const pointFeatures = mapInstance.queryRenderedFeatures(e.point, {
          layers: Object.values(loadedLayers).map((layer) => layer.id),
        });

        if (pointFeatures.length) {
          const properties = pointFeatures[0].properties;
          displayProperties(properties);
        } else {
          document.getElementById("featureDetails").innerHTML =
            "No features at this point.";
        }

        setTimeout(() => {
          const selectedFeatures = draw.getSelected().features;
          if (selectedFeatures.length) {
            const properties = selectedFeatures[0].properties;
            displayProperties(properties);
          }
        }, 10);
      });
      mapInstance.on("load", () => {
        updateLayerList();
      });

      mapInstance.on("styledata", updateLayerList);
    }
  }, [mapInstance, updateLayerList, draw, loadedLayers]);

  useEffect(() => {
    if (mapInstance) return; // initialize map only once
    // if (!mapContainer.current) return;
    const newMap = new mapboxgl.Map({
      //   container: mapContainer.current,
      container: "map",
      //   container: document.querySelector("#map"),
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    // const draw = new MapboxDraw({
    //   displayControlsDefault: false,
    //   controls: { polygon: true, trash: true },
    //   defaultMode: "draw_polygon",
    // });
    const draw = new MapboxDraw();

    newMap.addControl(draw);
    setMapInstance(newMap);
    setDraw(draw);
  }, [lng, lat, zoom, mapInstance]);

  useEffect(() => {
    initLoad();
  }, [initLoad]);

  return {
    mapInstance,
    mapContainer: mapContainer.current,
    draw,
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
  };
}
