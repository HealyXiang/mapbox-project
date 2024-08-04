/* eslint-disable react/prop-types */
import { BarChart, Bar, ResponsiveContainer, YAxis, LabelList } from "recharts";

export default function EBarChart({ areasData }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart width={150} height={40} data={areasData}>
        <YAxis
          label={{
            value: "多边形用户数量",
            angle: -90,
            position: "insideLeft",
            textAnchor: "middle",
          }}
        />
        <Bar dataKey="userCount" fill="#8884d8">
          <LabelList dataKey="userCount" position="top" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
