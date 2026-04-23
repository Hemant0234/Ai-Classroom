"use client";

import { useMemo, type ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  Clock3,
  Code2,
  Compass,
  Flame,
  PlayCircle,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";

type DashboardHomeProps = {
  orgId: string;
};

type WorkspaceItem = {
  _id: string;
  title: string;
  authorName: string;
  authorId: string;
  _creationTime: number;
  type: "board" | "compiler";
  isFavourite?: boolean;
};

const hoverLift = {
  whileHover: {
    y: -6,
    scale: 1.01,
    boxShadow: "0 28px 70px rgba(15,23,42,0.14)",
  },
  whileTap: { scale: 0.985, y: -2 },
  transition: { type: "spring", stiffness: 280, damping: 22 },
} as const;

const fadeInUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
} as const;

const WidgetShell = ({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: {
  title: string;
  eyebrow: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <motion.section
    {...fadeInUp}
    {...hoverLift}
    className={`rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl ${className}`}
  >
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>
      {action}
    </div>
    {children}
  </motion.section>
);

const RowItem = ({
  href,
  title,
  meta,
  badge,
  accent,
}: {
  href: string;
  title: string;
  meta: string;
  badge: string;
  accent: ReactNode;
}) => (
  <motion.div {...hoverLift}>
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3 transition-colors hover:border-slate-300"
    >
      <div className="flex min-w-0 items-center gap-3">
        <motion.div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"
          whileHover={{ rotate: -4, scale: 1.06 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          {accent}
        </motion.div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          <p className="truncate text-xs text-slate-500">{meta}</p>
        </div>
      </div>
      <div className="ml-3 flex items-center gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {badge}
        </span>
        <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.18 }}>
          <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700" />
        </motion.div>
      </div>
    </Link>
  </motion.div>
);

export const DashboardHome = ({ orgId }: DashboardHomeProps) => {
  const { user } = useUser();
  const router = useRouter();
  const boards = useQuery(api.boards.get, { orgId });
  const favouriteBoards = useQuery(api.boards.get, { orgId, favourites: "1" });
  const compilers = useQuery(api.compilers.get, { orgId });

  const { mutate: createBoard, pending: creatingBoard } = useApiMutation(
    api.board.create
  );
  const { mutate: createCompiler, pending: creatingCompiler } = useApiMutation(
    api.compiler.create
  );

  const isLoading =
    boards === undefined || favouriteBoards === undefined || compilers === undefined;

  const recentBoards = (boards ?? []).slice(0, 4);
  const recentCompilers = (compilers ?? []).slice(0, 4);
  const favouriteItems = (favouriteBoards ?? []).slice(0, 4);

  const recentWorkspace = useMemo(() => {
    const items: WorkspaceItem[] = [
      ...(boards ?? []).map((item) => ({ ...item, type: "board" as const })),
      ...(compilers ?? []).map((item) => ({
        ...item,
        type: "compiler" as const,
      })),
    ];

    return items.sort((a, b) => b._creationTime - a._creationTime)[0];
  }, [boards, compilers]);

  const stats = useMemo(() => {
    const boardCount = boards?.length ?? 0;
    const compilerCount = compilers?.length ?? 0;
    const favouriteCount = favouriteBoards?.length ?? 0;
    const creators = new Set([
      ...(boards ?? []).map((item) => item.authorId),
      ...(compilers ?? []).map((item) => item.authorId),
    ]);

    return [
      {
        label: "Classes",
        value: String(boardCount),
        icon: <Compass className="h-4 w-4" />,
      },
      {
        label: "Compiler Labs",
        value: String(compilerCount),
        icon: <Code2 className="h-4 w-4" />,
      },
      {
        label: "Favorites",
        value: String(favouriteCount),
        icon: <Star className="h-4 w-4" />,
      },
      {
        label: "Active Creators",
        value: String(creators.size),
        icon: <Users className="h-4 w-4" />,
      },
    ];
  }, [boards, compilers, favouriteBoards]);

  const activeUsers = useMemo(() => {
    const scoreboard = new Map<
      string,
      { name: string; boards: number; compilers: number }
    >();

    for (const item of boards ?? []) {
      const current = scoreboard.get(item.authorId) ?? {
        name: item.authorName,
        boards: 0,
        compilers: 0,
      };
      current.boards += 1;
      scoreboard.set(item.authorId, current);
    }

    for (const item of compilers ?? []) {
      const current = scoreboard.get(item.authorId) ?? {
        name: item.authorName,
        boards: 0,
        compilers: 0,
      };
      current.compilers += 1;
      scoreboard.set(item.authorId, current);
    }

    return Array.from(scoreboard.values())
      .sort(
        (a, b) =>
          b.boards + b.compilers - (a.boards + a.compilers) ||
          b.compilers - a.compilers
      )
      .slice(0, 4);
  }, [boards, compilers]);

  const aiSuggestions = useMemo(() => {
    const suggestions = [];

    if (recentWorkspace) {
      suggestions.push({
        title: `Continue ${
          recentWorkspace.type === "board" ? "class board" : "compiler lab"
        }`,
        description: `Jump back into "${recentWorkspace.title}" and pick up where the team left off.`,
        href:
          recentWorkspace.type === "board"
            ? `/board/${recentWorkspace._id}`
            : `/compiler/${recentWorkspace._id}`,
      });
    }

    if ((boards?.length ?? 0) < 3) {
      suggestions.push({
        title: "Create a structured class flow",
        description:
          "Add separate boards for lecture notes, revision, and assignments to make the classroom easier to navigate.",
        href: "/",
      });
    }

    if ((compilers?.length ?? 0) > 0) {
      suggestions.push({
        title: "Turn your latest compiler into a lab",
        description:
          "Use starter templates plus shared input/output to run guided coding sessions with everyone synced.",
        href: `/compiler/${recentCompilers[0]?._id ?? ""}`,
      });
    }

    if ((favouriteBoards?.length ?? 0) > 0) {
      suggestions.push({
        title: "Promote favorites as quick-start sessions",
        description:
          "Your favorite boards can become reusable lesson launchpads for revision and recurring classes.",
        href: "/?favourites=1",
      });
    }

    return suggestions.slice(0, 3);
  }, [recentWorkspace, boards, compilers, favouriteBoards, recentCompilers]);

  const handleCreateBoard = () => {
    createBoard({ orgId, title: "Untitled" })
      .then((id) => {
        toast.success("Board created.");
        router.push(`/board/${id}`);
      })
      .catch(() => toast.error("Failed to create board."));
  };

  const handleCreateCompiler = () => {
    createCompiler({ orgId, title: "Untitled Compiler" })
      .then((id) => {
        toast.success("Compiler created.");
        router.push(`/compiler/${id}`);
      })
      .catch(() => toast.error("Failed to create compiler."));
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="premium-shimmer h-48 rounded-[28px] xl:col-span-12" />
          <div className="premium-shimmer h-80 rounded-[28px] xl:col-span-7" />
          <div className="premium-shimmer h-80 rounded-[28px] xl:col-span-5" />
          <div className="premium-shimmer h-64 rounded-[28px] xl:col-span-4" />
          <div className="premium-shimmer h-64 rounded-[28px] xl:col-span-4" />
          <div className="premium-shimmer h-64 rounded-[28px] xl:col-span-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-6">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-6">
        <motion.section
          {...fadeInUp}
          className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,#1d4ed8,transparent_38%),linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#111827_100%)] p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]"
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                Premium Classroom Dashboard
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
                  Welcome back, {user?.firstName || "Creator"}.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
                  Your classroom now lives in a widget-based command center:
                  recent classes, coding labs, favorites, suggestions, and
                  progress signals in one premium view.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={handleCreateBoard}
                  disabled={creatingBoard}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-70"
                  whileHover={{ y: -2, scale: 1.01, boxShadow: "0 14px 30px rgba(255,255,255,0.18)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus className="mr-2 inline h-4 w-4" />
                  Create class board
                </motion.button>
                <motion.button
                  onClick={handleCreateCompiler}
                  disabled={creatingCompiler}
                  className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-70"
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Code2 className="mr-2 inline h-4 w-4" />
                  Launch coding lab
                </motion.button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  {...hoverLift}
                  className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="text-sm font-medium">{stat.label}</span>
                    {stat.icon}
                  </div>
                  <div className="mt-5 text-3xl font-semibold">{stat.value}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-12">
          <WidgetShell
            title="Recent Classes"
            eyebrow="Continue Learning"
            className="xl:col-span-7"
            action={
              <Link
                href="/"
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                View all
              </Link>
            }
          >
            <div className="space-y-3">
              {recentBoards.length ? (
                recentBoards.map((board) => (
                  <RowItem
                    key={board._id}
                    href={`/board/${board._id}`}
                    title={board.title}
                    meta={`Created ${formatDistanceToNow(board._creationTime, {
                      addSuffix: true,
                    })} by ${board.authorName}`}
                    badge="Board"
                    accent={<Compass className="h-5 w-5" />}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No class boards yet. Create your first board to start the
                  dashboard story.
                </div>
              )}
            </div>
          </WidgetShell>

          <WidgetShell
            title="AI Suggestions"
            eyebrow="Smart Guidance"
            className="xl:col-span-5"
            action={<Bot className="h-5 w-5 text-sky-500" />}
          >
            <div className="space-y-3">
              {aiSuggestions.map((item, index) => (
                <motion.div key={`${item.title}-${index}`} {...hoverLift}>
                <Link
                  key={`${item.title}-${index}`}
                  href={item.href}
                  className="block rounded-2xl border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_100%)] p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    <Sparkles className="mt-1 h-4 w-4 shrink-0 text-indigo-500" />
                  </div>
                </Link>
                </motion.div>
              ))}
            </div>
          </WidgetShell>

          <WidgetShell
            title="Activity Stats"
            eyebrow="Momentum"
            className="xl:col-span-4"
            action={<Activity className="h-5 w-5 text-emerald-500" />}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Total workspaces
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {(boards?.length ?? 0) + (compilers?.length ?? 0)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Fresh this week
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {
                    [...(boards ?? []), ...(compilers ?? [])].filter(
                      (item) =>
                        Date.now() - item._creationTime < 1000 * 60 * 60 * 24 * 7
                    ).length
                  }
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Favorite ratio
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {(boards?.length ?? 0) > 0
                    ? `${Math.round(
                        ((favouriteBoards?.length ?? 0) / (boards?.length ?? 1)) *
                          100
                      )}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </WidgetShell>

          <WidgetShell
            title="Active Users"
            eyebrow="Contributors"
            className="xl:col-span-4"
            action={<Users className="h-5 w-5 text-amber-500" />}
          >
            <div className="space-y-3">
              {activeUsers.length ? (
                activeUsers.map((person, index) => (
                  <motion.div
                    key={`${person.name}-${index}`}
                    {...hoverLift}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                        {person.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {person.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {person.boards} boards · {person.compilers} labs
                        </p>
                      </div>
                    </div>
                    <Flame className="h-4 w-4 text-orange-500" />
                  </motion.div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Contributors will appear here once the team starts creating
                  workspaces.
                </div>
              )}
            </div>
          </WidgetShell>

          <WidgetShell
            title="Recent Compiler Runs"
            eyebrow="Coding Labs"
            className="xl:col-span-4"
            action={
              <Link
                href="/compiler"
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Open labs
              </Link>
            }
          >
            <div className="space-y-3">
              {recentCompilers.length ? (
                recentCompilers.map((compiler) => (
                  <RowItem
                    key={compiler._id}
                    href={`/compiler/${compiler._id}`}
                    title={compiler.title}
                    meta={`Opened ${formatDistanceToNow(compiler._creationTime, {
                      addSuffix: true,
                    })} by ${compiler.authorName}`}
                    badge="Lab"
                    accent={<PlayCircle className="h-5 w-5" />}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No coding labs yet. Launch one to populate your recent run
                  feed.
                </div>
              )}
            </div>
          </WidgetShell>

          <WidgetShell
            title="Favorites"
            eyebrow="Pinned Essentials"
            className="xl:col-span-6"
            action={<Star className="h-5 w-5 text-yellow-500" />}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {favouriteItems.length ? (
                favouriteItems.map((board) => (
                  <motion.div key={board._id} {...hoverLift}>
                  <Link
                    key={board._id}
                    href={`/board/${board._id}`}
                    className="group rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {board.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Favorite board by {board.authorName}
                        </p>
                      </div>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                    </div>
                  </Link>
                  </motion.div>
                ))
              ) : (
                <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Star important boards and they’ll show up here for instant
                  access.
                </div>
              )}
            </div>
          </WidgetShell>

          <WidgetShell
            title="Continue Session"
            eyebrow="Resume Fast"
            className="xl:col-span-6"
            action={<Clock3 className="h-5 w-5 text-sky-500" />}
          >
            {recentWorkspace ? (
              <motion.div {...hoverLift}>
              <Link
                href={
                  recentWorkspace.type === "board"
                    ? `/board/${recentWorkspace._id}`
                    : `/compiler/${recentWorkspace._id}`
                }
                className="block rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Next best session
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      {recentWorkspace.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Last updated {formatDistanceToNow(recentWorkspace._creationTime, {
                        addSuffix: true,
                      })}. Jump back into this{" "}
                      {recentWorkspace.type === "board" ? "class board" : "compiler lab"}{" "}
                      and continue the session.
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
                    Continue now
                    <TrendingUp className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
              </motion.div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
                Once you create a board or lab, the dashboard will surface it
                here as your continue-session shortcut.
              </div>
            )}
          </WidgetShell>
        </div>
      </div>
    </div>
  );
};
