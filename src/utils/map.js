import { uid } from "uid";
export function convertToGeoJSON(data) {
  const features = data.map((item) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [item.location.longitude, item.location.latitude],
    },
    properties: {
      name: item.name,
      address: item.address,
      service: item.service,
      category: item.category,
      timestamp: item.timestamp,
      mag: 1, // Assuming each point has a magnitude of 1 for heatmap purposes
    },
  }));

  return {
    type: "FeatureCollection",
    features: features,
  };
}

export function convertToHeatmapGeoJSON(data) {
  const features = data.map((item) => ({
    type: "Feature",
    geometry: {
      ...item.geometry,
    },
    properties: {
      name: item.name,
      address: item.address,
      service: item.service,
      category: item.category,
      timestamp: item.timestamp,
      mag: 1, // Assuming each point has a magnitude of 1 for heatmap purposes
    },
  }));

  return features;
}

export function downloadRectangles(draw) {
  const data = draw?.getAll();
  if (data.features.length === 0) {
    alert("No rectangles to download.");
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

class SourceIdGenerator {
  userSourcePrefix = "user";
  heatMapPrefix = "heatmap";
  constructor() {
    this.sourceId = 0;
  }

  generateUserSourceId() {
    return `${this.userSourcePrefix}_${uid()}`;
  }

  generateUserLayerId() {
    return `${this.userSourcePrefix}_${uid()}`;
  }

  isUserSourceId(sourceId) {
    return sourceId.startsWith(this.userSourcePrefix);
  }

  generateHeatMapSourceId() {
    return `${this.heatMapPrefix}_${uid()}`;
  }

  generateHeatMapLayerId() {
    return `${this.heatMapPrefix}_${uid()}`;
  }
}

export const sourceIdGenerator = new SourceIdGenerator();
