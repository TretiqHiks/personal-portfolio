import { NavLink } from "@/components/NavLink";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/experience", label: "Experience" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex justify-center pt-4 px-4"
    >
      {/* Desktop nav */}
      {!isMobile && (
        <div className="glass rounded-full px-2 py-1.5 flex items-center gap-1 glow-blue">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground"
              activeClassName="bg-primary/15 text-foreground"
              end={link.to === "/"}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Mobile nav */}
      {isMobile && (
        <div className="w-full flex justify-between items-center">
          <span className="text-sm font-semibold text-foreground pl-1">AK</span>
          <button
            onClick={() => setOpen(!open)}
            className="glass rounded-full p-2.5 glow-blue"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      )}

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobile && open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[72px] z-50 px-4"
          >
            <div className="glass-strong rounded-2xl p-3 flex flex-col gap-1 glow-blue">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground"
                  activeClassName="bg-primary/15 text-foreground"
                  end={link.to === "/"}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
