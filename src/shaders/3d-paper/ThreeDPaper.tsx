import { useEffect, useRef, useState, type CSSProperties } from "react";

import threeDPaperSource from "./sources/3d-paper.html?raw";
import certificateSource from "./sources/3d-paper-certificate.html?raw";
import japaneseSource from "./sources/3d-paper-japanese.html?raw";
import siteOfTheYearSource from "./sources/3d-paper-site-of-the-year.html?raw";

export type ThreeDPaperVariant = "original" | "site-of-the-year" | "japanese" | "certificate";

export type ThreeDPaperProps = {
  className?: string;
  style?: CSSProperties;
  variant?: ThreeDPaperVariant;
  imageUrl?: string;
};

const sources: Record<ThreeDPaperVariant, string> = {
  original: threeDPaperSource,
  "site-of-the-year": siteOfTheYearSource,
  japanese: japaneseSource,
  certificate: certificateSource,
};

const titles: Record<ThreeDPaperVariant, string> = {
  original: "3D Paper",
  "site-of-the-year": "3D Paper - Site of the Year",
  japanese: "3D Paper - Japanese",
  certificate: "3D Paper - Certificate",
};

export function ThreeDPaper({ className = "", style, variant = "original", imageUrl }: ThreeDPaperProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [documentVisible, setDocumentVisible] = useState(() => (
    typeof document === "undefined" || !document.hidden
  ));
  const [hostVisible, setHostVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setHostVisible(entry?.isIntersecting ?? true);
    }, { rootMargin: "80px" });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const update = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const mounted = hostVisible && documentVisible;

  useEffect(() => {
    setReady(false);
  }, [mounted, variant]);

  // Inject image when ready
  useEffect(() => {
    if (!ready || !imageUrl || !iframeRef.current) return;
    try {
      const cw = iframeRef.current.contentWindow as any;
      if (cw && cw.__sheet && cw.THREE) {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const s = 1024;
          const c = document.createElement("canvas");
          c.width = s; c.height = s;
          const ctx = c.getContext("2d");
          if (!ctx) return;
          // Fill black background
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, s, s);
          
          // Draw image contained or covered
          const scale = Math.min(s/img.width, s/img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, (s-w)/2, (s-h)/2, w, h);
          
          const tex = new cw.THREE.CanvasTexture(c);
          tex.encoding = cw.THREE.sRGBEncoding;
          cw.__sheet.mat.map = tex;
          cw.__sheet.mat.needsUpdate = true;
        };
        img.src = imageUrl;
      }
    } catch (e) {
      console.error("Could not inject image to 3D Paper", e);
    }
  }, [ready, imageUrl]);

  return (
    <div
      ref={hostRef}
      className={`threeui-background three-d-paper${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Interactive translucent 3D paper certificate"
      data-state={!mounted ? "paused" : ready ? "ready" : "loading"}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "transparent",
        pointerEvents: "auto",
        ...style,
      }}
    >
      {mounted ? (
        <iframe
          ref={iframeRef}
          title={titles[variant]}
          srcDoc={sources[variant]}
          sandbox="allow-scripts allow-same-origin"
          loading="eager"
          onLoad={() => setReady(true)}
          style={{
            position: "absolute",
            inset: 0,
            display: "block",
            width: "100%",
            height: "100%",
            border: 0,
            background: "transparent",
            opacity: ready ? 1 : 0,
            pointerEvents: ready ? "auto" : "none",
            transition: "opacity 240ms ease-out",
          }}
        />
      ) : null}
    </div>
  );
}
