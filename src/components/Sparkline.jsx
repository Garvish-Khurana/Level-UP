import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function Sparkline({ data }) {
return (
<div className="h-16">
<ResponsiveContainer width="100%" height="100%">
<LineChart data={data}>
<Line type="monotone" dataKey="v" stroke="rgb(34,211,238)" strokeWidth={2} dot={false} />
</LineChart>
</ResponsiveContainer>
</div>
);
}