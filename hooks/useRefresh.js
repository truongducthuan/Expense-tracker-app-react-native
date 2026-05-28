import { useState } from "react";

// Wraps an async refresh action with the boolean state RefreshControl needs.
export default function useRefresh(onRefresh) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return { refreshing, handleRefresh };
}
