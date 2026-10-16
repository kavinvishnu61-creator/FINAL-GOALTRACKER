## 2024-05-14 - Confirmation dialogs for destructive actions
**Learning:** Found that users could accidentally delete complex data (goals and habits) because icon-only "trash" buttons lacked confirmation dialogs and proper ARIA labels. Icon buttons, especially for destructive actions, require both a safety net (like `window.confirm`) and clear screen reader identification.
**Action:** Always wrap destructive state modifications with a confirmation prompt and include `aria-label` and `title` attributes on icon-only buttons.
