"use client";

import { useMemo, useState } from "react";
import {
  Braces,
  ChevronRight,
  Code,
  Cpu,
  LayoutDashboard,
  PhoneCall,
  Star,
  X,
  ChevronsUpDown,
  Building2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  UserButton,
  useUser,
  useOrganization,
  useOrganizationList,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Hint } from "@/components/hint";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAiPanel } from "@/store/use-ai-panel";
import { useConnectModal } from "@/store/use-connect-modal";

import { NewButton } from "./new-button";

// ─── Motion presets ───────────────────────────────────────────────────────────
const railSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
  mass: 0.9,
};

const fadeSlide = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { duration: 0.16 },
};

// ─── Accent map ───────────────────────────────────────────────────────────────
type Accent = "blue" | "violet" | "emerald" | "rose";

const accentMap: Record<
  Accent,
  { item: string; icon: string; text: string; chevron: string; shadow: string; bar: string }
> = {
  blue: {
    item:    "border-sky-400/35 bg-gradient-to-r from-sky-500/15 via-sky-500/6 to-transparent",
    icon:    "border-sky-400/25 bg-sky-500/12",
    text:    "text-sky-100",
    chevron: "text-sky-300",
    shadow:  "shadow-[0_10px_28px_rgba(14,165,233,0.18)]",
    bar:     "bg-sky-400",
  },
  violet: {
    item:    "border-violet-400/35 bg-gradient-to-r from-violet-500/15 via-violet-500/6 to-transparent",
    icon:    "border-violet-400/25 bg-violet-500/12",
    text:    "text-violet-100",
    chevron: "text-violet-300",
    shadow:  "shadow-[0_10px_28px_rgba(139,92,246,0.16)]",
    bar:     "bg-violet-400",
  },
  emerald: {
    item:    "border-emerald-400/35 bg-gradient-to-r from-emerald-500/15 via-emerald-500/6 to-transparent",
    icon:    "border-emerald-400/25 bg-emerald-500/12",
    text:    "text-emerald-100",
    chevron: "text-emerald-300",
    shadow:  "shadow-[0_10px_28px_rgba(16,185,129,0.15)]",
    bar:     "bg-emerald-400",
  },
  rose: {
    item:    "border-rose-400/35 bg-gradient-to-r from-rose-500/15 via-rose-500/6 to-transparent",
    icon:    "border-rose-400/25 bg-rose-500/12",
    text:    "text-rose-100",
    chevron: "text-rose-300",
    shadow:  "shadow-[0_10px_28px_rgba(244,63,94,0.14)]",
    bar:     "bg-rose-400",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
type NavItem = {
  href?: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  isActive?: boolean;
  onClick?: () => void;
  accent?: Accent;
  badge?: string;
};

// ─── SidebarLink ─────────────────────────────────────────────────────────────
const SidebarLink = ({
  href,
  icon: Icon,
  isExpanded,
  label,
  description,
  isActive,
  onClick,
  accent = "blue",
  badge,
}: NavItem & { isExpanded: boolean }) => {
  const c = accentMap[accent];

  const inner = (
    <motion.div
      whileHover={{ y: -2, scale: 1.012 }}
      whileTap={{ scale: 0.982 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      className={cn(
        "group relative flex min-h-[52px] items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors duration-200",
        isActive
          ? cn(c.item, c.shadow)
          : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/15 hover:bg-white/[0.07]",
      )}
    >
      {/* Left accent bar */}
      {isActive && (
        <span className={cn("absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full", c.bar)} />
      )}

      {/* Icon box */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors",
          isActive
            ? c.icon
            : "border-white/8 bg-slate-900/70 group-hover:border-white/14 group-hover:bg-slate-800/60",
        )}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px] transition-colors",
            isActive ? c.text : "text-slate-400 group-hover:text-slate-200",
          )}
        />
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div {...fadeSlide} className="min-w-0 flex-1">
            <p className={cn("truncate text-[13px] font-semibold", isActive ? c.text : "text-slate-200")}>
              {label}
            </p>
            {description && (
              <p className="truncate text-[11px] leading-tight text-slate-500">{description}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div {...fadeSlide} className="flex shrink-0 items-center">
            {badge ? (
              <span className="rounded-md bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                {badge}
              </span>
            ) : (
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-all duration-200 group-hover:translate-x-0.5",
                  isActive ? c.chevron : "text-slate-600",
                )}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const wrapped = href ? (
    <Link href={href} className="block">{inner}</Link>
  ) : (
    <button type="button" onClick={onClick} className="block w-full text-left">{inner}</button>
  );

  if (isExpanded) return wrapped;
  return (
    <Hint label={label} side="right" align="center" sideOffset={16}>
      {wrapped}
    </Hint>
  );
};

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ isExpanded, children }: { isExpanded: boolean; children: string }) => (
  <AnimatePresence initial={false}>
    {isExpanded && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.14 }}
        className="px-3 text-[10.5px] font-semibold uppercase tracking-[0.3em] text-slate-600"
      >
        {children}
      </motion.p>
    )}
  </AnimatePresence>
);

