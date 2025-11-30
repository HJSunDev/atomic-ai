import { useRef } from "react";
import { cn } from "@/lib/utils";

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

interface HTMLPreviewRendererProps {
  html: string;
  device: PreviewDevice;
}

/**
 * HTMLPreviewRenderer - HTML 预览渲染器
 * 
 * 职责：
 * - 在 iframe 中渲染 HTML 内容
 * - 处理设备模拟（尺寸调整）
 */
export const HTMLPreviewRenderer = ({ html, device }: HTMLPreviewRendererProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getDeviceStyle = () => {
    switch (device) {
      case 'mobile':
        return {
          width: '375px',
          height: 'calc(100% - 2rem)',
          containerClass: "w-[375px] my-4 rounded-[2rem] border-4 border-gray-800 dark:border-gray-700 overflow-hidden"
        };
      case 'tablet':
        return {
          width: '768px',
          height: 'calc(100% - 2rem)',
          containerClass: "w-[768px] my-4 rounded-lg border-gray-200 dark:border-gray-800"
        };
      case 'desktop':
      default:
        return {
          width: '100%',
          height: '100%',
          containerClass: "w-full h-full border-none"
        };
    }
  };

  const { width, height, containerClass } = getDeviceStyle();

  return (
    <div className="h-full flex items-center justify-center bg-gray-100/50 dark:bg-slate-950/50 overflow-auto">
      <div
        className={cn(
          "transition-all duration-300 bg-white shadow-lg border h-full",
          containerClass
        )}
        style={{ width, height }}
      >
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none"
          title="HTML Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          srcDoc={html}
        />
      </div>
    </div>
  );
};

