import { FaRegCalendarAlt } from "react-icons/fa";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { MdOutlinePlayCircle } from "react-icons/md";
import { FiSettings } from "react-icons/fi";

type NavIcon = {
  icon: React.ReactNode;
  label: string;
  active: boolean;
};

const navIcons: NavIcon[] = [
  {
    icon: <FaRegCalendarAlt className="w-7 h-7 text-neutral-500" />, // Calendar
    label: "Calendar",
    active: false,
  },
  {
    icon: <HiOutlineChatBubbleLeftRight className="w-7 h-7 text-neutral-500" />, // Chat
    label: "Chat",
    active: false,
  },
  {
    icon: <MdOutlinePlayCircle className="w-7 h-7 text-primary-500" />, // Video/Play
    label: "Video",
    active: true,
  },
  {
    icon: <FiSettings className="w-7 h-7 text-neutral-500" />, // Settings
    label: "Settings",
    active: false,
  },
];

const SideNavBar: React.FC = () => {
  return (
    <aside className="h-screen w-20 bg-white rounded-3xl flex flex-col items-center pt-3 pb-6 shadow-xl select-none">
      {/* Logo */}
      <div className="mb-10">
        <img
          src="/orbed_logo_purple_bg.png"
          alt="orb-Ed Logo"
          className="w-16 h-16 object-contain rounded-full shadow-lg"
        />
      </div>
      {/* Icons */}
      <nav className="flex flex-col gap-14 flex-1 items-center justify-center">
        {navIcons.map((nav) => (
          <div key={nav.label} className="relative group flex items-center">
            <button
              className={`rounded-2xl p-3 transition focus:outline-none flex items-center justify-center w-14 h-14 cursor-pointer ${
                nav.active
                  ? "border-2 border-[#4B2676] bg-[#F5F1FA]"
                  : "hover:bg-[#F5F1FA]"
              }`}
              aria-label={nav.label}
              tabIndex={0}
            >
              {nav.icon}
            </button>
            {/* Tooltip */}
            <span
              className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-xl border border-primary-400 shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 translate-x-2 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 flex items-center gap-2 drop-shadow-lg"
              style={{ transitionDelay: '80ms' }}
              role="tooltip"
            >
              {nav.label}
              <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-3 h-3 bg-primary-400 border border-primary-400 shadow -z-10 rotate-45"></span>
            </span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SideNavBar;
