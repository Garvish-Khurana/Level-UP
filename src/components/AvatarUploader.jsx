import { useRef, useState } from "react";

export default function AvatarUploader() {
const [src, setSrc] = useState(null);
const fileRef = useRef();

function onPick(e) {
const f = e.target.files?.[0];
if (!f) return;
const url = URL.createObjectURL(f);
setSrc(url);
}

return (
<div className="rounded-2xl bg-slate-900/60 backdrop-blur ring-1 ring-white/10 border border-cyan-400/20 p-6">
<div className="flex flex-col items-center">
<div className="size-40 md:size-44 rounded-full ring-2 ring-cyan-400/30 shadow-[0_0_32px_rgba(56,189,248,.35)] overflow-hidden">
{src ? <img src={src} alt="avatar" className="size-full object-cover" /> : <div className="size-full bg-slate-800" />}
</div>
<button
onClick={() => fileRef.current?.click()}
className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-slate-900 font-semibold shadow-[0_0_18px_rgba(56,189,248,.45)] hover:shadow-[0_0_28px_rgba(56,189,248,.65)] transition"
>
Upload Image
</button>
<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
</div>
</div>
);
}