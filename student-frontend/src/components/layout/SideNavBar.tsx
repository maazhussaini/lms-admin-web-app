import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from "react-icons/fi";
import { useAuth } from '@/context/AuthContext';
import CustomIcon from '@/components/common/CustomIcon';
import { FiLogOut } from 'react-icons/fi';
import orbedLogoPurple from '@/assets/images/orbed_logo_purple_bg.png';
import { useNavigate, useLocation } from 'react-router-dom';

type NavIcon = {
  icon: React.ReactNode;
  label: string;
  href: string;
  iconClass: string;
};

const navIcons: NavIcon[] = [
  {
    iconClass: "ic-3",
    label: "Calendar",
    href: "/calendar",
    icon: <CustomIcon iconClass="ic-3" size="lg" className="lg:text-2xl laptop:text-lg xl:text-3xl" aria-label="Calendar" />,
  },
  {
    iconClass: "ic-21",
    label: "Notice Board",
    href: "/notices",
    icon: <CustomIcon iconClass="ic-21" size="lg" className="lg:text-2xl laptop:text-lg xl:text-3xl" aria-label="Notice Board" />,
  },
  {
    iconClass: "ic-20",
    label: "Courses",
    href: "/courses",
    icon: <CustomIcon iconClass="ic-20" size="lg" className="lg:text-2xl laptop:text-lg xl:text-3xl" aria-label="Courses" />,
  },
  {
    iconClass: "ic-4",
    label: "Settings",
    href: "/settings",
    icon: <CustomIcon iconClass="ic-4" size="lg" className="lg:text-2xl laptop:text-lg xl:text-3xl" aria-label="Settings" />,
  },
];

interface SideNavBarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SideNavBar: React.FC<SideNavBarProps> = ({ isOpen = false, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if a nav item is active based on current location
  const isNavActive = (navHref: string): boolean => {
    return location.pathname.startsWith(navHref);
  };

  const handleNavClick = (nav: NavIcon) => {
    if (nav.href) {
      navigate(nav.href);
    }
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
    <aside className="hidden lg:flex h-full w-20 laptop:w-16 bg-white rounded-3xl laptop:rounded-2xl flex-col items-center pt-3 laptop:pt-2 pb-6 laptop:pb-3 shadow-xl select-none">
      {/* Logo */}
      <div className="mb-10 laptop:mb-5">
        <img
          src={orbedLogoPurple}
          alt="orb-Ed Logo"
          className="w-16 h-16 laptop:w-11 laptop:h-11 object-contain rounded-full shadow-lg"
        />
      </div>
      
      {/* Navigation Icons */}
      <nav className="flex flex-col gap-14 laptop:gap-7 flex-1 items-center justify-center">
        {navIcons.map((nav) => (
          <NavButton 
            key={nav.label} 
            nav={nav} 
            onClick={() => handleNavClick(nav)}
            isActive={isNavActive(nav.href)}
          />
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
                {navIcons.map((nav) => {
                  const isActive = isNavActive(nav.href);
                  const iconColor = isActive ? 'text-primary-500' : 'text-neutral-500';
                  
                  return (
                    <button
                      key={nav.label}
                      onClick={() => handleNavClick(nav)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        isActive
                          ? "bg-primary-50 border-2 border-primary-200 text-primary-700"
                          : "hover:bg-neutral-50 text-neutral-600"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <CustomIcon 
                          iconClass={nav.iconClass} 
                          size="lg" 
                          className={`${iconColor} lg:text-2xl laptop:text-lg xl:text-3xl`} 
                          aria-label={nav.label} 
                        />
                      </div>
                      <span className="font-medium text-base">{nav.label}</span>
                    </button>
                  );
                })}
                
                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-50 text-red-600 border-t border-neutral-200 mt-4 pt-6"
                >
                  <div className="flex-shrink-0">
                    <FiLogOut className="w-6 h-6 lg:w-7 lg:h-7 laptop:w-6 laptop:h-6" />
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
  isActive: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ nav, onClick, isActive }) => {
  // Dynamically render icon with active state
  const iconColor = isActive ? 'text-primary-500' : 'text-neutral-500';
  
  return (
    <div className="relative group flex items-center">
      <button
        onClick={onClick}
        className={`rounded-2xl laptop:rounded-xl p-3 laptop:p-1.5 transition focus:outline-none flex items-center justify-center w-14 h-14 laptop:w-10 laptop:h-10 cursor-pointer focus:ring-2 focus:ring-primary-500 ${
          isActive
            ? "border-2 laptop:border-[1.5px] border-[#4B2676] bg-[#F5F1FA]"
            : "hover:bg-[#F5F1FA]"
        }`}
        aria-label={nav.label}
        tabIndex={0}
      >
        <CustomIcon 
          iconClass={nav.iconClass} 
          size="lg" 
          className={`${iconColor} lg:text-2xl laptop:text-lg xl:text-3xl`} 
          aria-label={nav.label} 
        />
      </button>
      
      {/* Desktop Tooltip */}
      <span
        className="absolute left-full top-1/2 -translate-y-1/2 ml-4 laptop:ml-3 px-4 laptop:px-3 py-2 laptop:py-1.5 bg-primary-500 text-white text-sm laptop:text-xs font-semibold rounded-xl laptop:rounded-lg border border-primary-400 shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 translate-x-2 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 flex items-center gap-2 drop-shadow-lg"
        style={{ transitionDelay: '80ms' }}
        role="tooltip"
      >
        {nav.label}
        <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 laptop:-ml-1.5 w-3 h-3 laptop:w-2.5 laptop:h-2.5 bg-primary-400 border border-primary-400 shadow -z-10 rotate-45"></span>
      </span>
    </div>
  );
};

// Logout Button Component for Desktop Navigation
interface LogoutButtonProps {
  onClick: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onClick }) => (
  <div className="relative group flex items-center">
    <button
      onClick={onClick}
      className="rounded-2xl laptop:rounded-xl p-3 laptop:p-1.5 transition focus:outline-none flex items-center justify-center w-14 h-14 laptop:w-10 laptop:h-10 cursor-pointer focus:ring-2 focus:ring-red-500 hover:bg-red-50 text-red-600 border-2 laptop:border-[1.5px] border-transparent hover:border-red-200"
      aria-label="Logout"
      tabIndex={0}
    >
      <FiLogOut className="w-6 h-6 lg:w-7 lg:h-7 laptop:w-[18px] laptop:h-[18px]" />
    </button>
    
    {/* Desktop Tooltip */}
    <span
      className="absolute left-full top-1/2 -translate-y-1/2 ml-4 laptop:ml-3 px-4 laptop:px-3 py-2 laptop:py-1.5 bg-red-500 text-white text-sm laptop:text-xs font-semibold rounded-xl laptop:rounded-lg border border-red-400 shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 translate-x-2 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 flex items-center gap-2 drop-shadow-lg"
      style={{ transitionDelay: '80ms' }}
      role="tooltip"
    >
      Logout
      <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 laptop:-ml-1.5 w-3 h-3 laptop:w-2.5 laptop:h-2.5 bg-red-400 border border-red-400 shadow -z-10 rotate-45"></span>
    </span>
  </div>
);

export default SideNavBar;
