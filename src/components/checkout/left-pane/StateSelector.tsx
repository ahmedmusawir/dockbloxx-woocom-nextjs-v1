"use client";

import React from "react";
import Select from "react-select";

// Define the type for a state option.
export type OptionType = {
  value: string;
  label: string;
};

// The array of US states.
const states: OptionType[] = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

type StateSelectorProps = {
  /** The currently selected state code (e.g. "CA") */
  value?: string;
  /** Called whenever the user picks a new state */
  onChange: (newState: string | null) => void;
};

const StateSelector = ({ value, onChange }: StateSelectorProps) => {
  // Find the option that matches the current value.
  const selectedOption =
    states.find((option) => option.value === value) || null;

  return (
    <Select
      instanceId="state-selector" // <-- Fixed instanceId
      inputId="state-selector-input" // (optional) fixed input id
      options={states}
      value={selectedOption}
      onChange={(option) => onChange(option ? option.value : null)}
      isClearable
      placeholder="Select a state..."
      styles={{
        control: (base) => ({
          ...base,
          paddingTop: "5px", // Adjust top padding
          paddingBottom: "5px", // Adjust bottom padding
        }),
      }}
    />
  );
};

export default StateSelector;
