// import { OrganizationProfile } from "@clerk/nextjs";
// import { Plus } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// export const InviteButton = () => {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline">
//           <Plus className="h-4 w-4 mr-2" />
//           Invite members
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="p-0 bg-transparent border-none max-w-[880px]">
//         <OrganizationProfile />
//       </DialogContent>
//     </Dialog>
//   );
// };


"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const InviteButton = () => {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => router.push("/organization")}
    >
      <Plus className="h-4 w-4 mr-2" />
      Invite members
    </Button>
  );
};