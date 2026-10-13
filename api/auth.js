import axios from "axios";

export const IDENTITY_TOOLKIT_KEY = "AIzaSyDOQYVx5oeWJ2ZhAyp85oD8mjnF2zO7ago";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/userinfo/v2/me";

const authenticate = async (mode, email, password) => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${IDENTITY_TOOLKIT_KEY}`;
  const { data } = await axios.post(url, {
    email,
    password,
    returnSecureToken: true,
  });
  return data;
};

export const signUpApi = (email, password) => {
  return authenticate("signUp", email, password);
};

export const loginApi = (email, password) => {
  return authenticate("signInWithPassword", email, password);
};

// `locale` picks which of Firebase's built-in email templates is sent. Without
// it the reset mail always arrives in English, even for a user running the app
// in Vietnamese. Everything else about that email — the sender name, the
// subject, and the "project-…" title — lives in the Firebase console, not here.
export const sendPasswordResetApi = (email, locale = "en") => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${IDENTITY_TOOLKIT_KEY}`;
  return axios.post(
    url,
    { requestType: "PASSWORD_RESET", email },
    { headers: { "X-Firebase-Locale": locale } }
  );
};

export const fetchGoogleUser = async (accessToken) => {
  const { data } = await axios.get(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};
