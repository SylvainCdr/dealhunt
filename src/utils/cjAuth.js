// utils/cjAuth.js

if (!global.cachedAccessToken) {
  global.cachedAccessToken = null;
  global.cachedRefreshToken = null;
  global.accessTokenExpire = 0;
  global.loginInProgress = null;
}

const LOGIN_INTERVAL = 5 * 60 * 1000; // 5 min

async function fullLogin() {
  const now = Date.now();

  if (global.cachedAccessToken && now < global.accessTokenExpire) {
    return global.cachedAccessToken;
  }

  if (global.loginInProgress) return global.loginInProgress;

  global.loginInProgress = (async () => {
    const res = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.CJ_EMAIL,
        password: process.env.CJ_API_KEY,
      }),
    });

    const data = await res.json();
    if (!data.result) {
      global.loginInProgress = null;
      throw new Error(`Login failed: ${data.message} (code ${data.code})`);
    }

    global.cachedAccessToken = data.data.accessToken;
    global.cachedRefreshToken = data.data.refreshToken;
    global.accessTokenExpire = new Date(data.data.accessTokenExpiryDate).getTime();
    global.loginInProgress = null;
    return global.cachedAccessToken;
  })();

  return global.loginInProgress;
}

async function refreshToken() {
  if (!global.cachedRefreshToken) return fullLogin();
  if (global.loginInProgress) return global.loginInProgress;

  global.loginInProgress = (async () => {
    const res = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/refreshAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: global.cachedRefreshToken }),
    });

    const data = await res.json();
    if (!data.result) {
      console.warn("Refresh failed, performing full login");
      global.loginInProgress = null;
      return fullLogin();
    }

    global.cachedAccessToken = data.data.accessToken;
    global.cachedRefreshToken = data.data.refreshToken;
    global.accessTokenExpire = new Date(data.data.accessTokenExpiryDate).getTime();
    global.loginInProgress = null;
    return global.cachedAccessToken;
  })();

  return global.loginInProgress;
}

export async function getAccessToken() {
  const now = Date.now();
  if (global.cachedAccessToken && now < global.accessTokenExpire - 60_000) {
    return global.cachedAccessToken;
  }
  return refreshToken();
}
