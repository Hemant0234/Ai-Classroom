"use client";

import { useOrganization } from "@clerk/nextjs";

import { BoardList } from "./_components/board-list";
import { DashboardHome } from "./_components/dashboard-home";
import { EmptyOrg } from "./_components/empty-org";

type DashboardPageProps = {
  searchParams: {
    search?: string;
    favourites?: string;
  };
};

const DashboardPage = ({ searchParams }: DashboardPageProps) => {
  const { organization } = useOrganization();
  const hasFilters = !!searchParams.search || !!searchParams.favourites;

  return (
    <div className="flex-1 h-[calc(100%-80px)]">
      {!organization ? (
        <EmptyOrg />
      ) : hasFilters ? (
        <div className="p-6">
          <BoardList orgId={organization.id} query={searchParams} />
        </div>
      ) : (
        <DashboardHome orgId={organization.id} />
      )}
    </div>
  );
};

export default DashboardPage;
