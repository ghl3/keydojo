// Content for numbers-only mode and sentences with naturally-occurring numbers

// Number sequences for numbers-only mode (PURE NUMBERS - no letters at all)
export const NUMBERS_ONLY_SEQUENCES: string[] = [
  // Phone numbers (pure numeric with punctuation)
  "(555) 123-4567",
  "1-800-555-0199",
  "(212) 867-5309",
  "+1 (415) 555-2671",
  "888-555-1234",
  "(303) 555-7890",
  "1-888-123-4567",
  "(917) 555-0123",

  // IP addresses
  "192.168.1.1",
  "10.0.0.255",
  "172.16.0.1",
  "255.255.255.0",
  "127.0.0.1",
  "192.168.0.100",
  "10.10.10.10",
  "8.8.8.8",

  // Dates in various formats
  "2024-03-15",
  "03/15/2024",
  "15-03-2024",
  "2024/12/25",
  "01-01-2025",
  "12/31/2023",
  "2025-07-04",
  "11/28/2024",

  // Times (24-hour format only - no AM/PM letters)
  "14:30:00",
  "09:15:45",
  "23:59:59",
  "15:45:00",
  "10:30:00",
  "12:00:00",
  "06:45:30",
  "18:20:15",
  "00:00:01",
  "21:30:00",

  // Prices ($ symbol only)
  "$19.99",
  "$127.50",
  "$1,299.00",
  "$45.00",
  "$9.99",
  "$250.00",
  "$5.50",
  "$1,000.00",
  "$99.95",
  "$2,499.99",

  // Math expressions
  "15 + 27 = 42",
  "100 - 37 = 63",
  "8 * 9 = 72",
  "144 / 12 = 12",
  "25 + 75 = 100",
  "50 * 2 = 100",
  "256 / 4 = 64",
  "33 + 67 = 100",
  "1000 - 250 = 750",
  "12 * 12 = 144",

  // Coordinates (pure numbers)
  "40.7128, -74.0060",
  "34.0522, -118.2437",
  "51.5074, -0.1278",
  "35.6762, 139.6503",
  "-33.8688, 151.2093",
  "48.8566, 2.3522",

  // Version-like numbers (no 'v' prefix)
  "2.1.4",
  "10.15.7",
  "3.0.0",
  "1.2.3",
  "14.0.1",
  "5.12.0",

  // Percentages
  "25%",
  "50%",
  "75%",
  "99.9%",
  "12.5%",
  "100%",
  "33.3%",
  "66.7%",

  // Pure numeric measurements (no unit letters)
  "5.5",
  "100.0",
  "32.5",
  "1.75",
  "250",
  "3.14159",
  "2.71828",
  "1.41421",

  // Reference numbers (pure numeric)
  "2024-0158",
  "78456",
  "123456",
  "9876543",
  "555-12-3456",
  "12-345-6789",

  // Scores and ratios
  "3:2",
  "7-4",
  "100/100",
  "4.5/5",
  "9/10",
  "21-17",
  "3:1",
  "5/5",

  // Number sequences
  "1 2 3 4 5",
  "10 20 30 40 50",
  "2 4 8 16 32",
  "1 1 2 3 5 8 13",
  "100 200 300 400",
];

// Sentences with dates and times
export const SENTENCES_WITH_DATES: string[] = [
  "The project deadline is March 15, 2024.",
  "She was born on July 4, 1990.",
  "The meeting is scheduled for December 12th.",
  "We launched the product on January 1, 2023.",
  "The contract expires on September 30, 2025.",
  "Independence Day falls on July 4th every year.",
  "The fiscal year ends on March 31st.",
  "Our anniversary is coming up on August 15th.",
  "The report is due by October 1, 2024.",
  "The conference runs from June 5-7, 2024.",
  "Her birthday is on November 22nd.",
  "The deadline was extended to April 30th.",
];

export const SENTENCES_WITH_TIMES: string[] = [
  "The meeting starts at 3:30 PM.",
  "I wake up at 6:45 every morning.",
  "The store closes at 9:00 PM sharp.",
  "Lunch break is from 12:00 to 1:00.",
  "The flight departs at 7:15 AM.",
  "Office hours are 9:00 AM to 5:00 PM.",
  "The movie begins at 8:30 tonight.",
  "Class starts promptly at 10:00 AM.",
  "The train arrives at 4:45 PM.",
  "We should meet at 2:30 in the lobby.",
  "The alarm is set for 5:30 AM.",
  "Happy hour starts at 5:00 PM.",
];

// Sentences with prices and currency
export const SENTENCES_WITH_PRICES: string[] = [
  "The new laptop costs $1,299 plus tax.",
  "Coffee is only $4.99 at the corner cafe.",
  "They raised $50,000 for the charity.",
  "The subscription is $9.99 per month.",
  "Rent increased by $250 this year.",
  "The total comes to $127.50 with shipping.",
  "Gas prices dropped to $3.45 per gallon.",
  "The concert tickets were $75 each.",
  "She saved $500 by buying in bulk.",
  "The budget for the project is $25,000.",
  "Dinner for two cost about $85.",
  "The car repair estimate was $1,200.",
];

// Sentences with quantities
export const SENTENCES_WITH_QUANTITIES: string[] = [
  "There were 15 volunteers at the event.",
  "The recipe calls for 3 cups of flour.",
  "She ran 5 kilometers every morning.",
  "We need to order 200 more units.",
  "The class has 28 students enrolled.",
  "I drank 8 glasses of water today.",
  "The team scored 7 goals in the match.",
  "There are 52 weeks in a year.",
  "He read 12 books last month.",
  "The package contains 24 items.",
  "We planted 50 trees in the park.",
  "The survey collected 2,500 responses.",
];

// Sentences with statistics and percentages
export const SENTENCES_WITH_STATISTICS: string[] = [
  "Sales increased by 25% this quarter.",
  "About 75% of participants agreed.",
  "The success rate improved to 94%.",
  "Customer satisfaction is at 87%.",
  "Only 1 in 4 applicants were selected.",
  "Revenue grew by 15% year over year.",
  "The error rate dropped to 0.5%.",
  "Approximately 60% voted in favor.",
  "Market share increased to 32%.",
  "The completion rate was 98%.",
  "About 80% of users prefer the new design.",
  "Productivity improved by 40%.",
];

// Sentences with measurements
export const SENTENCES_WITH_MEASUREMENTS: string[] = [
  "The building is 324 meters tall.",
  "The temperature reached 32 degrees today.",
  "The package weighs 2.5 kilograms.",
  "The hiking trail is 8.5 kilometers long.",
  "Water boils at 100 degrees Celsius.",
  "The room measures 15 by 20 feet.",
  "She is 1.75 meters tall.",
  "The speed limit is 65 miles per hour.",
  "The recipe needs 250 milliliters of milk.",
  "The marathon is 42.195 kilometers.",
  "Average rainfall is 50 centimeters annually.",
  "The cable is 3 meters long.",
];

// Get all sentences with natural numbers
export function getAllNumberSentences(): string[] {
  return [
    ...SENTENCES_WITH_DATES,
    ...SENTENCES_WITH_TIMES,
    ...SENTENCES_WITH_PRICES,
    ...SENTENCES_WITH_QUANTITIES,
    ...SENTENCES_WITH_STATISTICS,
    ...SENTENCES_WITH_MEASUREMENTS,
  ];
}

// Get number sequences for numbers-only mode
export function getNumberSequences(): string[] {
  return NUMBERS_ONLY_SEQUENCES;
}
