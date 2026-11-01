
const DiarySecurity = (() => {
  const STORAGE_KEY = "krustyCrabPassword";
  const ITERATIONS = 310000;

  function toBase64(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
  }

  function fromBase64(value) {
    return Uint8Array.from(atob(value), char => char.charCodeAt(0));
  }

  async function hashPassword(password, salt) {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    return crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: ITERATIONS,
        hash: "SHA-256"
      },
      key,
      256
    );
  }

  async function verify(password) {
    if (!password || password.length < 10) {
      return false;
    }

    const saved = localStorage.getItem(STORAGE_KEY);

    // First visit: create a new password.
    if (!saved) {
      const confirmation = prompt(
        "Welcome! Create your private diary password. You will need it every time you open your diary."
      );

      if (confirmation === null || confirmation !== password) {
        return false;
      }

      const salt = crypto.getRandomValues(new Uint8Array(16));
      const hash = await hashPassword(password, salt);

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        salt: toBase64(salt),
        hash: toBase64(hash)
      }));

      return true;
    }

    // Returning visit: check the password.
    try {
      const record = JSON.parse(saved);
      const salt = fromBase64(record.salt);
      const expected = fromBase64(record.hash);
      const actual = new Uint8Array(await hashPassword(password, salt));

      if (actual.length !== expected.length) return false;

      let difference = 0;

      for (let i = 0; i < actual.length; i++) {
        difference |= actual[i] ^ expected[i];
      }

      return difference === 0;
    } catch {
      return false;
    }
  }

  return { verify };
})();
