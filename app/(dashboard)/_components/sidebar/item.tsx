// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import { Check } from "lucide-react";
// import Image from "next/image";
// import { useOrganization, useOrganizationList } from "@clerk/nextjs";

// import { Hint } from "@/components/hint";
// import { cn } from "@/lib/utils";

// type ItemProps = {
//   id: string;
//   name: string;
//   imageUrl: string;
//   isExpanded: boolean;
// };

// export const Item = ({ id, name, imageUrl, isExpanded }: ItemProps) => {
//   const { organization } = useOrganization();
//   const { setActive } = useOrganizationList();

//   const isActive = organization?.id === id;

//   const onClick = () => {
//     if (!setActive) return;

//     setActive({ organization: id });
//   };

//   const content = (
//     <motion.button
//       type="button"
//       onClick={onClick}
//       whileHover={{ y: -2, scale: 1.01 }}
//       whileTap={{ scale: 0.985 }}
//       className={cn(
//         "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200",
//         "border-white/8 bg-white/[0.04] hover:border-white/18 hover:bg-white/[0.08]",
//         isActive &&
//           "border-sky-400/40 bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent shadow-[0_12px_30px_rgba(14,165,233,0.16)]",
//       )}
//     >
//       <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
//         <Image src={imageUrl} alt={name} fill className="object-cover" />
//       </div>

//       <AnimatePresence initial={false}>
//         {isExpanded ? (
//           <motion.div
//             initial={{ opacity: 0, x: -8 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -8 }}
//             className="min-w-0 flex-1"
//           >
//             <p className="truncate text-sm font-semibold text-slate-100">{name}</p>
//             <p className="truncate text-xs text-slate-400">
//               {isActive ? "Current workspace" : "Switch organization"}
//             </p>
//           </motion.div>
//         ) : null}
//       </AnimatePresence>

//       <AnimatePresence initial={false}>
//         {isExpanded && isActive ? (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.7 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.7 }}
//             className="rounded-full bg-sky-400/15 p-1 text-sky-100"
//           >
//             <Check className="h-4 w-4" />
//           </motion.div>
//         ) : null}
//       </AnimatePresence>
//     </motion.button>
//   );

//   if (isExpanded) return <li>{content}</li>;

//   return (
//     <li>
//       <Hint label={name} side="right" align="center" sideOffset={18}>
//         {content}
//       </Hint>
//     </li>
//   );
// };




"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Building2 } from "lucide-react";
import Image from "next/image";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";

import { Hint } from "@/components/hint";
import { cn } from "@/lib/utils";

type ItemProps = {
  id: string;
  name: string;
  imageUrl: string;
  isExpanded: boolean;
};

export const Item = ({ id, name, imageUrl, isExpanded }: ItemProps) => {
  const { organization } = useOrganization();
  const { setActive } = useOrganizationList();

  const isActive = organization?.id === id;

  const onClick = () => {
    if (!setActive) return;
    setActive({ organization: id });
  };

  const content = (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.012 }}
      whileTap={{ scale: 0.982 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left",
        "transition-colors duration-200",
        isActive
          ? [
              "border-sky-400/35 shadow-[0_10px_28px_rgba(14,165,233,0.18)]",
              "bg-gradient-to-r from-sky-500/15 via-sky-500/6 to-transparent",
            ]
          : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.07]",
      )}
    >
      {/* Active left bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sky-400" />
      )}

      {/* Org avatar */}
      <div
        className={cn(
          "relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border",
          isActive
            ? "border-sky-400/25 ring-1 ring-sky-400/15"
            : "border-white/8 bg-slate-900/60",
        )}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback handled by CSS sibling
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Fallback icon shown when image fails */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Building2 className="h-4 w-4 text-slate-500" />
        </div>
      </div>

      {/* Label */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.16 }}
            className="min-w-0 flex-1"
          >
            <p
              className={cn(
                "truncate text-[13px] font-semibold",
                isActive ? "text-sky-100" : "text-slate-200",
              )}
            >
              {name}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {isActive ? "Current workspace" : "Switch workspace"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active check badge */}
      <AnimatePresence initial={false}>
        {isExpanded && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 340, damping: 20 }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-400/18 text-sky-300"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );

  if (isExpanded) return <li>{content}</li>;

  return (
    <li>
      <Hint label={name} side="right" align="center" sideOffset={16}>
        {content}
      </Hint>
    </li>
  );
};