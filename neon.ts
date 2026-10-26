import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  auth: true,
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // Persistent development branch: no auto-expiration.
      if (branch.name === "dev") {
        return {};
      }
      // Other new (feature/preview) branches: auto-expire after 7 days.
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
