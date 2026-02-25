import { OrganizationProfile } from "@clerk/nextjs";

export default function OrganizationPage() {
  return (
    <div className="flex justify-center p-6">
      <OrganizationProfile />
    </div>
  );
}