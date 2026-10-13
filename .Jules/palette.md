## 2026-10-13 - Adding accessibility to Sidebar
**Learning:** Found that the theme toggle was just a generic button with no clear indication it's a theme switcher group, and the main navigation items were missing standard `aria-current` attributes to convey which page is active to screen readers.
**Action:** Added `aria-current="page"` on active nav links and wrapped the theme toggles in a `role="radiogroup"` container with `role="radio"` on individual toggles to semantically group them and indicate their state.
