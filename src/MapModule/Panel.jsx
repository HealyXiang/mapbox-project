/* eslint-disable react/prop-types */
import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import AddUserDialog from "./AddUserDialog";
import { MetaData } from "@/constant";
import useMapBoxStore from "@/store/mapBox";
import { useMapDataStore } from "@/store";

export function InputFile() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" />
    </div>
  );
}

export default function Panel({
  // loadedLayers,
  downloadRectangles,
  loadRectanglesFile,
  unloadRectangles,
  filterPointsByRectangles,
  loadUserMapData,
  downloadUserData,
  addHeatmapLayer,
  addClusterLayer,
  addLineLayer,
}) {
  // const userInputRef = useRef();
  const state = useMapBoxStore((state) => state);
  const { loadedLayers, updateLayer } = state;

  const { users } = useMapDataStore((state) => state);
  console.log("users users:", users);

  const userNumber = useMemo(() => {
    // const size = loadedLayers?.[MetaData.user.layerId]?.data?.features?.length;
    const numSize = Object.values(users)?.reduce((prev, cur) => {
      return prev + cur.features?.length || 0;
    }, 0);
    return numSize ? numSize : null;
  }, [users]);
  // const uploadUserData = () => {
  //   if (userInputRef.current) {
  //     userInputRef.current.click();
  //   }
  // };

  const loadBatchUserMapData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const jsonData = JSON.parse(e.target.result);
        loadUserMapData(jsonData);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col w-[240px] p-2 gap-2">
      <Card className="flex flex-col align-middle gap-2 p-2">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">上传多边形数据</Label>
          <Input
            className="cursor-pointer"
            onChange={loadRectanglesFile}
            type="file"
            accept=".geojson"
            aria-label="上传 GeoJSON 文件"
          />
        </div>
        <Button onClick={unloadRectangles} className="button">
          Unload Rectangles
        </Button>
        <Button
          variant="secondary"
          onClick={downloadRectangles}
          className="button"
        >
          下载多边形数据
        </Button>
      </Card>

      <button onClick={filterPointsByRectangles} className="button">
        Filter Points
      </button>
      <Card className="flex flex-col align-middle gap-2 p-2">
        <AddUserDialog />
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">批量上传用户数据</Label>
          <Input
            className="cursor-pointer"
            onChange={loadBatchUserMapData}
            type="file"
            accept=".json"
          />
        </div>
        <Button variant="secondary" onClick={downloadUserData}>
          下载用户数据
        </Button>
        <Button variant="secondary" onClick={updateLayer}>
          测试 loadedLayers
        </Button>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          当前用户数量： {userNumber}
        </div>
      </Card>
      <Card className="flex flex-col align-middle gap-2 p-2">
        <button onClick={addHeatmapLayer} className="button">
          Add Heatmap Layer
        </button>
        <button onClick={addClusterLayer} className="button">
          Add Cluster Layer
        </button>
        <button onClick={addLineLayer} className="button">
          Add Line Layer
        </button>
      </Card>
      <Card className="flex flex-col align-middle gap-2 p-2">
        <div id="layerList">
          <strong>Loaded Layers:</strong>
          <ul id="layers"></ul>
        </div>
      </Card>
      <div className="h-[200px]">{/* <EBarChart /> */}</div>
    </div>
  );
}
