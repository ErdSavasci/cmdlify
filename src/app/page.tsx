"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Fuse from "fuse.js"; // The fuzzy search engine
import {
  SiApple,
  SiDebian,
  SiRedhat,
  SiArchlinux,
  SiGentoo,
  SiSlackware,
} from "react-icons/si";
import { FaWindows } from "react-icons/fa";
import { VscTerminalPowershell } from "react-icons/vsc";
import { FiChevronDown, FiSearch, FiX, FiMoon, FiSun } from "react-icons/fi";
import Image from "next/image";

import type { TerminalCommand } from "@/types";
import TerminalParticles from "@/components/TerminalParticles";

import debian from "@/data/debian-based.json";
import rpm from "@/data/rpm-based.json";
import pacman from "@/data/pacman-based.json";
import gentoo from "@/data/gentoo-based.json";
import slackware from "@/data/slackware-based.json";
import mac from "@/data/mac-based.json";
import windowscmd from "@/data/windows-cmd-based.json";
import windowsps from "@/data/windows-ps-based.json";

// Category Definition
import categories from "@/data/categories.json";

const osOptions = [
  { id: "debian", name: "Debian/Ubuntu", icon: SiDebian },
  { id: "rpm", name: "RHEL/CentOS/Fedora", icon: SiRedhat },
  { id: "pacman", name: "Arch Linux", icon: SiArchlinux },
  { id: "gentoo", name: "Gentoo", icon: SiGentoo },
  { id: "slackware", name: "Slackware", icon: SiSlackware },
  { id: "macos", name: "macOS", icon: SiApple },
  { id: "ps", name: "Windows PowerShell", icon: VscTerminalPowershell },
  { id: "cmd", name: "Windows CMD", icon: FaWindows },
];

const osData: Record<string, TerminalCommand[]> = {
  debian: debian as TerminalCommand[],
  rpm: rpm as TerminalCommand[],
  pacman: pacman as TerminalCommand[],
  gentoo: gentoo as TerminalCommand[],
  slackware: slackware as TerminalCommand[],
  macos: mac as TerminalCommand[],
  cmd: windowscmd as TerminalCommand[],
  ps: windowsps as TerminalCommand[],
};

// Helper function to return authentic terminal prefixes based on the OS
const getOSPrefix = (osId: string) => {
  switch (osId) {
    case "cmd":
      return String.raw`C:\Users\cmdlify>`;
    case "ps":
      return String.raw`PS C:\Users\cmdlify>`;
    case "macos":
      return "cmdlify@mac ~ %";
    case "debian":
    case "rpm":
    case "pacman":
    case "gentoo":
    case "slackware":
      return "cmdlify@linux:~$";
    default:
      return "$";
  }
};

// Helper function to return colors for the striped footer
const getRiskData = (risk?: string) => {
  switch (risk?.toLowerCase()) {
    case "danger":
      return { textClass: "text-red-600 dark:text-red-500", hex: "#ef4444" };
    case "warning":
      return {
        textClass: "text-orange-600 dark:text-orange-500",
        hex: "#f97316",
      };
    case "safe":
    default:
      return {
        textClass: "text-green-600 dark:text-green-500",
        hex: "#22c55e",
      };
  }
};

