export type CardType = 'visa' | 'mastercard' | 'unknown';

export const formatCardNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Format as 4-4-4-4
  const parts = [];
  if (digits.length > 0) {
    parts.push(digits.slice(0, 4));
  }
  if (digits.length > 4) {
    parts.push(digits.slice(4, 8));
  }
  if (digits.length > 8) {
    parts.push(digits.slice(8, 12));
  }
  if (digits.length > 12) {
    parts.push(digits.slice(12, 16));
  }
  
  return parts.join(' ');
};

export const detectCardType = (cardNumber: string): CardType => {
  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, '');
  
  // Visa cards start with 4
  if (digits.startsWith('4')) {
    return 'visa';
  }
  
  // Mastercard starts with 51-55 or 2221-2720
  const firstTwo = parseInt(digits.slice(0, 2));
  const firstFour = parseInt(digits.slice(0, 4));
  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) {
    return 'mastercard';
  }
  
  return 'unknown';
}; 