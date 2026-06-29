function pad(n: number): string { return String(n).padStart(5, "0") }
function rand(): number { return Math.floor(Math.random() * 99999) }

export const generateOrderRef = () => `ORD-${new Date().getFullYear()}-${pad(rand())}`
export const generateBookingRef = () => `VAC-BK-${new Date().getFullYear()}${pad(rand())}`
export const generateDonationRef = () => `VAC-DON-${new Date().getFullYear()}${pad(rand())}`
export const generateTalentRef = () => `VAC-${new Date().getFullYear()}-${pad(rand())}`
