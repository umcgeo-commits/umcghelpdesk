import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";

// NOTE: This project was originally scaffolded on the vly.ai platform, which
// used a proprietary email-OTP relay (email.vly.ai) to deliver login codes.
// That service is only reachable from inside vly.ai's hosting environment,
// which is why login was failing once the project was self-hosted on GitHub.
//
// Auth now uses email + password (no external email service required),
// plus anonymous "continue as guest" sign-in.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // Persist the display name submitted on sign-up onto the users table.
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string | undefined,
        };
      },
    }),
    Anonymous,
  ],
});
