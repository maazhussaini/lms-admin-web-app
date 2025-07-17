import React from 'react';
import { FiShoppingCart, FiBell, FiMenu } from 'react-icons/fi';

const user = {
  name: 'Alexa Rob',
  email: 'alexa@gmail.com',
  avatar: '/female.png', // Place the avatar image in public/avatar.png
};

interface HeaderProps {
  heading?: string;
  onMobileMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  heading = 'Heading',
  onMobileMenuToggle 
}) => {
  return (
    <header className="bg-white px-4 sm:px-8 lg:px-14 py-3 sm:py-4 flex items-center justify-between shadow-none border-none">
      {/* Left: Mobile Menu + Heading */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Menu Button */}
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden rounded-2xl bg-primary-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle navigation menu"
          >
            <FiMenu className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" />
          </button>
        )}
        
        {/* Heading */}
        <h1 className="text-lg sm:text-xl lg:text-[2rem] font-semibold text-primary-800 font-heading leading-none truncate">
          {heading}
        </h1>
      </div>

      {/* Right: Icons and User */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Action Icons */}
        <div className="flex gap-1 sm:gap-2">
          <button className="rounded-2xl bg-primary-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-neutral-500" />
          </button>
          <button className="rounded-2xl bg-primary-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 relative">
            <FiBell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-neutral-500" />
            {/* Notification indicator */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white shadow"
          />
          {/* User Info - Hidden on mobile */}
          <div className="hidden sm:flex flex-col">
            <span className="text-sm lg:text-lg font-semibold text-neutral-600 leading-tight font-heading truncate max-w-[120px] lg:max-w-none">
              {user.name}
            </span>
            <span className="text-xs lg:text-sm text-neutral-400 leading-tight truncate max-w-[120px] lg:max-w-none">
              {user.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
