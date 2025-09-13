import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMissionsToday, verifyMission, verifyLeetCodeDaily } from "../lib/mockApi";
import { toast } from "react-toastify";
import MissionCard from "./MissionCard";
import { settingsStore } from "../lib/settingsStore";

export default function MissionStrip() {
const qc = useQueryClient();

// Query: load today's missions
const { data, isLoading } = useQuery({
queryKey: ["missions-today"],
queryFn: fetchMissionsToday,
});

// Helper to decide which verifier to call
async function precheck(mission) {
if (/Daily Question/i.test(mission.title)) {
const username = settingsStore.handles.leetcode || "leetcode";
return verifyLeetCodeDaily({ username }); // client-side LC check via proxy
}
// default: simulate success for other mission types
return { ok: true };
}

const { mutate } = useMutation({
mutationKey: ["verify-mission"],
mutationFn: async (mission) => {
const res = await precheck(mission);
// still call the generic verify to keep the flow consistent
if (res.ok) {
await verifyMission(mission.id);
}
return res;
},
onMutate: async (mission) => {
await qc.cancelQueries({ queryKey: ["missions-today"] }); // avoid races
const prev = qc.getQueryData(["missions-today"]);
// optimistic flip
qc.setQueryData(["missions-today"], (old) =>
old?.map((m) => (m.id === mission.id ? { ...m, status: "Verified" } : m))
);
return { prev, mission };
},
onError: (_err, _mission, ctx) => {
if (ctx?.prev) qc.setQueryData(["missions-today"], ctx.prev); // rollback
toast.error("Verification failed");
},
onSuccess: (data, _mission, ctx) => {
if (!data?.ok) {
// revert optimistic update if precheck failed
if (ctx?.prev) qc.setQueryData(["missions-today"], ctx.prev);
if (data.reason === "not-completed") toast.info("Daily not completed yet");
else if (data.reason === "lc-unavailable") toast.warn("LeetCode service unavailable—try later");
else toast.error("Verification failed");
return;
}
toast.success("Mission verified");
},
onSettled: () => {
qc.invalidateQueries({ queryKey: ["missions-today"] }); // sync
},
});

if (isLoading) {
return <div className="mt-6 text-slate-400">Loading missions…</div>;
}

return (
<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
{data?.map((m) => (
<MissionCard
key={m.id}
title={m.title}
desc={m.desc}
status={m.status}
countdown={m.countdown}
right={null}
// Ensure this matches the prop used inside MissionCard’s button
onVerify={() => mutate(m)}
/>
))}
</div>
);
}