import { RxHamburgerMenu } from "react-icons/rx";
import { TfiSearch } from "react-icons/tfi";
import { MdKeyboardVoice } from "react-icons/md";
// import { RiVideoAddLine } from "react-icons/ri";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { toggleMenu, toggleSideBar } from "../utils/appSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import useDebounce from "../utils/useDebounce";
import { YOUTUBE_SEARCH_SUGGESTION_API_URL } from "../utils/constants";
import SuggestionDropDown from "./SuggestionDropDown";
import useClickOutside from "./../utils/useClickOutside";
import { cacheResults } from "../utils/searchSlice";
import { Icon } from "@iconify/react";
import ThemeContext from "../utils/ThemeContext";
// import { BsFillMoonFill, BsFillSunFill } from "react-icons/bs";
import { useVoice } from "../utils/useVoice";
import { changeCategory } from "../utils/categorySlice";
import light_logo from "../assests/logo_light_theme.webp";
import dark_logo from "../assests/logo_dark_theme.webp";

import mic_open from "../assests/mic_open.gif";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debounceSearchText = useDebounce(searchQuery, 200);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useClickOutside(() => setLoading(true));
  const inputRef = useRef();

  const { text, isListening, listen } = useVoice();

  const { theme, setTheme } = useContext(ThemeContext);

  const handleThemeChange = () => {
    const isCurrentDark = theme === "dark";
    setTheme(isCurrentDark ? "light" : "dark");
    localStorage.setItem("theme", isCurrentDark ? "light" : "dark");
  };

  const searchCache = useSelector((store) => store.search.suggestions);
  const dispatch = useDispatch();

  const category = useSelector((store) => store.videosCategory.category);

  const route = useLocation();

  const handleSetHomeVideoByKeyword = (searchText) => {
    if (category !== searchText) {
      dispatch(changeCategory(searchText));
    }
    setLoading(true);
    setSuggestions([]);
    setSearchQuery("");
  };

  const toggleMenuHandler = () => {
    dispatch(toggleMenu());
  };
  const toggleSideBarHandler = () => {
    dispatch(toggleSideBar());
  };

  const handleVoiceSearch = () => {
    listen();
    console.log("Voice Search");
  };

  useEffect(() => {
    setSearchQuery(text);
  }, [text]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const getAutocompletion = async (searchText) => {
      // console.log('api call made for text -> ', searchText);
      const response = await fetch(
        YOUTUBE_SEARCH_SUGGESTION_API_URL + searchText,
        signal
      );
      const data = await response.json();
      dispatch(cacheResults({ [searchText]: data[1] }));
      setSuggestions(data[1]);
      setLoading(false);
    };

    if (debounceSearchText.length > 2) {
      if (searchCache[debounceSearchText]) {
        setSuggestions(searchCache[debounceSearchText]);
        setLoading(false);
      } else {
        getAutocompletion(debounceSearchText);
      }
    }

    return () => {
      controller.abort("cancel request");
    };
    // eslint-disable-next-line
  }, [debounceSearchText]);

  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle the dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Function to close the dropdown when clicking outside
  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Prevent the dropdown from closing when clicking inside it
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="px-4 py-4 flex justify-between items-center  w-full sticky top-0 z-10 bg-white h-[4.62rem] dark:bg-zinc-900 dark:text-white transition-all duration-500">
      <div className="left-items flex items-center">
        <button
          className=" p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
          onClick={
            route.pathname === "/watch"
              ? toggleSideBarHandler
              : toggleMenuHandler
          }
        >
          <RxHamburgerMenu
            size="1.5rem"
            title="hambergur menu"
            className="cursor-pointer"
          />
        </button>
        <div className="logo cursor-pointer flex items-center max-md:hidden">
          <a href="/">
            <img
              src={theme === "light" ? light_logo : dark_logo}
              alt="logo"
              title="logo"
              className="w-52 pl-4 lg:w-36"
            />
          </a>
        </div>
      </div>
      <div className="center w-3/5 2xl:w-2/5 max-sm:w-4/5 max-sm:ml-2 max-sm:mr-4 flex items-center ml-16 relative ">
        <div
          ref={searchRef}
          className="searchbar dark:bg-zinc-800 flex-1 flex items-center ml-3 rounded-3xl border-2 dark:border dark:border-gray-500"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            value={searchQuery}
            className=" rounded-l-3xl p-2 pl-8 focus:outline-none w-full dark:bg-zinc-800 "
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setLoading(true);
            }}
            onFocus={(e) => {
              setLoading(false);
            }}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                handleSetHomeVideoByKeyword(e.target.value);
              }
            }}
          />
          <div
            className="p-3 cursor-pointer hover:bg-zinc-200 px-8 rounded-r-3xl bg-zinc-100 border-l-2 border-zinc-200 max-md:bg-white max-md:border-none max-md:px-4 max-lg:px-4 dark:bg-zinc-800 dark:border-l dark:border-gray-500 "
            onClick={() => {
              setSearchQuery(inputRef.current.value);
              setLoading(false);
            }}
          >
            <button
              className="flex items-center"
              onClick={() => handleSetHomeVideoByKeyword(searchQuery)}
            >
              <TfiSearch size="1.2rem" className="" />
            </button>
          </div>
        </div>
        <div
          className="voice-icon max-lg:hidden ml-4 p-2 hover:bg-zinc-200 rounded-full cursor-pointer dark:text-white dark:hover:bg-zinc-700"
          onClick={handleVoiceSearch}
        >
          {isListening ? (
            <img src={mic_open} width="30px" alt="mic open" />
          ) : (
            <MdKeyboardVoice size="1.5rem" />
          )}
        </div>
        {/* {isListening && <VoiceSearch text={text}/>} */}
        {!loading && (
          <SuggestionDropDown
            suggestions={suggestions}
            setLoading={setLoading}
            setSuggestions={setSuggestions}
            setSearchQuery={setSearchQuery}
          />
        )}
      </div>
      <div className="right-menu flex  items-center sm:ml-4 lg:ml-16 max-sm:gap-0 gap-5 p-2">
        <div className="p-2  hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full cursor-pointer">
          <IoMdNotificationsOutline size="1.5rem" />
        </div>
        <div className="relative" onClick={toggleDropdown}>
          {/* User icon */}
          <div className="p-2 max-sm:-mr-4  rounded-full cursor-pointer">
            <FaUserCircle size="1.5rem" />
          </div>

          {/* Dropdown content */}
          {isOpen && (
            <div
              className="absolute -ml-72 -mt-12 w-72 bg-white dark:bg-zinc-800 shadow-md rounded-lg z-10"
              onClick={stopPropagation}
            >
              <div className="py-2">
                {/* Dropdown items */}
                <a
                  href="/profile"
                  className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Profile
                </a>
                {/* Add more dropdown items as needed */}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-400"></div>
              <div className="toggle-dark-mode-switch px-3 mt-4 hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2">
              <Icon icon="line-md:light-dark-loop" width="25" /><button
                  onClick={handleThemeChange}
                  className={` relative p-3 cursor-pointer flex ${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                >Appearance:
                  {theme === "light" ? "Light" : "Dark"}
                </button>
              </div>

              <div className="py-2">
                {/* Sign In button */}
                <button className="block w-full text-left px-4 py-2 text-red-500 hover:text-red-600">
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* Close the dropdown when clicking outside */}
          {isOpen && (
            <div
              className="fixed inset-0"
              onClick={closeDropdown}
              style={{ zIndex: -1 }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
