// OAuth client IDs from Google Cloud Console (APIs & Services > Credentials).
// webClientId is reused from the previous native-google-signin setup.
// androidClientId/iosClientId must match this app's package id + signing SHA-1
// and are required when the OAuth flow runs inside the development build.
export const googleAuthConfig = {
  webClientId:
    "300384576511-1cfq6psoqtub50pck22es3nr3adtfcai.apps.googleusercontent.com",
  androidClientId: "936678818955-5gmgb6ema083dsid1lrk7m081qkosh7r.apps.googleusercontent.com", // TODO: fill from Google Cloud Console (Android client)
  iosClientId: "", // TODO: fill from Google Cloud Console (iOS client)
};
