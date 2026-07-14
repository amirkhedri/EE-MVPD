export function isValidCard({ number, expiry, cvc, name }) {
  if (!name || !name.trim()) return "Cardholder name is required";

  const digits = String(number || "").replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits)) return "Enter a valid card number";
  if (!luhnCheck(digits)) return "Card number failed validation";

  if (!/^\d{2}\/\d{2}$/.test(String(expiry || ""))) return "Expiry must be in MM/YY format";
  const [mm, yy] = expiry.split("/").map(Number);
  if (mm < 1 || mm > 12) return "Enter a valid expiry month";
  const expDate = new Date(2000 + yy, mm - 1, 1);
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (expDate < currentMonth) return "Card has expired";

  if (!/^\d{3,4}$/.test(String(cvc || ""))) return "Enter a valid CVC";

  return null;
}

function luhnCheck(digits) {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}
