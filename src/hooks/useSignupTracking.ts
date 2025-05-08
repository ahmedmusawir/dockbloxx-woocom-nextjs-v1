/**
 * /hooks/useSignupTracking.ts
 *
 * Tracks user signup events and pushes them into the GTM dataLayer.
 * This can be triggered after successful registration.
 */

import { trackEvent } from "@/lib/analytics";

export interface SignupUser {
  id: string;
  email: string;
  plan?: string;
  source?: string;
}

export const useSignupTracking = () => {
  const trackSignup = (user: SignupUser) => {
    trackEvent({
      event: "user_signup",
      user_id: user.id,
      email: user.email,
      signup_source: user.source || "web_form",
      plan: user.plan || "free",
    });
  };

  return { trackSignup };
};
