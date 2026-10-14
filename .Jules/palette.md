## 2025-02-20 - Adding Accessibility Attributes to Sidebar
**Learning:** While reviewing `Sidebar.tsx`, I discovered that the custom theme toggle buttons lacked proper grouping and context for screen readers.
**Action:** Implemented the ARIA `role="group"` and `aria-pressed` properties to the buttons to clearly convey selection status to assistive technologies.
