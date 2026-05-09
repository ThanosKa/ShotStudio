# UX Writing Guidelines

Rules for all user-facing strings in Odyrides — validation errors, toasts, empty states, and confirmation copy.

Applies to:
- `apps/web/i18n/locales/en.json` and `el.json`
- `apps/mobile/lib/i18n/locales/en.json` and `el.json`
- Hardcoded Zod `.message()` strings in `packages/shared/src/validation/`

---

## Good vs Bad — Reference Table

Use this as the benchmark when reviewing or writing any validation message:

| Field | Bad (Technical / Poor UX) | Good (User-Friendly) |
|-------|---------------------------|----------------------|
| Name | `"Invalid string"` or `"Required"` | `"Please enter your full name"` |
| Email | `"Invalid email"` or `"Expected string"` | `"Please enter a valid email address (e.g. name@example.com)"` |
| Password | `"Too small"` or `"Must contain uppercase"` | `"Password must be at least 8 characters and include a letter and a number"` |
| Age | `"Number must be greater than 18"` | `"You must be at least 18 years old to sign up"` |
| Phone | `"Invalid input"` | `"Please enter a valid phone number (e.g. +1 234 567 8900)"` |
| Date of Birth | `"Invalid date"` | `"Please enter your date of birth in MM/DD/YYYY format"` |
| Username | `"Too few characters"` | `"Username must be at least 3 characters long"` |
| Required field | `"Field is required"` | `"This field is required"` |

---

## Validation Error Messages

### Banned patterns

| Pattern | Example | Why |
|---------|---------|-----|
| `"X is required"` | `"Email is required"` | Cold, machine-like — gives no direction |
| `"Invalid X"` | `"Invalid phone number"` | Tells user what's wrong, not what to do |
| `"Invalid X format"` | `"Invalid price format"` | "Format" is developer language |
| `"X must be at least N characters"` | `"Phone must be at least 8 characters"` | Leaks internal constraints — users don't count chars |
| `"Slug must be..."` | `"Slug must be at least 3 characters"` | "Slug" is internal jargon — say "URL" |

### Required patterns

| Situation | Pattern | Example |
|-----------|---------|---------|
| Field is empty / missing | `"Please enter [field]"` | `"Please enter your name"` |
| Value doesn't match expected format | `"Please enter a valid [field] (e.g. X)"` | `"Please enter a valid price (e.g. 25.00)"` |
| Value is wrong (code, credential) | `"The [field] you entered is incorrect."` | `"The verification code you entered is incorrect."` |
| Phone number fails validation | `"Please enter a valid phone number for your country"` | — |
| Phone length too short | `"Please enter a complete phone number"` | — |
| Phone length too long | `"Phone number is too long"` | — |
| OTP / code missing | `"Please enter the 6-digit verification code"` | — |
| OTP / code non-numeric | `"The verification code should only contain numbers"` | — |

### Quick reference

```
"Name is required"               → "Please enter your name"
"Invalid email"                  → "Please enter a valid email address"
"Invalid price format"           → "Please enter a valid price (e.g. 25.00)"
"Invalid code"                   → "The verification code you entered is incorrect."
"Phone must be at least 8 chars" → "Please enter a complete phone number"
"Slug must be at least 3 chars"  → "URL must be at least 3 characters long"
```

---

## Toast & Server Error Messages

- Use `"Couldn't [verb] the [noun]. Please try again."` for action failures
  - `"Couldn't save the transfer. Please try again."`
  - `"Couldn't send the invitation. Please try again."`
- Use `"[Noun] saved."` / `"[Noun] deleted."` for success confirmations — short, no filler
- Never use `"Error"` or `"Success"` as standalone toast titles with no body

---

## Empty States

- Lead with what's missing, follow with what to do:
  - `"No transfers yet"` + `"Create your first transfer to get started."`
- Never just show `"No data"` or `"Nothing here"`

---

## Confirmation Dialogs

- Destructive action button should name the action, not just say "Confirm":
  - `"Delete hotel"` not `"Confirm"`
  - `"Remove driver"` not `"OK"`
- Body copy should state what will be lost, concretely

---

## General Tone Rules

1. **Address the user directly** — use "your", "you", not "the user's"
2. **No ellipsis in translation values** — use `"Saving"` not `"Saving..."` (CLAUDE.md rule)
3. **Don't blame the user** — `"That code isn't correct"` not `"You entered an invalid code"`
4. **Be specific** — include a concrete example `(e.g. 25.00)` whenever the expected format isn't obvious
5. **Consistent sentence case** — all messages sentence case, period at end of full sentences only
