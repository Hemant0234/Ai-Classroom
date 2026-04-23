// "use client";

// import { CreateOrganization } from "@clerk/nextjs";
// import { AnimatePresence, motion } from "framer-motion";
// import { Plus, Sparkles } from "lucide-react";

// import { Hint } from "@/components/hint";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// type NewButtonProps = {
//   isExpanded: boolean;
// };

// export const NewButton = ({ isExpanded }: NewButtonProps) => {
//   const trigger = (
//     <motion.div
//       whileHover={{ y: -2, scale: 1.01 }}
//       whileTap={{ scale: 0.985 }}
//       className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-dashed border-sky-400/30 bg-sky-500/10 px-3 py-3 text-left text-sky-50 transition-all duration-200 hover:border-sky-300/45 hover:bg-sky-500/15"
//     >
//       <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-400/15">
//         <Plus className="h-5 w-5" />
//       </div>

//       <AnimatePresence initial={false}>
//         {isExpanded ? (
//           <motion.div
//             initial={{ opacity: 0, x: -8 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -8 }}
//             className="min-w-0 flex-1"
//           >
//             <p className="truncate text-sm font-semibold">Create organization</p>
//             <p className="truncate text-xs text-sky-100/70">
//               Add a fresh classroom hub
//             </p>
//           </motion.div>
//         ) : null}
//       </AnimatePresence>

//       <AnimatePresence initial={false}>
//         {isExpanded ? (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.8 }}
//             className="rounded-full bg-white/10 p-1.5"
//           >
//             <Sparkles className="h-4 w-4" />
//           </motion.div>
//         ) : null}
//       </AnimatePresence>
//     </motion.div>
//   );

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         {isExpanded ? (
//           <button type="button" className="block w-full text-left">
//             {trigger}
//           </button>
//         ) : (
//           <Hint label="Create organization" side="right" align="center" sideOffset={18}>
//             <button type="button" className="block w-full text-left">
//               {trigger}
//             </button>
//           </Hint>
//         )}
//       </DialogTrigger>

//       <DialogContent className="max-w-[480px] border-none bg-transparent p-0">
//         <CreateOrganization />
//       </DialogContent>
//     </Dialog>
//   );
// };




// "use client";

// import { CreateOrganization } from "@clerk/nextjs";
// import { AnimatePresence, motion } from "framer-motion";
// import { Plus, Sparkles } from "lucide-react";

// import { Hint } from "@/components/hint";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// type NewButtonProps = {
//   isExpanded: boolean;
// };

// export const NewButton = ({ isExpanded }: NewButtonProps) => {
//   const trigger = (
//     <motion.div
//       whileHover={{ y: -2, scale: 1.012 }}
//       whileTap={{ scale: 0.982 }}
//       transition={{ type: "spring", stiffness: 340, damping: 22 }}
//       className={
//         "relative flex min-h-[52px] items-center gap-3 rounded-2xl border border-dashed " +
//         "border-sky-400/28 bg-sky-500/[0.07] px-3 py-2.5 text-left text-sky-50 " +
//         "transition-colors duration-200 hover:border-sky-300/42 hover:bg-sky-500/12"
//       }
//     >
//       {/* Plus icon box */}
//       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/12">
//         <Plus className="h-4.5 w-4.5 text-sky-300" strokeWidth={2.5} />
//       </div>

//       {/* Label */}
//       <AnimatePresence initial={false}>
//         {isExpanded && (
//           <motion.div
//             initial={{ opacity: 0, x: -10 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -10 }}
//             transition={{ duration: 0.16 }}
//             className="min-w-0 flex-1"
//           >
//             <p className="truncate text-[13px] font-semibold text-sky-100">
//               Create organization
//             </p>
//             <p className="truncate text-[11px] text-sky-300/60">
//               Add a fresh classroom hub
//             </p>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Sparkle badge */}
//       <AnimatePresence initial={false}>
//         {isExpanded && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.7 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.7 }}
//             transition={{ type: "spring", stiffness: 340, damping: 20 }}
//             className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-400/15"
//           >
//             <Sparkles className="h-3.5 w-3.5 text-sky-300" />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );

//   const triggerButton = (
//     <button type="button" className="block w-full text-left">
//       {trigger}
//     </button>
//   );

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         {isExpanded ? (
//           triggerButton
//         ) : (
//           <Hint
//             label="Create organization"
//             side="right"
//             align="center"
//             sideOffset={16}
//           >
//             {triggerButton}
//           </Hint>
//         )}
//       </DialogTrigger>

//       <DialogContent className="max-w-[480px] border-none bg-transparent p-0 shadow-none">
//         <CreateOrganization />
//       </DialogContent>
//     </Dialog>
//   );
// };




"use client";

import { CreateOrganization } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";

import { Hint } from "@/components/hint";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type NewButtonProps = {
  isExpanded: boolean;
  /** Renders a slim row style for use inside the OrgSwitcher dropdown */
  compact?: boolean;
  /** Called after the dialog closes so the parent can close its popover */
  onCreated?: () => void;
};

export const NewButton = ({ isExpanded, compact = false, onCreated }: NewButtonProps) => {
  // ── Compact variant: a plain text row for inside the switcher dropdown ──
  if (compact) {
    return (
      <Dialog onOpenChange={(open) => { if (!open) onCreated?.(); }}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/6"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/10">
              <Plus className="h-4 w-4 text-sky-300" strokeWidth={2.5} />
            </div>
            <p className="text-[13px] font-medium text-slate-300">Create new workspace</p>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-[480px] border-none bg-transparent p-0 shadow-none">
          <CreateOrganization />
        </DialogContent>
      </Dialog>
    );
  }

  // ── Full variant: used standalone if ever needed elsewhere ──
  const trigger = (
    <motion.div
      whileHover={{ y: -2, scale: 1.012 }}
      whileTap={{ scale: 0.982 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      className={cn(
        "relative flex min-h-[52px] items-center gap-3 rounded-2xl border border-dashed px-3 py-2.5 text-left",
        "border-sky-400/28 bg-sky-500/[0.07] text-sky-50",
        "transition-colors duration-200 hover:border-sky-300/42 hover:bg-sky-500/12",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/12">
        <Plus className="h-[18px] w-[18px] text-sky-300" strokeWidth={2.5} />
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.16 }}
            className="min-w-0 flex-1"
          >
            <p className="truncate text-[13px] font-semibold text-sky-100">Create organization</p>
            <p className="truncate text-[11px] text-sky-300/60">Add a fresh classroom hub</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 340, damping: 20 }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-400/15"
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-300" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const triggerButton = (
    <button type="button" className="block w-full text-left">
      {trigger}
    </button>
  );

  return (
    <Dialog onOpenChange={(open) => { if (!open) onCreated?.(); }}>
      <DialogTrigger asChild>
        {isExpanded ? (
          triggerButton
        ) : (
          <Hint label="Create organization" side="right" align="center" sideOffset={16}>
            {triggerButton}
          </Hint>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[480px] border-none bg-transparent p-0 shadow-none">
        <CreateOrganization />
      </DialogContent>
    </Dialog>
  );
};