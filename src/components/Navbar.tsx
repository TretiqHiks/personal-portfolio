import { NavLink } from "@/components/NavLink";
import { motion } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/experience", label: "Experience" },
  { to: "/projects", label: "Projects" },
];

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex justify-center pt-4"
    >
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
    </motion.nav>
  );
};

export default Navbar;
