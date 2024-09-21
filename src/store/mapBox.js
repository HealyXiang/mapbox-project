/* eslint-disable no-unused-vars */
import { create } from "zustand";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { booleanPointInPolygon } from "@turf/turf";
import { uid } from "uid";

import { MetaData } from "@/constant";
import { convertToGeoJSON, convertToHeatmapGeoJSON } from "@/utils/map";
import { useMapDataStore } from "./index";

const InitParams = {
  lng: 110.201575627399,
  lat: 28.20947515918781,
  zoom: 15,
};

const { user: userMeta } = MetaData;

console.log("VITE_MAP_BOX_ACCESS_TOKEN", import.meta.env);
mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_ACCESS_TOKEN;

const useMapBoxStore = create((set) => ({
  mapInstance: null,
  draw: null,
  loadedLayers: {},
  setMapInstance: (mapInstance) => set((state) => ({ mapInstance })),
  initMapInstance: () =>
    set((state) => {
      const mapInstance = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: [InitParams.lng, InitParams.lat],
        zoom: InitParams.zoom,
      });
      const draw = new MapboxDraw();
      mapInstance.addControl(draw);
      return { mapInstance, draw };
    }),
  loadUserMapData: (mapUserArr) =>
    set((state) => {
      try {
        console.log("mapUserArr:", mapUserArr);
        const userGeoJSONData = convertToGeoJSON(mapUserArr);
        // 用户数据 addGeoJSONSource(data, sourceId, layerId, layerType = "circle")
        console.log("user geoJSONData:", userGeoJSONData);
        useMapDataStore.getState().addUsers(userGeoJSONData);
        // setUsers(userGeoJSONData);
        state.addGeoJSONSource(
          userGeoJSONData,
          //   userMeta.sourceId,
          uid(),
          //   userMeta.layerId
          uid()
        );
        return state;
      } catch (error) {
        console.error("load user map data error:", error);
        return false;
      }
    }),
  removeLoadedLayer: (layerId) =>
    set((state) => {
      const loadedLayers = state.loadedLayers;
      if (loadedLayers[layerId]) {
        const newLoadedLayers = { ...loadedLayers, [layerId]: null };
        return { loadedLayers: newLoadedLayers };
      }
      return state;
    }),
  addGeoJSONSource: (data, sourceId, layerId, layerType = "circle") =>
    set((state) => {
      const { mapInstance, addLoadedLayer, updateLayerList } = state;
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeLayer(layerId);
        mapInstance.removeSource(sourceId);
        state.removeLoadedLayer(layerId);
      }
      let sourceData = data;
      if (sourceId === "heatmap-sampleData") {
        sourceData = {
          ...data,
          features: convertToHeatmapGeoJSON(data.features),
        };
      }
      console.log("sourceData sourceData:", sourceData);
      // console.log("data data:", data);
      mapInstance.addSource(sourceId, {
        type: "geojson",
        data: sourceData,
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
        // 热力图layer绘制
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
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
            20,
            10,
          ],
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
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 15, 10],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            1,
            1,
            20,
            0.9,
          ],
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
      const loadedLayers = state.loadedLayers;
      const newLoadedLayers = { ...loadedLayers };
      newLoadedLayers[layer.id] = layer;
      //   return { loadedLayers: { bbbbb: 9999 } };
      return { ...state };
    }),
  addLoadedLayer: (layer) =>
    set((state) => {
      const loadedLayers = state.loadedLayers;
      const newLoadedLayers = { ...loadedLayers };
      newLoadedLayers[layer.id] = layer;
      //   return { loadedLayers: newLoadedLayers };
      console.log("addLoadedLayer call::::");
      return { loadedLayers: { hhhggg: 9999 } };
    }),
  updateLayer: (layer) =>
    set((state) => {
      console.log("updateLayer");
      return { loadedLayers: { aaa: 9999 } };
    }),
  addUserMapData: (jsonData) =>
    set((state) => {
      try {
        console.log("jsonData jsonData:", jsonData);
        const userGeoJSONData = convertToGeoJSON(jsonData);
        // 用户数据 addGeoJSONSource(data, sourceId, layerId, layerType = "circle")
        console.log("user geoJSONData:", userGeoJSONData);
        useMapDataStore.getState().addUsers(userGeoJSONData);
        state.addGeoJSONSource(
          userGeoJSONData,
          userMeta.sourceId,
          userMeta.layerId
        );
        return state;
      } catch (error) {
        console.error("load user map data error:", error);
        return false;
      }
    }),
  addHeatmapLayer: () =>
    set((state) => {
      const { mapInstance, addGeoJSONSource } = state;
      const sampleData = mapInstance.getSource("sampleData");
      if (!sampleData) {
        alert("Load sample data first.");
        return state;
      }
      addGeoJSONSource(
        sampleData._data,
        "heatmap-sampleData",
        "heatmap-layer",
        "heatmap"
      );
      return state;
    }),
  downloadRectangles: () =>
    set((state) => {
      const { draw } = state;
      const data = draw.getAll();
      if (data.features.length === 0) {
        //   toast({
        //     description: "No rectangles to download.",
        //   });
        return;
      }

      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rectangles.geojson";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return state;
    }),
  loadRectanglesFile: () =>
    set((state) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const data = JSON.parse(e.target.result);
          useMapDataStore.getState().setAreas(data);
          state.draw.set({
            type: "FeatureCollection",
            features: data.features,
          });
          state.addGeoJSONSource(
            data,
            "rectanglesData",
            "rectanglesData-layer",
            "fill"
          );
        };
        reader.readAsText(file);
      }
      return state;
    }),
  unloadRectangles: () => set((state) => {}),
  updateLayerList: (_) =>
    set((state) => {
      try {
        console.log("state in updateLayerList:", state);
        console.log("params in updateLayerList:", _);
        const layerList = document.getElementById("layers");
        layerList.innerHTML = "";
        const { loadedLayers, toggleLayerVisibility } = state;

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
        return state;
      } catch (error) {
        console.error("error in updateLayerList:", error);
      }
    }),
  toggleLayerVisibility: (layerId, isVisible) =>
    set((state) => {
      const { mapInstance } = state;
      const visibility = isVisible ? "visible" : "none";
      mapInstance.setLayoutProperty(layerId, "visibility", visibility);
      return state;
    }),
  filterPointsByRectangles: () =>
    set((state) => {
      const { mapInstance, draw, addGeoJSONSource } = state;
      const selectedFeatures = draw.getSelected().features;
      if (selectedFeatures.length === 0) {
        alert("No rectangles selected for filtering.");
        return state;
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
    }),
  downloadUserData: () =>
    set((state) => {
      const { mapInstance, userMeta, toast } = state;
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
      return state;
    }),
  addClusterLayer: () =>
    set((state) => {
      const { mapInstance, addGeoJSONSource } = state;
      const sampleData = mapInstance.getSource("sampleData");
      if (!sampleData) {
        alert("Load sample data first.");
        return state;
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
      return state;
    }),
  addLineLayer: () =>
    set((state) => {
      const { mapInstance, addGeoJSONSource } = state;
      const sampleData = mapInstance.getSource("sampleData");
      if (!sampleData) {
        alert("Load sample data first.");
        return state;
      }
      addGeoJSONSource(sampleData._data, "sampleData", "line-layer", "line");
      return state;
    }),
}));

export default useMapBoxStore;
