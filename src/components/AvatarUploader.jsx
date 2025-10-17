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
    <div className="relative rounded-2xl bg-[#0e1029]/70 backdrop-blur ring-1 ring-cyan-500/80 border-[3.5px] border-cyan-400/60 p-8 flex flex-col items-center">
      <div className="relative w-50 h-50 flex items-center justify-center">
        {/* Outer dotted ring */}
        <div className="absolute inset-0 rounded-full border-2 border-fuchsia-400/60 border-dotted opacity-80 animate-pulse pointer-events-none" />
        {/* Middle neon ring */}
        <div className="absolute inset-1.5 rounded-full border-3 border-fuchsia-500/90 shadow-[0_0_32px_8px_rgba(232,26,255,0.3)] opacity-60 pointer-events-none" />
        {/* Inner cyan neon ring */}
        <div className="absolute inset-6 rounded-full border-3 border-fuchsia-400/90 shadow-[0_0_24px_8px_rgba(56,189,248,0.3)] opacity-80 pointer-events-none" />
        {/* Avatar image */}
        <div className="relative w-36 h-36 rounded-full overflow-hidden ring-0 bg-slate-800 flex items-center justify-center">
          {src 
            ? <img src={src} alt="avatar" className="w-full h-full object-cover" />
            : null}
        </div>
      </div>
      <button
        onClick={() => fileRef.current?.click()}
        className="mt-6 inline-flex items-center justify-center px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-bold shadow-[0_0_18px_rgba(56,189,248,.45)] hover:shadow-[0_0_32px_rgba(232,26,255,0.65)] transition"
      >
        Upload Image
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
    </div>
  );
}
