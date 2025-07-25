import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegCalendarAlt } from "react-icons/fa";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { MdOutlinePlayCircle } from "react-icons/md";
import { FiSettings, FiX, FiLogOut } from "react-icons/fi";
import { useAuth } from '@/context/AuthContext';

type NavIcon = {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  href?: string;
};

const navIcons: NavIcon[] = [
  {
    icon: <FaRegCalendarAlt className="w-6 h-6 lg:w-7 lg:h-7 text-neutral-500" />,
    label: "Calendar",
    active: false,
    href: "/calendar",
  },
  {
    icon: <HiOutlineChatBubbleLeftRight className="w-6 h-6 lg:w-7 lg:h-7 text-neutral-500" />,
    label: "Chat",
    active: false,
    href: "/chat",
  },
  {
    icon: <MdOutlinePlayCircle className="w-6 h-6 lg:w-7 lg:h-7 text-primary-500" />,
    label: "Courses",
    active: true,
    href: "/courses",
  },
  {
    icon: <FiSettings className="w-6 h-6 lg:w-7 lg:h-7 text-neutral-500" />,
    label: "Settings",
    active: false,
    href: "/settings",
  },
];

interface SideNavBarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SideNavBar: React.FC<SideNavBarProps> = ({ isOpen = false, onClose }) => {
  const { logout } = useAuth();

  const handleNavClick = (nav: NavIcon) => {
    // TODO: Implement navigation logic
    console.log('Navigate to:', nav.href);
    // Close mobile menu after navigation
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation to login page will be handled by route guards
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    // Close mobile menu if open
    if (onClose) {
      onClose();
    }
  };

  // Desktop Navigation
  const DesktopNav = () => (
    <aside className="hidden lg:flex h-full w-20 bg-white rounded-3xl flex-col items-center pt-3 pb-6 shadow-xl select-none">
      {/* Logo */}
      <div className="mb-10">
        <img
          src="/orbed_logo_purple_bg.png"
          alt="orb-Ed Logo"
          className="w-16 h-16 object-contain rounded-full shadow-lg"
        />
      </div>
      
      {/* Navigation Icons */}
      <nav className="flex flex-col gap-14 flex-1 items-center justify-center">
        {navIcons.map((nav) => (
          <NavButton key={nav.label} nav={nav} onClick={() => handleNavClick(nav)} />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto">
        <LogoutButton onClick={handleLogout} />
      </div>
    </aside>
  );

  // Mobile Navigation Drawer
  const MobileNav = () => (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Mobile Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <img
                  src="/orbed_logo_purple_bg.png"
                  alt="orb-Ed Logo"
                  className="w-10 h-10 object-contain rounded-full shadow-md"
                />
                <span className="text-lg font-bold text-primary-800 font-heading">orb-Ed</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-2xl bg-neutral-50 w-10 h-10 flex items-center justify-center transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Close navigation menu"
              >
                <FiX className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-2">
                {navIcons.map((nav) => (
                  <button
                    key={nav.label}
                    onClick={() => handleNavClick(nav)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      nav.active
                        ? "bg-primary-50 border-2 border-primary-200 text-primary-700"
                        : "hover:bg-neutral-50 text-neutral-600"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {nav.icon}
                    </div>
                    <span className="font-medium text-base">{nav.label}</span>
                  </button>
                ))}
                
                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-50 text-red-600 border-t border-neutral-200 mt-4 pt-6"
                >
                  <div className="flex-shrink-0">
                    <FiLogOut className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                  <span className="font-medium text-base">Logout</span>
                </button>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-100">
              <div className="text-xs text-neutral-400 text-center">
                © 2025 orb-Ed Learning Platform
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  );
};

// Reusable Navigation Button Component
interface NavButtonProps {
  nav: NavIcon;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ nav, onClick }) => (
  <div className="relative group flex items-center">
    <button
      onClick={onClick}
      className={`rounded-2xl p-3 transition focus:outline-none flex items-center justify-center w-14 h-14 cursor-pointer focus:ring-2 focus:ring-primary-500 ${
        nav.active
          ? "border-2 border-[#4B2676] bg-[#F5F1FA]"
          : "hover:bg-[#F5F1FA]"
      }`}
      aria-label={nav.label}
      tabIndex={0}
    >
      {nav.icon}
    </button>
    
    {/* Desktop Tooltip */}
    <span
      className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-xl border border-primary-400 shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 translate-x-2 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 flex items-center gap-2 drop-shadow-lg"
      style={{ transitionDelay: '80ms' }}
      role="tooltip"
    >
      {nav.label}
      <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-3 h-3 bg-primary-400 border border-primary-400 shadow -z-10 rotate-45"></span>
    </span>
  </div>
);

// Logout Button Component for Desktop Navigation
interface LogoutButtonProps {
  onClick: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onClick }) => (
  <div className="relative group flex items-center">
    <button
      onClick={onClick}
      className="rounded-2xl p-3 transition focus:outline-none flex items-center justify-center w-14 h-14 cursor-pointer focus:ring-2 focus:ring-red-500 hover:bg-red-50 text-red-600 border-2 border-transparent hover:border-red-200"
      aria-label="Logout"
      tabIndex={0}
    >
      <FiLogOut className="w-6 h-6 lg:w-7 lg:h-7" />
    </button>
    
    {/* Desktop Tooltip */}
    <span
      className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl border border-red-400 shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 translate-x-2 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 flex items-center gap-2 drop-shadow-lg"
      style={{ transitionDelay: '80ms' }}
      role="tooltip"
    >
      Logout
      <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-3 h-3 bg-red-400 border border-red-400 shadow -z-10 rotate-45"></span>
    </span>
  </div>
);

export default SideNavBar;
