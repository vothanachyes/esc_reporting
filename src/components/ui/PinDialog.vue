<template>
  <PrimeDialog
    v-model:visible="isVisible"
    modal
    :closable="false"
    :draggable="false"
    class="pin-dialog"
    :pt="{
      root: { class: 'max-w-md mx-auto' },
      content: { class: 'p-6' },
    }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <svg
            class="w-6 h-6 text-primary-600 dark:text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Enter PIN
        </h3>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Lockout Message -->
      <div v-if="isLockedOut" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
        <div class="flex items-start gap-2">
          <svg
            class="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div class="flex-1">
            <p class="text-xs font-semibold text-red-800 dark:text-red-200 mb-0.5">
              Too Many Failed Attempts
            </p>
            <p class="text-xs text-red-700 dark:text-red-300">
              Please wait <strong>{{ formatTimeRemaining(remainingLockoutTime) }}</strong> before trying again.
            </p>
          </div>
        </div>
      </div>

      <!-- PIN Input -->
      <div v-else class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            6-Digit PIN
          </label>
          <input
            ref="pinInputRef"
            v-model="pinValue"
            type="password"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            class="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-gray-100 transition-colors"
            placeholder="••••••"
            :disabled="isVerifying || isLockedOut"
            @input="handlePinInput"
            @keyup.enter="handleSubmit"
          />
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
          <div class="flex items-start gap-2">
            <svg
              class="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <div class="flex-1">
              <p class="text-xs font-semibold text-red-800 dark:text-red-200 mb-0.5">
                Wrong PIN
              </p>
              <p class="text-xs text-red-700 dark:text-red-300">
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </div>

        <!-- Remaining Attempts -->
        <div v-if="remainingAttempts > 0 && remainingAttempts < 5" class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
          <p class="text-xs text-amber-800 dark:text-amber-200">
            <strong>{{ remainingAttempts }}</strong> attempt{{ remainingAttempts > 1 ? "s" : "" }} remaining before lockout
          </p>
        </div>

        <!-- Remember Me Checkbox -->
        <div class="flex items-center gap-2">
          <input
            id="remember-me"
            v-model="rememberMe"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
            :disabled="isVerifying || isLockedOut"
          />
          <label for="remember-me" class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Remember me (stay logged in)
          </label>
        </div>

        <!-- Info Message -->
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
          <p class="text-xs text-blue-800 dark:text-blue-200">
            <strong>ℹ️ Info:</strong> PIN from Vothana CHY
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <PrimeButton
          label="Submit"
          type="button"
          :loading="isVerifying"
          :disabled="isLockedOut || pinValue.length !== 6 || isVerifying"
          @click="handleSubmit"
          class="px-6 cursor-pointer"
        />
      </div>
    </template>
  </PrimeDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import PrimeDialog from "primevue/dialog";
import PrimeButton from "primevue/button";
import { usePinVerification } from "@/composables/usePinVerification";

const router = useRouter();

const {
  isVerified,
  isVerifying,
  isLockedOut,
  remainingLockoutTime,
  remainingAttempts,
  verifyPin,
  formatTimeRemaining,
} = usePinVerification();

const pinValue = ref("");
const rememberMe = ref(false);
const errorMessage = ref("");
const pinInputRef = ref<HTMLInputElement | null>(null);

const isVisible = computed({
  get: () => !isVerified.value,
  set: () => {
    // Dialog cannot be closed manually
  },
});

// Auto-focus PIN input when dialog opens
watch(isVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      pinInputRef.value?.focus();
    });
  }
});

onMounted(() => {
  if (!isVerified.value) {
    nextTick(() => {
      pinInputRef.value?.focus();
    });
  }
});

// Handle PIN input - only allow digits
function handlePinInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, ""); // Remove non-digits
  pinValue.value = value.slice(0, 6); // Limit to 6 digits
  errorMessage.value = ""; // Clear error on new input
}

// Handle form submission
async function handleSubmit(event?: Event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (pinValue.value.length !== 6 || isVerifying.value || isLockedOut.value) {
    return;
  }

  errorMessage.value = "";
  const isValid = await verifyPin(pinValue.value, rememberMe.value);

  if (!isValid) {
    errorMessage.value = `Incorrect PIN. Please try again. ${remainingAttempts.value > 0 ? `(${remainingAttempts.value} attempt${remainingAttempts.value > 1 ? "s" : ""} remaining)` : ""}`;
    pinValue.value = "";
    await nextTick();
    pinInputRef.value?.focus();
  } else {
    // Redirect to home page after successful PIN verification
    await nextTick();
    router.push({ name: "Home" });
  }
}

// Countdown is handled by the composable's reactive timer
</script>

<style scoped>
/* Style the PrimeDialog backdrop with technology image and blur */
:deep(.pin-dialog .p-dialog-mask) {
  background-image: url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80') !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

:deep(.pin-dialog .p-dialog-mask::before) {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: -1;
}

:deep(.pin-dialog .p-dialog-content) {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

:deep(.dark .pin-dialog .p-dialog-content) {
  background: rgba(17, 24, 39, 0.95);
}

:deep(.pin-dialog .p-dialog-header) {
  padding: 1.5rem;
  border-bottom: 1px solid rgb(229 231 235 / 1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

:deep(.dark .pin-dialog .p-dialog-header) {
  border-bottom-color: rgb(75 85 99 / 1);
  background: rgba(17, 24, 39, 0.95);
}

:deep(.pin-dialog .p-dialog-footer) {
  padding: 1.5rem;
  border-top: 1px solid rgb(229 231 235 / 1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

:deep(.dark .pin-dialog .p-dialog-footer) {
  border-top-color: rgb(75 85 99 / 1);
  background: rgba(17, 24, 39, 0.95);
}

:deep(.pin-dialog .p-dialog) {
  background: transparent;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}
</style>

