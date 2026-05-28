import { useEffect, useRef } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import { fetchGoogleUser } from "../api/auth";
import { googleAuthConfig } from "../constants/googleAuth";

// Required so the browser auth popup can close itself and return to the app.
WebBrowser.maybeCompleteAuthSession();

const toUser = (profile, token) => ({
  email: profile.email,
  name: profile.name,
  photo: profile.picture,
  token,
});

// Drives the Google OAuth flow. Calls onSuccess(user) once the access token is
// exchanged for a profile, or onError(err) if the flow fails.
export default function useGoogleAuth({ onSuccess, onError }) {
  const [request, response, promptAsync] =
    Google.useAuthRequest(googleAuthConfig);

  const handlers = useRef({ onSuccess, onError });
  handlers.current = { onSuccess, onError };

  useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      const accessToken = response.authentication?.accessToken;
      if (!accessToken) return;
      fetchGoogleUser(accessToken)
        .then((profile) => handlers.current.onSuccess(toUser(profile, accessToken)))
        .catch((err) => handlers.current.onError?.(err));
    } else if (response.type === "error") {
      handlers.current.onError?.(response.error);
    }
  }, [response]);

  return {
    isReady: !!request,
    promptGoogleLogin: () => promptAsync(),
  };
}
