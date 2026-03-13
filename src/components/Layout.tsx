import { ReactNode } from "react";
import Navbar from "./Navbar";
import StatusBubble from "./StatusBubble";

interface LayoutProps {
  children: ReactNode;
  noScroll?: boolean;
}

const Layout = ({ children, noScroll }: LayoutProps) => {
  return (
    <div className={`min-h-screen ${noScroll ? "h-screen overflow-hidden" : ""}`}>
      <StatusBubble />
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
