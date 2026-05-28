import axios from "axios";

const IDENTITY_TOOLKIT_KEY = "AIzaSyDOQYVx5oeWJ2ZhAyp85oD8mjnF2zO7ago";
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

export const sendPasswordResetApi = (email) => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${IDENTITY_TOOLKIT_KEY}`;
  return axios.post(url, { requestType: "PASSWORD_RESET", email });
};

export const fetchGoogleUser = async (accessToken) => {
  const { data } = await axios.get(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};
