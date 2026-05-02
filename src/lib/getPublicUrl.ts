export const getPublicUrl = () => {
  if (import.meta.env.VITE_IS_PROD) {
    return import.meta.env.VITE_URL || "https://localhost:3000";
  }
  return import.meta.env.VITE_PUBLIC_URL || "https://localhost:3000";
};
