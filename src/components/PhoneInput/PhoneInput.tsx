import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { countryCodes, defaultCountryCode, CountryCode } from "../../data/countryCodes";
import styles from "./PhoneInput.module.css";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
};

export const PhoneInput = ({ value, onChange, className = "", error }: PhoneInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountryCode);
  const [phoneNumber, setPhoneNumber] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse the initial value to extract country code and phone number
  useEffect(() => {
    if (value) {
      // Try to match the dial code from the value
      const matchedCountry = countryCodes.find((country) => 
        value.startsWith(country.dialCode)
      );
      
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        // Remove the dial code and any leading spaces/parentheses
        const number = value
          .substring(matchedCountry.dialCode.length)
          .replace(/^\s*\(?\s*/, "")
          .trim();
        setPhoneNumber(number);
      } else {
        setPhoneNumber(value);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm("");
    
    // Update the full phone value
    const fullPhone = phoneNumber ? `${country.dialCode} ${phoneNumber}` : country.dialCode;
    onChange(fullPhone);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value;
    setPhoneNumber(number);
    
    // Update the full phone value
    const fullPhone = number ? `${selectedCountry.dialCode} ${number}` : selectedCountry.dialCode;
    onChange(fullPhone);
  };

  const filteredCountries = countryCodes.filter(
    (country) =>
      country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${styles.phoneInputContainer} ${className}`}>
      <div className={styles.phoneInputWrapper}>
        {/* Country Code Dropdown */}
        <div className={styles.countrySelector} ref={dropdownRef}>
          <button
            type="button"
            className={styles.countrySelectorButton}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={styles.flag}>{selectedCountry.flag}</span>
            <span className={styles.dialCode}>{selectedCountry.dialCode}</span>
            <FiChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} />
          </button>

          {isOpen && (
            <div className={styles.dropdown}>
              <div className={styles.searchWrapper}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm quốc gia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <ul className={styles.countryList}>
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <li key={country.code}>
                      <button
                        type="button"
                        className={`${styles.countryItem} ${
                          selectedCountry.code === country.code ? styles.countryItemActive : ""
                        }`}
                        onClick={() => handleCountrySelect(country)}
                      >
                        <span className={styles.flag}>{country.flag}</span>
                        <span className={styles.countryName}>{country.country}</span>
                        <span className={styles.dialCode}>{country.dialCode}</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className={styles.noResults}>No countries found</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="555-0174"
          className={`${styles.phoneInput} ${error ? styles.phoneInputError : ""}`}
        />
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

