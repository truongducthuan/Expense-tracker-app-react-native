import axios from "axios";

const API_KEY = "AIzaSyDOQYVx5oeWJ2ZhAyp85oD8mjnF2zO7ago";

const authenticate = async (mode, email, password) => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}`;
  const res = await axios.post(`${url}?key=${API_KEY}`, {
    email,
    password,
    returnSecureToken: true,
  });
  return res.data;
};

// Returns { statusCodes } or empty object if native module unavailable (Expo Go)
export const getStatusCodes = () => {
  try {
    return require("@react-native-google-signin/google-signin").statusCodes;
  } catch {
    return {};
  }
};

// Returns user data object or null if cancelled. Throws if native module missing.
export const loginWithGoogle = async () => {
  const { GoogleSignin } = require("@react-native-google-signin/google-signin");
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (response.type === "success") {
    return response.data;
  }
  return null; // cancelled
};

export const signUpApi = (email, password) => {
  return authenticate("signUp", email, password);
};

export const loginApi = (email, password) => {
  return authenticate("signInWithPassword", email, password);
};
