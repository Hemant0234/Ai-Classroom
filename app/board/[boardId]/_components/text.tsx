import { Kalam } from "next/font/google";
import ContentEditable, {
  type ContentEditableEvent,
} from "react-contenteditable";

import { cn, colorToCSS } from "@/lib/utils";
import { useMutation } from "@/liveblocks.config";
import type { TextLayer } from "@/types/canvas";

const font = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

const calculateFontSize = (width: number, height: number) => {
  // We use a fixed base font size for new infinite-expanding text
  // so that typing doesn't recursively scale the text infinitely.
  // Old components might rely on height, but this keeps it consistent.
  return 48;
};

type TextProps = {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
};

export const Text = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: TextProps) => {
  const { x, y, width, height, fill, value } = layer;

  const updateValueAndSize = useMutation(({ storage }, newValue: string, reqWidth: number, reqHeight: number) => {
    const liveLayers = storage.get("layers");
    const liveLayer = liveLayers.get(id);
    if (!liveLayer) return;

    liveLayer.update({
      value: newValue,
      width: Math.max(width, reqWidth),
      height: Math.max(height, reqHeight),
    });
  }, [width, height, id]);

  const handleContentChange = (e: ContentEditableEvent) => {
    // Determine internal required width by measuring via scrollWidth
    let reqWidth = width;
    let reqHeight = height;

    // We can extract the target element to measure accurately
    const target = e.currentTarget as HTMLElement;
    if (target) {
      reqWidth = target.scrollWidth;
      reqHeight = target.scrollHeight;
    }

    updateValueAndSize(e.target.value, reqWidth, reqHeight);
  };

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        outline: selectionColor ? `1px solid ${selectionColor}` : "none",
      }}
    >
      <ContentEditable
        html={value || ""}
        onChange={handleContentChange}
        className={cn(
          "h-full w-full drop-shadow-md outline-none whitespace-nowrap",
          font.className,
        )}
        style={{
          fontSize: calculateFontSize(width, height),
          color: fill ? colorToCSS(fill) : "#000",
          width: "max-content",
          minWidth: "100%",
          minHeight: "100%",
        }}
      />
    </foreignObject>
  );
};