const OSDropdown = ({
  value,
  onChange,
  isOpen,
  onToggle,
}: {
  value: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption =
    osOptions.find((os) => os.id === value) || osOptions[0];
  const Icon = selectedOption.icon;

  // Listen for clicks outside the component to close the menu
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onToggle(false); // Tell parent to close it
      }
    };

    if (isOpen) {
      document.addEventListener(
        "pointerdown",
        handleClickOutside as EventListener,
      );
    }

    // Cleanup listener when component unmounts or menu closes
    return () => {
      document.removeEventListener(
        "pointerdown",
        handleClickOutside as EventListener,
      );
    };
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => onToggle(!isOpen)}
        // Replaced min-w-[180px] with w-[200px] here:
        className="cursor-pointer flex items-center gap-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded hover:border-gray-400 dark:hover:border-gray-500 focus:ring-1 focus:ring-green-500 px-3 py-1.5 outline-none font-mono w-[200px] justify-between transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="text-sm shrink-0" />
          <span className="truncate">{selectedOption.name}</span>
        </div>
        <FiChevronDown
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-2xl z-50 overflow-hidden">
          {osOptions.map((os) => {
            const OptionIcon = os.icon;
            return (
              <button
                key={os.id}
                onClick={() => {
                  onChange(os.id);
                  onToggle(false);
                }}
                className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-xs font-mono transition-colors ${
                  value === os.id
                    ? "bg-green-50 dark:bg-gray-800 text-green-700 dark:text-green-400 font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <OptionIcon className="text-sm shrink-0" />
                <span className="truncate">{os.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  // Global state for the selected category and selected OS
  const [selectedCategory, setSelectedCategory] =
    useState<string>("file-system");
  const [globalOS, setGlobalOS] = useState<string>("macos");

  // Tracks specific OS overrides for individual concept IDs
  const [blockOSOverrides, setBlockOSOverrides] = useState<
    Record<string, string>
  >({});

  // State to track which command was recently copied for user feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // State to track which command's dropdown is currently open
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Theme state (dark/light)
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // On initial load, check if the browser has a saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("cmdlify-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      // By wrapping this in setTimeout, making the state update asynchronous
      // This allows React to finish its initial render without triggering a "cascading render" warning
      setTimeout(() => {
        setTheme(savedTheme);
      }, 0);
    }
  }, []); // Empty array means this runs exactly once when the page loads
  // Whenever the theme changes, update the DOM AND save it to local storage
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save the current theme to the browser's local storage
    localStorage.setItem("cmdlify-theme", theme);
  }, [theme]);
  // Toggle function for the theme switcher
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  // Calculate total commands count for the current global OS to display
  // The length of the current OS dataset gives us the total number of commands available for that OS
  // but since commands are shared across operating systems, the number will be accurate enough
  const totalCommandsCount = osData[globalOS]?.length || 0;

  // Search setup with Fuse.js, memoized to only recreate when globalOS changes
  const [searchQuery, setSearchQuery] = useState("");
  const fuse = useMemo(() => {
    // We search through whatever the current global OS dataset is
    const currentCommands = osData[globalOS] || [];
    return new Fuse(currentCommands, {
      keys: [
        { name: "command", weight: 2 }, // Command name is most important
        { name: "description", weight: 1 }, // Description is secondary
        { name: "flags.flag", weight: 0.5 }, // Flags are checked last
        { name: "flags.meaning", weight: 0.5 },
      ],
      threshold: 0.3, // 0.3 allows for slight typos (e.g., "ipconifg" finds "ipconfig")
      ignoreLocation: true, // Searches the whole string, not just the beginning
    });
  }, [globalOS]);
  // Generate results on the fly as the user types
  const searchResults = searchQuery ? fuse.search(searchQuery) : [];
  // Handle clicking a search result
  const handleSelectSearchResult = (conceptId: string, categoryId: string) => {
    setSelectedCategory(categoryId); // Switch to the correct category
    setSearchQuery(""); // Clear and close the search bar

    // Smooth scroll to the exact command block after a tiny delay to allow React to render the new category
    setTimeout(() => {
      const element = document.getElementById(`cmd-${conceptId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Optional: Flash the element to draw the user's eye
        element.classList.add(
          "ring-2",
          "ring-green-500",
          "ring-offset-2",
          "ring-offset-black",
        );
        setTimeout(
          () =>
            element.classList.remove(
              "ring-2",
              "ring-green-500",
              "ring-offset-2",
              "ring-offset-black",
            ),
          2000,
        );
      }
    }, 100);
  };

  // Auto-detect baseline OS on initial load
  useEffect(() => {
    const userAgent = globalThis.navigator.userAgent.toLowerCase();
    let detectedOS = "macos";

    if (userAgent.includes("win")) {
      detectedOS = "cmd"; // Default to CMD for Windows, users can switch to PowerShell if desired
    } else if (userAgent.includes("linux")) {
      detectedOS = "debian"; // Default to Debian/Ubuntu for Linux, as it's the most common, but users can switch to others
    }

    // Wrapped in setTimeout to prevent cascading render warnings
    setTimeout(() => {
      setGlobalOS(detectedOS);
    }, 0);
  }, []);

  // Handle copying command to clipboard with user feedback
  const handleCopy = async (id: string, command: string) => {
    await navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle refreshing the page when clicking the logo
  const handleRefreshPage = () => {
    globalThis.location.href = "/";
  };

  // Handle changing the OS for a specific command block
  const handleBlockOSChange = (conceptId: string, newOS: string) => {
    setBlockOSOverrides((prev) => ({
      ...prev,
      [conceptId]: newOS,
    }));
  };

  // Get the baseline commands for the selected category based on the global OS
  const baseCommands =
    osData[globalOS]?.filter((cmd) => cmd.category === selectedCategory) || [];

  return (
    <>
      {/* Lightweight background particles */}
      <TerminalParticles />

      {/* Main Content: Add z-10 and relative to sit above particles */}
      <main className="p-10 max-w-5xl mx-auto relative z-10 transition-colors duration-300 min-h-screen">
        {/* --- Theme Toggle --- */}
        <div className="absolute top-12.5 right-10 z-99">
          <button
            onClick={toggleTheme}
            className="cursor-pointer p-2.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <FiSun className="text-xl" />
            ) : (
              <FiMoon className="text-xl" />
            )}
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          {/* Logo and Title Container */}
          <div className="flex items-center gap-4">
            {/* The Logo with a subtle neon glow effect */}
            <Image
              src={"/logo.png"}
              alt="Cmdlify Logo"
              width={128}
              height={128}
              onClick={handleRefreshPage}
              className="cursor-pointer w-12 h-12 md:w-16 md:h-16 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.3)] border border-gray-800"
            />

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center">
              <span>Cmdlify</span>
              <span className="text-gray-500 font-normal text-xl hidden sm:inline ml-3">
                - Simplify Your Terminal Experience
              </span>
            </h1>

            {/* Version Info */}
            <div className="z-50 flex items-center gap-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-green-500/30 dark:border-green-500/50 text-green-700 dark:text-green-400 px-4 py-2.5 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.2)] font-mono text-sm transition-all hover:border-green-500 dark:hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] cursor-default">
              {/* Flashing Status Dot */}
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </div>

              <span style={{ fontSize: "0.65rem" }}>
                Last Updated:{" "}
                {process.env.NEXT_PUBLIC_LAST_MODIFIED || "Just now"}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mb-8 z-50">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder={`Search commands, descriptions, or flags...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-12 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-xl font-sans text-lg placeholder-gray-400 dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <FiX className="text-xl" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-[400px] overflow-y-auto z-50">
              {searchResults.map(({ item }) => (
                <button
                  key={item.conceptId}
                  onClick={() =>
                    handleSelectSearchResult(item.conceptId, item.category)
                  }
                  className="cursor-pointer w-full text-left p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex flex-col gap-1 last:border-0 group"
                >
                  <div className="flex justify-between items-center">
                    <code className="text-green-700 dark:text-green-400 font-mono text-sm group-hover:text-green-800 dark:group-hover:text-green-300">
                      {item.command}
                    </code>
                    <span className="text-xs bg-gray-100 dark:bg-black text-gray-600 dark:text-gray-400 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                      {categories.find((c) => c.id === item.category)?.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-6 text-center text-gray-500 dark:text-gray-400 z-50">
              No commands found matching {searchQuery}
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-800 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`cursor-pointer px-4 py-2 rounded-md text-sm transition-all ${
                selectedCategory === cat.id
                  ? "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 font-bold shadow-sm border border-gray-200 dark:border-transparent"
                  : "bg-transparent text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900 border border-transparent"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Command List */}
        <div className="space-y-6">
          {baseCommands.length === 0 ? (
            <div className="text-gray-500 text-center py-10 border border-dashed border-gray-800 rounded-lg backdrop-blur-sm bg-black/20">
              No commands found for this category.
            </div>
          ) : (
            baseCommands.map((baseCmd) => {
              // Determine which OS should be displayed for this specific block
              const activeOS = blockOSOverrides[baseCmd.conceptId] || globalOS;

              // Find the command data for the active OS.
              // If missing in that OS, fallback to the base command to prevent crashing.
              const displayCmd =
                osData[activeOS]?.find(
                  (c) => c.conceptId === baseCmd.conceptId,
                ) || baseCmd;
              const categoryName = categories.find(
                (c) => c.id === displayCmd.category,
              )?.name;

              // Check if this specific dropdown is the open one
              const isDropdownOpen = openDropdownId === displayCmd.conceptId;

              return (
                <div
                  key={displayCmd.conceptId}
                  id={`cmd-${displayCmd.conceptId}`} // For smooth scrolling from search results
                  // Adding 'relative' and dynamically apply 'z-50' if open, 'z-10' if closed
                  className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-xl transition-all relative ${
                    isDropdownOpen ? "z-50" : "z-10"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 dark:bg-gray-800 text-green-700 dark:text-green-400 border border-green-200 dark:border-gray-700">
                      {categoryName}
                    </span>

                    {/* Block-level OS Switcher */}
                    <OSDropdown
                      value={activeOS}
                      isOpen={isDropdownOpen}
                      onToggle={(open) =>
                        setOpenDropdownId(open ? displayCmd.conceptId : null)
                      }
                      onChange={(newOS) =>
                        handleBlockOSChange(displayCmd.conceptId, newOS)
                      }
                    />
                  </div>

                  {/* Command Line */}
                  <div className="bg-gray-50 dark:bg-black p-4 rounded-md mb-4 flex items-center justify-between group border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <code className="text-lg text-gray-900 dark:text-white font-mono flex items-center overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide [font-variant-ligatures:none]">
                      {/* The OS Prefix with an added non-breaking space */}
                      <span className="text-gray-400 dark:text-gray-500 select-none shrink-0 text-sm">
                        {getOSPrefix(activeOS)}&nbsp;
                      </span>
                      {/* The actual command */}
                      <span>{displayCmd.command}</span>
                    </code>
                    <button
                      onClick={() =>
                        handleCopy(displayCmd.id, displayCmd.command)
                      }
                      className="cursor-pointer text-sm bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 px-3 py-1.5 rounded transition-all font-sans text-gray-700 dark:text-gray-300 min-w-[80px]"
                    >
                      {copiedId === displayCmd.id ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {displayCmd.description}
                  </p>

                  {/* Flags & Arguments */}
                  {displayCmd.flags && displayCmd.flags.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                        Flags & Arguments
                      </span>
                      <ul className="space-y-2">
                        {displayCmd.flags.map((f) => (
                          <li
                            key={f.flag}
                            className="text-sm flex items-start gap-3"
                          >
                            <code className="text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-gray-950 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-gray-800 shrink-0">
                              {f.flag}
                            </code>
                            <span className="text-gray-600 dark:text-gray-400 mt-0.5">
                              {f.meaning}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Striped Risk Level Footer */}
                  <div className="mt-8 relative -mx-6 -mb-6 h-12 flex items-center justify-center rounded-b-lg overflow-hidden border-t border-transparent dark:border-gray-800/50">
                    {/* The striped background overlay */}
                    <div
                      className="absolute inset-0 risk-stripes pointer-events-none"
                      style={
                        {
                          "--risk-color": getRiskData(displayCmd.riskLevel).hex,
                        } as React.CSSProperties
                      }
                    />

                    {/* The text sitting on top */}
                    <span
                      className={`relative z-10 text-[11px] font-bold uppercase tracking-widest ${getRiskData(displayCmd.riskLevel).textClass}`}
                    >
                      {displayCmd.riskLevel || "safe"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- Footer & Disclaimer --- */}
        <footer className="mt-16 pb-12 pt-8 border-t border-gray-200 dark:border-gray-800/50 flex flex-col items-center justify-center gap-3 text-center relative z-10 font-sans">
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            <a
              href="https://www.virtue.ng"
              target="_blank"
              rel="noopener noreferrer"
            >
              VirtuEng Software
            </a>{" "}
            &copy; {new Date().getFullYear()}
          </p>
          <p className="text-gray-500 text-xs max-w-2xl px-6 leading-relaxed">
            <strong>Disclaimer:</strong> The commands provided on Cmdlify are
            for educational purposes. Command-line interfaces are powerful
            tools; please verify commands and fully understand their effects
            before executing them on your local machine or production servers,
            especially those marked with warning or danger risk levels.
          </p>
        </footer>

        {/* Floating Command Counter */}
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-orange-500/30 dark:border-orange-500/50 text-orange-700 dark:text-orange-400 px-4 py-2.5 rounded-full shadow-[0_0_15px_rgba(255,165,0,0.2)] font-mono text-sm transition-all hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-[0_0_20px_rgba(255,165,0,0.4)] cursor-default">
          {/* Flashing Status Dot */}
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
          </div>

          <span className="text-xs">Total Commands: {totalCommandsCount}</span>
        </div>
      </main>
    </>
  );
}
