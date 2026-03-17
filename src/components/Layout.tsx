import { ReactNode } from "react";
import Navbar from "./Navbar";
import StatusBubble from "./StatusBubble";
import techBg from "@/assets/tech-bg.jpg";

interface LayoutProps {
  children: ReactNode;
  noScroll?: boolean;
}

const Layout = ({ children, noScroll }: LayoutProps) => {
  return (
    <div className={`min-h-screen relative ${noScroll ? "h-screen overflow-hidden" : ""}`}>
      {/* Tech background */}
      <div
        className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url(${techBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative z-10">
        <StatusBubble />
        <Navbar />
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
