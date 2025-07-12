
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
    <aside className="h-screen w-20 bg-white rounded-3xl flex flex-col items-center py-6 shadow-xl select-none">
      {/* Logo */}
      <div className="mb-16">
        <img
          src="/logo.png" // Place your orb-Ed logo in public/logo.png
          alt="orb-Ed Logo"
          className="w-16 h-16 object-contain rounded-full shadow"
        />
      </div>
      {/* Icons */}
      <nav className="flex flex-col gap-12 flex-1 items-center justify-center">
        {navIcons.map((nav) => (
          <button
            key={nav.label}
            className={`rounded-2xl p-3 transition focus:outline-none ${
              nav.active
                ? "border-2 border-primary-500 bg-primary-50"
                : "hover:bg-primary-50"
            }`}
            aria-label={nav.label}
            tabIndex={0}
          >
            {nav.icon}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SideNavBar;
