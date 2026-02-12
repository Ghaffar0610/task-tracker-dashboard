const crypto = require("crypto");

const CODE_COUNT = 8;
const CODE_LENGTH = 8;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const normalizeRecoveryCode = (value = "") => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
};

const hashRecoveryCode = (code) => {
  return crypto.createHash("sha256").update(code).digest("hex");
};

const formatRecoveryCode = (raw) => {
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
};

const randomCode = () => {
  let value = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    const idx = crypto.randomInt(0, ALPHABET.length);
    value += ALPHABET[idx];
  }
  return value;
};

const generateRecoveryCodes = (count = CODE_COUNT) => {
  const plainCodes = [];
  const hashedCodes = [];

  for (let i = 0; i < count; i += 1) {
    const rawCode = randomCode();
    const normalized = normalizeRecoveryCode(rawCode);
    plainCodes.push(formatRecoveryCode(normalized));
    hashedCodes.push({
      codeHash: hashRecoveryCode(normalized),
      usedAt: null,
    });
  }

  return { plainCodes, hashedCodes };
};

const consumeRecoveryCode = (user, providedCode) => {
  const normalized = normalizeRecoveryCode(providedCode);
  if (!normalized) return false;

  const candidateHash = hashRecoveryCode(normalized);
  const nextCodes = (user.recoveryCodes || []).map((entry) => ({ ...entry }));
  const index = nextCodes.findIndex(
    (entry) => entry.codeHash === candidateHash && !entry.usedAt
  );

  if (index < 0) return false;

  nextCodes[index].usedAt = new Date();
  user.recoveryCodes = nextCodes;
  return true;
};

module.exports = {
  generateRecoveryCodes,
  consumeRecoveryCode,
  normalizeRecoveryCode,
};
