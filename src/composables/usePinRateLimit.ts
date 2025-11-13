import { ref, computed, onMounted, onUnmounted } from "vue";

const STORAGE_KEY = "pin-rate-limit";
const MAX_ATTEMPTS_PER_LEVEL = 5;

// Progressive wait times in milliseconds
const WAIT_TIMES = [
  1 * 60 * 1000,      // 5 attempts → 1 min
  5 * 60 * 1000,      // 10 attempts → 5 min
  10 * 60 * 1000,     // 15 attempts → 10 min
  60 * 60 * 1000,     // 20 attempts → 1h
  2 * 60 * 60 * 1000, // 25 attempts → 2h
  5 * 60 * 60 * 1000, // 30 attempts → 5h
  10 * 60 * 60 * 1000, // 35 attempts → 10h
  24 * 60 * 60 * 1000, // 40 attempts → 24h
  5 * 24 * 60 * 60 * 1000, // 45 attempts → 5 days
];

interface RateLimitData {
  failedAttempts: number;
  lockoutUntil: number | null;
}

function getRateLimitData(): RateLimitData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        failedAttempts: data.failedAttempts || 0,
        lockoutUntil: data.lockoutUntil || null,
      };
    }
  } catch (error) {
    console.error("Error reading rate limit data:", error);
  }
  return {
    failedAttempts: 0,
    lockoutUntil: null,
  };
}

function saveRateLimitData(data: RateLimitData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving rate limit data:", error);
  }
}

export function usePinRateLimit() {
  const rateLimitData = ref<RateLimitData>(getRateLimitData());
  const currentTime = ref(Date.now());

  // Update current time every second for reactive countdown
  let timeInterval: number | null = null;
  onMounted(() => {
    timeInterval = window.setInterval(() => {
      currentTime.value = Date.now();
    }, 1000);
  });
  onUnmounted(() => {
    if (timeInterval) {
      clearInterval(timeInterval);
    }
  });

  // Calculate which wait time level we're at
  const waitTimeLevel = computed(() => {
    const attempts = rateLimitData.value.failedAttempts;
    if (attempts < MAX_ATTEMPTS_PER_LEVEL) return 0;
    const level = Math.floor((attempts - MAX_ATTEMPTS_PER_LEVEL) / MAX_ATTEMPTS_PER_LEVEL);
    return Math.min(level, WAIT_TIMES.length - 1);
  });

  // Get current wait time in milliseconds
  const currentWaitTime = computed(() => {
    return WAIT_TIMES[waitTimeLevel.value] || 0;
  });

  // Check if user is currently locked out
  const isLockedOut = computed(() => {
    if (!rateLimitData.value.lockoutUntil) return false;
    return currentTime.value < rateLimitData.value.lockoutUntil;
  });

  // Get remaining lockout time in milliseconds
  const remainingLockoutTime = computed(() => {
    if (!isLockedOut.value || !rateLimitData.value.lockoutUntil) return 0;
    return Math.max(0, rateLimitData.value.lockoutUntil - currentTime.value);
  });

  // Get remaining attempts before next lockout
  const remainingAttempts = computed(() => {
    const attempts = rateLimitData.value.failedAttempts;
    const level = waitTimeLevel.value;
    const attemptsInCurrentLevel = attempts % MAX_ATTEMPTS_PER_LEVEL;
    return MAX_ATTEMPTS_PER_LEVEL - attemptsInCurrentLevel;
  });

  // Record a failed attempt
  function recordFailedAttempt(): void {
    const newAttempts = rateLimitData.value.failedAttempts + 1;
    
    // Check if we've hit a new lockout threshold (at 5, 10, 15, 20, etc.)
    let lockoutUntil = rateLimitData.value.lockoutUntil;
    if (newAttempts >= MAX_ATTEMPTS_PER_LEVEL && newAttempts % MAX_ATTEMPTS_PER_LEVEL === 0) {
      // Calculate which wait time level we're at
      // 5 attempts = level 0, 10 attempts = level 1, 15 attempts = level 2, etc.
      const level = Math.floor((newAttempts - MAX_ATTEMPTS_PER_LEVEL) / MAX_ATTEMPTS_PER_LEVEL);
      const waitTime = WAIT_TIMES[Math.min(level, WAIT_TIMES.length - 1)] || 0;
      lockoutUntil = Date.now() + waitTime;
    }

    const newData: RateLimitData = {
      failedAttempts: newAttempts,
      lockoutUntil,
    };

    rateLimitData.value = newData;
    saveRateLimitData(newData);
  }

  // Reset attempts on successful PIN entry
  function resetAttempts(): void {
    const newData: RateLimitData = {
      failedAttempts: 0,
      lockoutUntil: null,
    };
    rateLimitData.value = newData;
    saveRateLimitData(newData);
  }

  // Format time remaining as human-readable string
  function formatTimeRemaining(ms: number): string {
    if (ms <= 0) return "0 seconds";

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ${hours % 24} hour${(hours % 24) > 1 ? "s" : ""}`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes % 60} minute${(minutes % 60) > 1 ? "s" : ""}`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ${seconds % 60} second${(seconds % 60) > 1 ? "s" : ""}`;
    }
    return `${seconds} second${seconds > 1 ? "s" : ""}`;
  }

  return {
    isLockedOut,
    remainingLockoutTime,
    remainingAttempts,
    currentWaitTime,
    waitTimeLevel,
    recordFailedAttempt,
    resetAttempts,
    formatTimeRemaining,
  };
}

