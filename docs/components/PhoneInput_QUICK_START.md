# PhoneInput - Quick Start Guide ⚡

## 🚀 5-Second Usage

```tsx
import { PhoneInput } from "@/components/PhoneInput";

<PhoneInput value={phone} onChange={setPhone} />
```

Done! 🎉

---

## 📦 What You Get

- ✅ **50+ Countries** with flags 🇺🇸 🇻🇳 🇬🇧 🇯🇵
- ✅ **Searchable Dropdown** - Type to find country
- ✅ **Auto-formatting** - Combines dial code + number
- ✅ **Responsive** - Mobile & desktop ready
- ✅ **Error Handling** - Built-in validation display

---

## 💻 Complete Example

```tsx
import { useState } from "react";
import { PhoneInput } from "@/components/PhoneInput";

function MyForm() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!phone) {
      setError("Phone is required");
      return;
    }
    // Submit: phone = "+1 5551234567"
    console.log(phone);
  };

  return (
    <div>
      <label>Phone number</label>
      <PhoneInput
        value={phone}
        onChange={(val) => {
          setPhone(val);
          setError(""); // Clear error on change
        }}
        error={error}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

---

## 🎯 Props (4 total, 2 required)

| Prop | Type | Required | Example |
|------|------|----------|---------|
| `value` | string | ✅ Yes | `"+1 5551234"` |
| `onChange` | function | ✅ Yes | `(val) => setPhone(val)` |
| `className` | string | ❌ No | `"my-custom-class"` |
| `error` | string | ❌ No | `"Required field"` |

---

## 🌍 Output Format

```typescript
// What you get from onChange:
"+1 5551234567"        // US
"+44 7911123456"       // UK
"+84 912345678"        // Vietnam
"+81 9012345678"       // Japan
```

Format: `{dialCode} {phoneNumber}`

---

## 🎨 How It Looks

**Closed:**
```
┌──────────┬─────────────┐
│🇺🇸 +1  ▼│ 555-0174   │
└──────────┴─────────────┘
```

**Open:**
```
┌──────────┬─────────────┐
│🇺🇸 +1  ▲│ 555-0174   │
└──────────┴─────────────┘
┌──────────────────────┐
│ Search country...    │
├──────────────────────┤
│🇺🇸 United States  +1│
│🇬🇧 United Kingdom +44│
│🇻🇳 Vietnam        +84│
│... (scrollable)      │
└──────────────────────┘
```

---

## 🔧 Common Use Cases

### 1. Profile Form
```tsx
<PhoneInput
  value={profile.phone}
  onChange={(phone) => setProfile({ ...profile, phone })}
  error={errors.phone}
/>
```

### 2. With Validation
```tsx
const validatePhone = (val: string) => {
  const digits = val.replace(/[^0-9]/g, "");
  return digits.length >= 10 ? "" : "Min 10 digits";
};

<PhoneInput
  value={phone}
  onChange={(val) => {
    setPhone(val);
    setError(validatePhone(val));
  }}
  error={error}
/>
```

### 3. Required Field
```tsx
<PhoneInput
  value={phone}
  onChange={setPhone}
  error={!phone ? "Phone is required" : undefined}
/>
```

---

## 🎯 Features in Action

### Search by Country Name
Type: `"vietnam"` → Shows 🇻🇳 Vietnam

### Search by Dial Code
Type: `"+1"` → Shows 🇺🇸 US, 🇨🇦 Canada

### Auto-parse Existing Value
```tsx
// Input: "+1 (312) 555-0174"
// Component auto-detects: 🇺🇸 +1 and "5550174"
```

### Click Outside to Close
Click anywhere → Dropdown closes automatically

---

## 📱 Responsive

Works perfectly on:
- 📱 Mobile (280px+ width)
- 💻 Desktop (any width)
- 📱 Tablet (all sizes)

---

## 🎨 Customization

### Add Custom Class
```tsx
<PhoneInput
  value={phone}
  onChange={setPhone}
  className="my-phone-input"
/>
```

### Override Styles
```css
.my-phone-input :global(.phoneInputWrapper) {
  border: 2px solid blue;
}
```

---

## 🌍 Top 10 Countries

1. 🇺🇸 United States (+1)
2. 🇬🇧 United Kingdom (+44)
3. 🇨🇦 Canada (+1)
4. 🇻🇳 Vietnam (+84)
5. 🇯🇵 Japan (+81)
6. 🇨🇳 China (+86)
7. 🇰🇷 South Korea (+82)
8. 🇸🇬 Singapore (+65)
9. 🇦🇺 Australia (+61)
10. 🇩🇪 Germany (+49)

**Total: 50+ countries**  
See `src/data/countryCodes.ts` for full list

---

## ❓ FAQ

**Q: How do I get just the phone number without country code?**
```tsx
const number = phone.split(" ")[1]; // Gets "5551234567"
```

**Q: How do I set a different default country?**
Edit `src/data/countryCodes.ts`:
```tsx
export const defaultCountryCode = countryCodes.find(c => c.code === "GB")!;
```

**Q: Can I add more countries?**
Yes! Add to `src/data/countryCodes.ts`:
```tsx
{ country: "Iceland", code: "IS", dialCode: "+354", flag: "🇮🇸" }
```

**Q: How do I validate the phone?**
```tsx
const isValid = phone.replace(/[^0-9]/g, "").length >= 10;
```

---

## 🐛 Troubleshooting

**Issue: Dropdown not showing**
- Check z-index conflicts
- Ensure parent doesn't have `overflow: hidden`

**Issue: Flags not showing**
- Update system fonts
- Use browser that supports emoji

**Issue: TypeScript errors**
- Check import path
- Ensure TypeScript 4.5+

---

## 📚 More Resources

- **Full Documentation:** `src/components/PhoneInput/README.md`
- **Visual Guide:** `src/components/PhoneInput/VISUAL_GUIDE.md`
- **Implementation Details:** `PHONE_INPUT_IMPLEMENTATION.md`
- **Demo Component:** `src/components/PhoneInput/PhoneInput.demo.tsx`

---

## ✅ Checklist

After adding to your form:

- [ ] Imported component
- [ ] Added to form with value/onChange
- [ ] Added error handling (if needed)
- [ ] Tested on mobile
- [ ] Tested dropdown search
- [ ] Verified submit value format

---

## 🎉 You're Ready!

That's all you need to know to use the PhoneInput component!

```tsx
import { PhoneInput } from "@/components/PhoneInput";

<PhoneInput value={phone} onChange={setPhone} />
```

**Simple. Powerful. International. 🌍**

---

**Questions?** Check the full README or contact the dev team.

