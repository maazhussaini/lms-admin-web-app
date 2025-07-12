import React from 'react';
import { FiShoppingCart, FiBell } from 'react-icons/fi';

const user = {
  name: 'Alexa Rob',
  email: 'alexa@gmail.com',
  avatar: '/avatar.png', // Place the avatar image in public/avatar.png
};

const Header: React.FC<{ heading?: string }> = ({ heading = 'Heading' }) => {
  return (
    <header className="bg-white px-8 py-4 flex items-center justify-between shadow-none border-none">
      {/* Left: Heading */}
      <h1 className="text-2xl font-semibold text-primary-900 font-heading">{heading}</h1>
      {/* Right: Icons and User */}
      <div className="flex items-center gap-6">
        <div className="flex gap-4">
          <div className="rounded-2xl bg-primary-50 p-3 flex items-center justify-center">
            <FiShoppingCart className="w-6 h-6 text-neutral-400" />
          </div>
          <div className="rounded-2xl bg-primary-50 p-3 flex items-center justify-center">
            <FiBell className="w-6 h-6 text-neutral-400" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
          />
          <div className="flex flex-col">
            <span className="text-lg font-medium text-neutral-700 leading-tight">{user.name}</span>
            <span className="text-sm text-neutral-400 leading-tight">{user.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
