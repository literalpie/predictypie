import { toggleTheme, theme } from "../lib/theme";
import Button from "./Button";

export default function ThemeToggle() {
  return (
    <Button
      variant="secondary"
      onClick={toggleTheme}
      title={`Switch to ${theme() === "light" ? "dark" : "light"} mode`}
    >
      {theme() === "light" ? "🌙" : "☀️"}
    </Button>
  );
}
