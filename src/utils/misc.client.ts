import { useEffect, useState } from "react";

// 🐨 here's a good place to put the useHydrated hook
export function useHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