// ─── Org avatar helper ────────────────────────────────────────────────────────
const OrgAvatar = ({
  imageUrl,
  name,
  size = "md",
}: {
  imageUrl?: string | null;
  name?: string;
  size?: "sm" | "md";
}) => {
  const dim = size === "sm" ? "h-8 w-8 rounded-lg" : "h-8 w-8 rounded-xl";
  return (
    <div className={cn("relative shrink-0 overflow-hidden border border-white/10 bg-slate-800", dim)}>
      {imageUrl ? (
        <Image src={imageUrl} alt={name ?? "Org"} fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Building2 className={cn("text-slate-500", size === "sm" ? "h-3 w-3" : "h-3 w-3")} />
        </div>
      )}
    </div>
  );
};

// ─── Org Switcher ─────────────────────────────────────────────────────────────
/**
 * Replaces the old <List /> + <NewButton /> inline approach.
 * Shows the active org in the footer. On expand + click, a
 * small popover lets the user switch to another workspace or
 * create a new one — without cluttering the nav rail at all.
 */
const OrgSwitcher = ({ isExpanded }: { isExpanded: boolean }) => {
  const { organization } = useOrganization();
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const [open, setOpen] = useState(false);

  const others =
    userMemberships.data?.filter((m) => m.organization.id !== organization?.id) ?? [];

  const canSwitch = others.length > 0;

  const handleSwitch = (id: string) => {
    setActive?.({ organization: id });
    setOpen(false);
  };

  const trigger = (
    <motion.button
      type="button"
      onClick={() => isExpanded && canSwitch && setOpen((o) => !o)}
      whileHover={{ y: -1.5, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left",
        "border-white/8 bg-white/[0.04] transition-colors duration-200",
        "hover:border-white/15 hover:bg-white/[0.07]",
        open && "border-sky-400/20 bg-white/[0.07]",
      )}
    >
      <OrgAvatar imageUrl={organization?.imageUrl} name={organization?.name} />

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div {...fadeSlide} className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-100">
              {organization?.name ?? "No organization"}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {canSwitch
                ? `${others.length} other workspace${others.length > 1 ? "s" : ""}`
                : "Current workspace"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isExpanded && canSwitch && (
          <motion.div {...fadeSlide}>
            <ChevronsUpDown
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                open ? "text-sky-300" : "text-slate-500",
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );

  return (
    <div className="relative">
      {/* Tooltip only when collapsed */}
      {isExpanded ? (
        trigger
      ) : (
        <Hint label={organization?.name ?? "Organization"} side="right" align="center" sideOffset={16}>
          {trigger}
        </Hint>
      )}

      {/* Switch dropdown — opens upward from footer */}
      <AnimatePresence>
        {open && isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className={cn(
              "absolute bottom-full left-0 right-0 mb-2 z-50",
              "rounded-2xl border border-white/10 bg-slate-950/98 p-1.5",
              "shadow-[0_-16px_48px_rgba(2,6,23,0.5)]",
            )}
          >
            <p className="px-3 pb-2 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600">
              Switch workspace
            </p>

            <div className="space-y-0.5">
              {others.map((m) => (
                <button
                  key={m.organization.id}
                  type="button"
                  onClick={() => handleSwitch(m.organization.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/6"
                >
                  <OrgAvatar imageUrl={m.organization.imageUrl} name={m.organization.name} size="sm" />
                  <p className="truncate text-[13px] font-medium text-slate-200">
                    {m.organization.name}
                  </p>
                </button>
              ))}
            </div>

            {/* Create new org */}
            <div className="mt-1.5 border-t border-white/6 pt-1.5">
              <NewButton isExpanded={true} compact onCreated={() => setOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Team member card ─────────────────────────────────────────────────────────
const MemberCard = ({ name, id, role }: { name: string; id: string; role?: string }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-slate-900/70 px-4 py-3 transition-colors hover:bg-slate-900">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-[11px] font-bold text-sky-300">
      {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-white">{name}</p>
      <p className="truncate text-xs text-slate-500">{id}</p>
    </div>
    {role && (
      <span className="rounded-md bg-white/6 px-2 py-0.5 text-[10px] text-slate-400">{role}</span>
    )}
  </div>
);

// ─── Team Panel ───────────────────────────────────────────────────────────────
const TeamPanel = ({ onClose }: { onClose: () => void }) => (
  <AnimatePresence>
    <>
      <motion.button
        type="button"
        aria-label="Close team panel"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: -24, opacity: 0, scale: 0.98 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: -24, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed left-[108px] top-6 z-50 w-[min(580px,calc(100vw-7rem))] rounded-[28px] border border-white/10 bg-slate-950/97 p-6 text-white shadow-[0_32px_80px_rgba(2,6,23,0.5)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.36em] text-sky-400/70">
              Project Team
            </p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-tight">CU Classroom Builders</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
              Core contributors, supervision, and evaluation panel.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="my-5 h-px bg-white/8" />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Developers</p>
            </div>
            <div className="space-y-2">
              <MemberCard name="Hemant Dhaka" id="23BCS11726" />
              <MemberCard name="Vishal" id="23BCS11981" />
              <MemberCard name="Ronak Yadav" id="23BCS12249" />
              <MemberCard name="Ujjwal" id="23BCS13083" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Supervisor</p>
              </div>
              <MemberCard name="Er. Harshal Jain" id="E18792" role="Guide" />
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Evaluation Panel</p>
              </div>
              <div className="space-y-2">
                <MemberCard name="Er. Malti Rani" id="E14816" role="Evaluator" />
                <MemberCard name="Er. Monika Kumari" id="E17771" role="Evaluator" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  </AnimatePresence>
);

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export const Sidebar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const favourites = searchParams.get("favourites");
  const connectModal = useConnectModal();
  const aiPanel = useAiPanel();
  const { user } = useUser();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isTeamPanelOpen, setIsTeamPanelOpen] = useState(false);

  const workspaceItems: NavItem[] = useMemo(
    () => [
      {
        href: "/",
        icon: LayoutDashboard,
        label: "Class Boards",
        description: "Boards, tasks and shared whiteboards",
        isActive: pathname === "/" && !favourites,
        accent: "blue",
      },
      {
        href: "/compiler",
        icon: Code,
        label: "Coding Lab",
        description: "Real-time compiler rooms",
        isActive: pathname === "/compiler",
        accent: "violet",
      },
      {
        href: "/?favourites=true",
        icon: Star,
        label: "Favorites",
        description: "Starred classrooms",
        isActive: Boolean(favourites),
        accent: "emerald",
      },
    ],
    [favourites, pathname],
  );

  const quickTools: NavItem[] = useMemo(
    () => [
      {
        icon: Cpu,
        label: "AI Assistant",
        description: "Open the classroom copilot",
        onClick: () => aiPanel.toggle(),
        accent: "blue",
        badge: "NEW",
      },
      {
        icon: PhoneCall,
        label: "Start Call",
        description: "Open the floating video room",
        onClick: () => connectModal.onOpen(),
        accent: "rose",
      },
      {
        icon: Braces,
        label: "Project Team",
        description: "See developers and supervisors",
        onClick: () => setIsTeamPanelOpen(true),
        accent: "violet",
      },
    ],
    [aiPanel, connectModal],
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 288 : 88 }}
        transition={railSpring}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-full flex-col overflow-hidden",
          "border-r border-white/[0.07]",
          "bg-[radial-gradient(ellipse_60%_30%_at_50%_0%,rgba(56,189,248,0.14),transparent),linear-gradient(180deg,#06101f_0%,#0b1729_55%,#060e1c_100%)]",
          "px-4 py-5 text-white",
          "shadow-[1px_0_0_rgba(255,255,255,0.04),0_24px_60px_rgba(2,6,23,0.5)]",
          "lg:flex",
        )}
      >
        {/* ── Scrollable nav area ────────────────────────────────────────── */}
        <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto">

          {/* Logo */}
          <Link href="/" className="mb-5 block">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 340, damping: 22 }}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[13px] bg-white/95 p-1.5 shadow-md">
                <Image src="/cu2.png" alt="CU Classroom" width={38} height={38} className="rounded-lg" />
              </div>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div {...fadeSlide} className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold tracking-wide text-white">
                      CU Classroom
                    </p>
                    <p className="truncate text-[11px] text-slate-500">Premium collaboration hub</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          {/* Workspace nav */}
          <div className="space-y-2">
            <SectionLabel isExpanded={isExpanded}>Workspace</SectionLabel>
            {workspaceItems.map((item) => (
              <SidebarLink key={item.label} isExpanded={isExpanded} {...item} />
            ))}
          </div>

          {/* Quick tools */}
          <div className="mt-5 space-y-2">
            <SectionLabel isExpanded={isExpanded}>Quick Tools</SectionLabel>
            {quickTools.map((item) => (
              <SidebarLink key={item.label} isExpanded={isExpanded} {...item} />
            ))}
          </div>
        </div>

        {/* ── Footer: org switcher + user profile ───────────────────────── */}
        <div className="mt-5 space-y-2 border-t border-white/[0.07] pt-4">
          {/*
           * OrgSwitcher replaces the old <List /> + <NewButton /> pattern.
           * The active org is shown here as a compact card. When expanded,
           * clicking it opens an upward popover to switch workspaces or
           * create a new one — keeping the nav rail clean.
           */}
          <SectionLabel isExpanded={isExpanded}>Organization</SectionLabel>
          <OrgSwitcher isExpanded={isExpanded} />

          {/* User profile row */}
          <Hint
            label={user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Profile"}
            side="right"
            align="center"
            sideOffset={16}
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5 transition-colors hover:bg-white/[0.07]">
              <Avatar className="h-7 w-7 shrink-0 border border-white/10">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? "Profile"} />
                <AvatarFallback className="bg-sky-500/18 text-[12px] font-semibold text-sky-200">
                  {user?.firstName?.[0] ??
                    user?.primaryEmailAddress?.emailAddress?.[0] ??
                    "U"}
                </AvatarFallback>
              </Avatar>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div {...fadeSlide} className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {user?.fullName ?? "Workspace Member"}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {user?.primaryEmailAddress?.emailAddress ?? "Signed in"}
                      </p>
                    </div>
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{ elements: { avatarBox: "h-8 w-8" } }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Hint>
        </div>
      </motion.aside>

      {isTeamPanelOpen && <TeamPanel onClose={() => setIsTeamPanelOpen(false)} />}
    </>
  );
};