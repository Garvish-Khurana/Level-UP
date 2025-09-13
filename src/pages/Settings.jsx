import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { settingsStore } from "../lib/settingsStore";
function saveHandles(data) {
// mock save
return new Promise((res) => setTimeout(() => res({ ok: true, data }), 400));
}

export default function Settings() {
const [form, setForm] = useState({ leetcode: "", codeforces: "", github: "" });

const { mutate, isLoading } = useMutation({
mutationFn: saveHandles,
onSuccess: (_res, variables) =>{settingsStore.set({
handles:{
leetcode: variables.leetcode,
codeforces: variables.codeforces,
github: variables.github,
},
});
toast.success("Saved handles")},
onError: () => toast.error("Failed to save"),
});

function submit(e) {
e.preventDefault();
mutate(form);
}

function onChange(e) {
const { name, value } = e.target;
setForm((f) => ({ ...f, [name]: value }));
}

return (
<div className="space-y-6">
<h1 className="text-sm uppercase tracking-[0.2em] text-slate-300">Settings</h1>
<form onSubmit={submit} className="rounded-2xl bg-slate-900/60 backdrop-blur ring-1 ring-white/10 border border-cyan-400/15 p-6 grid gap-4 max-w-xl">
<label className="grid gap-1">
<span className="text-xs text-slate-400">LeetCode Username</span>
<input name="leetcode" value={form.leetcode} onChange={onChange} className="px-3 py-2 rounded-lg bg-slate-950 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/70" />
</label>
<label className="grid gap-1">
<span className="text-xs text-slate-400">Codeforces Handle</span>
<input name="codeforces" value={form.codeforces} onChange={onChange} className="px-3 py-2 rounded-lg bg-slate-950 border border-white/10 focus:ring-2 focus:ring-cyan-400/70" />
</label>
<label className="grid gap-1">
<span className="text-xs text-slate-400">GitHub Username</span>
<input name="github" value={form.github} onChange={onChange} className="px-3 py-2 rounded-lg bg-slate-950 border border-white/10 focus:ring-2 focus:ring-cyan-400/70" />
</label>
<div className="pt-2">
<button disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-slate-900 font-semibold shadow-[0_0_16px_rgba(56,189,248,.45)]">
{isLoading ? "Saving…" : "Save"}
</button>
</div>
</form>
</div>
);
}