/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { booleanPointInPolygon } from "@turf/turf";

import EBarChart from "@/components/BarChart";

import { useMapDataStore } from "@/store";

export default function MapBar() {
  const areas = useMapDataStore((state) => state.areas);
  const users = useMapDataStore((state) => state.users);

  console.log("areas areas:", areas);
  console.log("users users:", users);

  const areasData = useMemo(() => {
    if (areas?.features?.length && users?.features?.length) {
      const [usersFeatures, areasFeatures] = [users.features, areas.features];
      const areaUserMap = {};
      areasFeatures.forEach((area) => {
        areaUserMap[area.id] = { id: area.id, userCount: 0 };
      });
      usersFeatures.forEach((point) => {
        areasFeatures.forEach((area) => {
          if (
            booleanPointInPolygon(point.geometry.coordinates, area.geometry)
          ) {
            areaUserMap[area.id].userCount++;
          }
        });
      });
      return Object.values(areaUserMap);
    }
    return [];
  }, [areas, users]);

  return (
    <div className="flex-1 border flex flex-col p-1">
      {areasData?.length ? (
        <>
          <h4 className="text-center">柱状图</h4>
          <div className="px-6 flex gap-2">
            <span>多边形总数: {areasData.length}</span>
            <span>用户总数: {users?.features.length}</span>
          </div>
          <div className="flex-1">
            <EBarChart areasData={areasData} />
          </div>
        </>
      ) : null}
    </div>
  );
}
