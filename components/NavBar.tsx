"use client";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "My Shipment", href: "#shipment" },
  { label: "Contact Hub", href: "#contact" },
  { label: "About Hub", href: "#about" },
  { label: "FAQs", href: "#faqs" },
];

interface NavBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function NavBar({ activeTab = "My Shipment", onTabChange }: NavBarProps) {
  return (
    <nav
      className="w-full"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.68)",
        borderBottom: "1px solid rgba(216, 225, 236, 0.85)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide rounded-full border border-[#dde6ef] bg-white/80 p-1.5 shadow-[0_14px_32px_rgba(15,23,42,0.04)]">
          {navItems.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                onClick={() => onTabChange?.(item.label)}
                className="relative flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive ? "#132235" : "#6b7b8d",
                  background: isActive ? "linear-gradient(135deg, #fff4eb 0%, #fdf8f3 100%)" : "transparent",
                  boxShadow: isActive ? "0 10px 22px rgba(197, 90, 17, 0.12)" : "none",
                }}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute inset-y-2 left-2 w-1 rounded-full"
                    style={{ backgroundColor: "#c55a11" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
