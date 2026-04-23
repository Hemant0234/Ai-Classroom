// "use client";

// import { useOrganizationList } from "@clerk/nextjs";

// import { Item } from "./item";

// type ListProps = {
//   isExpanded: boolean;
// };

// export const List = ({ isExpanded }: ListProps) => {
//   const { userMemberships } = useOrganizationList({
//     userMemberships: {
//       infinite: true,
//     },
//   });

//   if (!userMemberships.data?.length) return null;

//   return (
//     <ul className="space-y-3">
//       {userMemberships.data.map((membership) => (
//         <Item
//           key={membership.organization.id}
//           id={membership.organization.id}
//           name={membership.organization.name}
//           imageUrl={membership.organization.imageUrl}
//           isExpanded={isExpanded}
//         />
//       ))}
//     </ul>
//   );
// };



"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";

import { Item } from "./item";

type ListProps = {
  isExpanded: boolean;
};

export const List = ({ isExpanded }: ListProps) => {
  const { userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  if (!userMemberships.data?.length) return null;

  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {userMemberships.data.map((membership, i) => (
          <motion.div
            key={membership.organization.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ delay: i * 0.04, duration: 0.18 }}
          >
            <Item
              id={membership.organization.id}
              name={membership.organization.name}
              imageUrl={membership.organization.imageUrl}
              isExpanded={isExpanded}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </ul>
  );
};