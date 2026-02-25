"use client";
import { useState } from "react";
import { Github } from "lucide-react";
import { PhoneCall } from 'lucide-react';
import { Cpu } from 'lucide-react';
import { Braces } from 'lucide-react';
import { motion } from "framer-motion";
import Image from "next/image";

const App = () => {
  return (
    <PhoneCall />
  );
};

export default App;


import { Hint } from "@/components/hint";
import { links } from "@/config";
import { useConnectModal } from "@/store/use-connect-modal";
import { useAiPanel } from "@/store/use-ai-panel";

import { List } from "./list";
import { NewButton } from "./new-button";

export const Sidebar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const connectModal = useConnectModal();
  const aiModal = useAiPanel();

  return (
    <aside className="fixed z-[1] left-0 bg-blue-950 h-full w-[60px] flex p-3 flex-col justify-between text-white">
      <div className="flex flex-col gap-y-4">
        <List />
        <NewButton />
      </div>

      <div className="aspect-square flex flex-col gap-1">
        <div
          onClick={() => aiModal.toggle()}
          className="bg-slate-600 h-full w-full flex items-center justify-center rounded-md opacity-60 hover:opacity-100 transition cursor-pointer"
        >
          <Hint label="AI Help (Global)" side="right" align="start" sideOffset={18}>
            <Cpu className="text-white h-5 w-5" />
          </Hint>
        </div>
        <div className="aspect-square flex flex-col gap-1">
          <Hint label="Connect" side="right" align="start" sideOffset={18}>
            <button
              onClick={() => connectModal.onOpen()}
              className="bg-slate-600 h-full w-full flex items-center justify-center rounded-md opacity-60 hover:opacity-100 transition"
            >
              <PhoneCall className="text-white h-5 w-5" />
            </button>
          </Hint>
        </div>

        <Hint label="Source Code" side="right" align="start" sideOffset={18}>
          <a
            href={links.sourceCode}
            target="_blank"
            rel="noreferrer noopener"
            className="bg-slate-600 h-full w-full flex items-center justify-center rounded-md opacity-60 hover:opacity-100 transition"
          >

            <Github className="text-white h-5 w-5" />
          </a>
        </Hint>


        <div className="relative">

          <div
            className="bg-slate-600 h-full w-full flex items-center justify-center rounded-md opacity-60 hover:opacity-100 transition cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Braces className="text-white h-5 w-5" />
          </div>

          {isOpen && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed top-0 left-0 h-full w-80 bg-gray-800 text-white shadow-lg p-4 flex flex-col space-y-4"
            >
              <div className="flex justify-between">
                <Image src="/cu2.png" alt="CU Logo" width={260} height={500} className="mb-4" />
                <div
                  className=" cursor-pointer text-white text-xl"
                  onClick={() => setIsOpen(false)}>
                  ✖
                </div>
              </div>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Developers</h2>

              </div>
              <table className="w-full border-collapse border border-gray-600 text-left">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="border border-gray-600 px-4 py-2">UID</th>
                    <th className="border border-gray-600 px-4 py-2">Name</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-600 px-4 py-2">23BCS11726</td>
                    <td className="border border-gray-600 px-4 py-2">Hemant Dhaka</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-600 px-4 py-2">23BCS11981</td>
                    <td className="border border-gray-600 px-4 py-2">Vishal</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-600 px-4 py-2">23BCS12249</td>
                    <td className="border border-gray-600 px-4 py-2">Ronak Yadav</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-600 px-4 py-2">23BCS13083</td>
                    <td className="border border-gray-600 px-4 py-2">Ujjwal</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-4 border-t border-gray-600 pt-2">
                <h2 className="text-lg font-semibold">Under Guidance of</h2>
                <h3 className="text-md font-semibold mt-2">Supervisor</h3>
                <table className="w-full border-collapse border border-gray-600 text-left mt-2">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="border border-gray-600 px-4 py-2">E-Code</th>
                      <th className="border border-gray-600 px-4 py-2">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-600 px-4 py-2">E14843</td>
                      <td className="border border-gray-600 px-4 py-2">Er. Navneet</td>
                    </tr>
                  </tbody>
                </table>
                <h3 className="text-md font-semibold mt-4">Evaluation Panelists</h3>
                <table className="w-full border-collapse border border-gray-600 text-left mt-2">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="border border-gray-600 px-4 py-2">E-Code</th>
                      <th className="border border-gray-600 px-4 py-2">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-600 px-4 py-2">E12859</td>
                      <td className="border border-gray-600 px-4 py-2">Monika Anand</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-600 px-4 py-2">E16835</td>
                      <td className="border border-gray-600 px-4 py-2">Er. Rashmi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </aside>
  );
};
