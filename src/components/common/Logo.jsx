import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3 shrink-0">
      {/* Exact Drone Icon Vector */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full fill-none stroke-[#0B1528] stroke-linecap-round stroke-linejoin-round"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Diagonal Arms */}
          <line x1="28" y1="28" x2="72" y2="72" strokeWidth="6" />
          <line x1="72" y1="28" x2="28" y2="72" strokeWidth="6" />
          
          {/* Inner Arm Inset Outline Effect */}
          <line x1="30" y1="30" x2="70" y2="70" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="70" y1="30" x2="30" y2="70" stroke="#FFFFFF" strokeWidth="2" />

          {/* Top-Left Rotor Guard */}
          <circle cx="20" cy="20" r="14" strokeWidth="3.5" />
          <circle cx="20" cy="20" r="10" strokeWidth="2" />

          {/* Top-Right Rotor Guard */}
          <circle cx="80" cy="20" r="14" strokeWidth="3.5" />
          <circle cx="80" cy="20" r="10" strokeWidth="2" />

          {/* Bottom-Left Rotor Guard */}
          <circle cx="20" cy="80" r="14" strokeWidth="3.5" />
          <circle cx="20" cy="80" r="10" strokeWidth="2" />

          {/* Bottom-Right Rotor Guard */}
          <circle cx="80" cy="80" r="14" strokeWidth="3.5" />
          <circle cx="80" cy="80" r="10" strokeWidth="2" />

          {/* Center Main Body Housing */}
          <circle cx="50" cy="50" r="15" className="fill-white" strokeWidth="4" />
          <circle cx="50" cy="50" r="9" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="3" strokeWidth="2" />
        </svg>
      </div>

      {/* Text Branding */}
      <div className="flex flex-col justify-center select-none">
        <span className="font-extrabold text-2xl tracking-[0.12em] text-[#0B1528] leading-none uppercase">
          DRONE
        </span>
        <span className="font-extrabold text-[10px] tracking-[0.25em] text-[#0B1528] leading-none mt-1 uppercase">
          BANGLADESH
        </span>
      </div>
    </Link>
  );
}