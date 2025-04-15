import React from "react";
import {
  AiOutlineInstagram,
  AiOutlineFacebook,
  AiOutlineYoutube,
} from "react-icons/ai";

const SocialMediaLinks = () => {
  return (
    <div className="flex gap-4">
      <a
        href="https://www.facebook.com/DockBloxx"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <AiOutlineFacebook className="w-12 h-12 text-gray-300 hover:text-blue-600 transition-colors duration-300" />
      </a>
      <a
        href="https://www.instagram.com/dockbloxx/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <AiOutlineInstagram className="w-12 h-12 text-gray-300 hover:text-pink-500 transition-colors duration-300" />
      </a>
      <a
        href="https://www.youtube.com/@dockbloxx"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
      >
        <AiOutlineYoutube className="w-12 h-12 text-gray-300 hover:text-red-600 transition-colors duration-300" />
      </a>
    </div>
  );
};

export default SocialMediaLinks;
