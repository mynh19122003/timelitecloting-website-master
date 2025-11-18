import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import styles from "./FilterDropdown.module.css";

type FilterDropdownProps = {
  label: string;
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  placeholder?: string;
};

export const FilterDropdown = ({
  label,
  options,
  selectedValue,
  onSelect,
  placeholder = "All",
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (value: string | null) => {
    onSelect(value);
    setIsOpen(false);
  };

  const displayValue = selectedValue || label;

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{displayValue}</span>
        <FiChevronDown size={14} className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`} />
      </button>
      {isOpen && (
        <div className={styles.menu} role="listbox">
          <button
            type="button"
            className={`${styles.option} ${!selectedValue ? styles.optionActive : ""}`}
            onClick={() => handleSelect(null)}
            role="option"
            aria-selected={!selectedValue}
          >
            All {label}
          </button>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`${styles.option} ${selectedValue === option ? styles.optionActive : ""}`}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={selectedValue === option}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

