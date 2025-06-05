import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MdMenu, MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";

export default function Sidebar() {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAnimating, setIsAnimating] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: "📊" },
    {
      id: "costs",
      label: "Nguyên liệu",
      path: "/costs/management",
      icon: "📦",
    },
    {
      id: "revenues",
      label: "Doanh thu",
      path: "/revenues/management",
      icon: "💰",
    },
    { id: "reports", label: "Báo cáo", path: "/reports", icon: "📈" },
    {
      id: "ingredient",
      label: "Nguyên liệu làm bánh",
      path: "/ingredient",
      icon: "🍪",
    },
    { id: "product", label: "Tính giá", path: "/product", icon: "🧮" },
  ];

  useEffect(() => {
    const current = menuItems.find((item) =>
      location.pathname.startsWith(item.path)
    );
    if (current) setActiveItem(current.id);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isAnimating) {
      const timeout = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);

  const handleCollapseToggle = () => {
    setIsAnimating(true);
    setIsCollapsed((prev) => !prev);
  };

  const handleNavigate = (id) => {
    setActiveItem(id);
  };

  // Mobile bottom nav
  if (isMobile) {
    return (
      <div className="fixed bottom-0 space-x-1 left-0 right-0 bg-gray-800 text-white flex justify-around items-center h-20 z-50 border-t border-gray-700">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => handleNavigate(item.id)}
            className={({ isActive }) =>
              `flex flex-col w-full h-full items-center text-center justify-center w-full text-sm ${
                isActive ? "text-cyan-200 border-b border-cyan-400 bg-gradient-to-b from-transparent to-[rgba(34,211,238,.1)] font-semibold" : "hover:text-blue-300"
              }`
            }
          >
            <span className="text-xs lg:text-base">{item.label}</span>
          </NavLink>
        ))}
      </div>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={`h-screen bg-gray-800 text-white transition-all duration-300 p-4 ${
        isCollapsed ? "w-[80px]" : "w-64"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        {!isCollapsed && (
          <h2 className="text-2xl font-bold text-center flex-1 whitespace-nowrap">
            Tíc Tắc Shop
          </h2>
        )}
        <button
          className="p-2 text-white hover:bg-gray-700 rounded"
          onClick={handleCollapseToggle}
        >
          {isCollapsed ? (
            <MdMenu
              className="rotate-180 transition-transform duration-300"
              size={24}
            />
          ) : (
            <MdOutlineKeyboardDoubleArrowLeft size={24} />
          )}
        </button>
      </div>

      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => handleNavigate(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2 transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-transparent to-[rgba(34,211,238,.1)] border-r-3 border-cyan-400 font-semibold"
                  : "hover:bg-gray-700"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && (
              <span className="transition-opacity duration-300">
                {item.label}
              </span>
            )}
            {isCollapsed && (
              <div
                className={`absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 text-sm whitespace-nowrap bg-gray-700 rounded border border-gray-600 z-50 transition-all duration-200 ${
                  hoveredItem === item.id
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-90 pointer-events-none"
                }`}
              >
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
