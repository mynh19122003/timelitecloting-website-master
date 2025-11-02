export type CountryCode = {
  country: string;
  code: string;
  dialCode: string;
  flag: string;
};

export const countryCodes: CountryCode[] = [
  { country: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { country: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { country: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { country: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { country: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { country: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { country: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { country: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { country: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { country: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { country: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷" },
  { country: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  { country: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰" },
  { country: "Taiwan", code: "TW", dialCode: "+886", flag: "🇹🇼" },
  { country: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳" },
  { country: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭" },
  { country: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾" },
  { country: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩" },
  { country: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭" },
  { country: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { country: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
  { country: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩" },
  { country: "UAE", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { country: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { country: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱" },
  { country: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷" },
  { country: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺" },
  { country: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
  { country: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
  { country: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷" },
  { country: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱" },
  { country: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴" },
  { country: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪" },
  { country: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
  { country: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
  { country: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪" },
  { country: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬" },
  { country: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
  { country: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪" },
  { country: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
  { country: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹" },
  { country: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪" },
  { country: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴" },
  { country: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰" },
  { country: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮" },
  { country: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱" },
  { country: "Czech Republic", code: "CZ", dialCode: "+420", flag: "🇨🇿" },
  { country: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹" },
  { country: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷" },
  { country: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪" },
  { country: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
];

// Default country code (US)
export const defaultCountryCode = countryCodes[0];

