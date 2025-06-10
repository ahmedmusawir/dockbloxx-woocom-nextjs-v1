"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input"; // Assuming Shadcn Input
import { Button } from "@/components/ui/button"; // Assuming Shadcn Button

interface SearchControlsProps {
  onSearchSubmit: (searchTerm: string) => void; // Callback to notify parent
  isLoading: boolean; // To disable button during search
}

const SearchControls = ({ onSearchSubmit, isLoading }: SearchControlsProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearchSubmit(searchTerm.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 mt-4 w-full max-w-xs mx-auto flex flex-col sm:flex-row sm:max-w-xl lg:max-w-2xl items-stretch sm:items-center gap-3 p-2 border-2 border-gray-200 rounded-none shadow-sm bg-gray-0"
    >
      <Input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search Dockbloxx Products..."
        className="w-full sm:flex-grow text-base rounded-none py-5"
        aria-label="Search Products"
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={isLoading || !searchTerm.trim()}
        className="w-full sm:w-auto text-base px-6 py-5 rounded-none"
      >
        {isLoading ? "Searching..." : "Search Now"}
      </Button>
    </form>
  );
};

export default SearchControls;
