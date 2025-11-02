# PhoneInput Component

A modern, user-friendly phone input component with country code dropdown selector.

## Features

✅ **50+ Countries** - Comprehensive list of international country codes  
✅ **Searchable Dropdown** - Quickly find countries by name, code, or dial code  
✅ **Flag Emojis** - Visual country identification  
✅ **Auto-formatting** - Automatically combines country code + phone number  
✅ **Responsive Design** - Works great on mobile and desktop  
✅ **Error Handling** - Built-in error state styling  
✅ **Accessible** - Keyboard navigation and screen reader support  
✅ **TypeScript** - Full type safety

## Installation

The component is already included in the project. No additional installation needed.

## Usage

### Basic Example

```tsx
import { useState } from "react";
import { PhoneInput } from "@/components/PhoneInput";

function MyForm() {
  const [phone, setPhone] = useState("");

  return (
    <PhoneInput
      value={phone}
      onChange={setPhone}
    />
  );
}
```

### With Validation

```tsx
import { useState } from "react";
import { PhoneInput } from "@/components/PhoneInput";

function ProfileForm() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const validatePhone = (value: string) => {
    if (!value) {
      setError("Phone number is required");
    } else if (value.replace(/[^0-9]/g, "").length < 10) {
      setError("Phone number must have at least 10 digits");
    } else {
      setError("");
    }
  };

  return (
    <PhoneInput
      value={phone}
      onChange={(value) => {
        setPhone(value);
        validatePhone(value);
      }}
      error={error}
    />
  );
}
```

### In a Form

```tsx
function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Phone:", formData.phone);
    // Submit form...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      
      <PhoneInput
        value={formData.phone}
        onChange={(phone) => setFormData({ ...formData, phone })}
      />
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | The current phone value (with country code) |
| `onChange` | `(value: string) => void` | Yes | Callback when phone changes |
| `className` | `string` | No | Additional CSS class for the container |
| `error` | `string` | No | Error message to display |

## Value Format

The component returns the full phone number in this format:

```
{dialCode} {phoneNumber}
```

**Examples:**
- `+1 5551234567`
- `+44 7911123456`
- `+84 912345678`

## Supported Countries

The component includes 50+ countries with their dial codes:

- 🇺🇸 United States (+1)
- 🇬🇧 United Kingdom (+44)
- 🇨🇦 Canada (+1)
- 🇻🇳 Vietnam (+84)
- 🇯🇵 Japan (+81)
- 🇨🇳 China (+86)
- 🇰🇷 South Korea (+82)
- 🇸🇬 Singapore (+65)
- And many more...

See `src/data/countryCodes.ts` for the complete list.

## Customization

### Styling

You can customize the appearance by:

1. **Using className prop:**
```tsx
<PhoneInput
  value={phone}
  onChange={setPhone}
  className="my-custom-phone-input"
/>
```

2. **Overriding CSS modules:**
```css
/* In your component's CSS file */
.myForm :global(.phoneInputContainer) {
  border: 2px solid blue;
}
```

3. **Modifying the CSS module directly:**
Edit `src/components/PhoneInput/PhoneInput.module.css`

### Adding More Countries

Edit `src/data/countryCodes.ts`:

```typescript
export const countryCodes: CountryCode[] = [
  // ... existing countries
  { 
    country: "Your Country", 
    code: "XX", 
    dialCode: "+123", 
    flag: "🏳️" 
  },
];
```

### Changing Default Country

Edit `src/data/countryCodes.ts`:

```typescript
// Change the default from US to another country
export const defaultCountryCode = countryCodes.find(c => c.code === "GB")!;
```

## Features in Detail

### Search Functionality

Users can search countries by:
- Country name (e.g., "United States")
- Country code (e.g., "US")
- Dial code (e.g., "+1")

### Dropdown Behavior

- Opens on click
- Closes when clicking outside
- Closes when selecting a country
- Auto-focuses search input when opened
- Scrollable list with custom scrollbar

### Phone Number Parsing

When a value is provided, the component automatically:
1. Detects the country code
2. Separates it from the phone number
3. Updates the dropdown to match the country

## Integration Examples

### ProfilePage Integration

```tsx
import { PhoneInput } from "../../components/PhoneInput";

const ProfileForm = () => {
  const [profile, setProfile] = useState({
    name: "John Doe",
    phone: "+1 5551234567"
  });

  return (
    <form>
      <label>
        <span>Phone number</span>
        <PhoneInput
          value={profile.phone}
          onChange={(phone) => setProfile({ ...profile, phone })}
        />
      </label>
    </form>
  );
};
```

### Checkout Form

```tsx
const CheckoutForm = () => {
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    address: ""
  });

  return (
    <div>
      <h2>Shipping Information</h2>
      <PhoneInput
        value={shippingInfo.phone}
        onChange={(phone) => setShippingInfo({ ...shippingInfo, phone })}
        error={!shippingInfo.phone ? "Phone required for delivery" : undefined}
      />
    </div>
  );
};
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Focus management
- ARIA labels (can be enhanced)

## Performance

- Lightweight (~3KB gzipped with country data)
- No external dependencies (except React)
- Optimized rendering
- Efficient search filtering

## Troubleshooting

### Dropdown not closing

Make sure the component is not inside a form that's preventing event propagation.

### Styling issues

Check that CSS modules are properly configured in your build tool.

### TypeScript errors

Ensure you're using TypeScript 4.5+ and have proper type definitions.

## Future Enhancements

Potential improvements:

- [ ] Phone number validation per country
- [ ] Auto-formatting with country-specific patterns
- [ ] Recent/favorite countries
- [ ] RTL support
- [ ] Custom flag icons
- [ ] Virtual scrolling for better performance
- [ ] i18n support

## License

Part of the TimeLite Clothing website project.

## Support

For issues or questions, please contact the development team.

