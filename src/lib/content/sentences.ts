/**
 * Sentences for KeyDojo Typing Practice
 *
 * All sentences are original creations for this project.
 * Organized by length and complexity for progressive difficulty.
 */

import { getAllExpandedSentences } from "./content/expandedSentences";

// =============================================================================
// SIMPLE SENTENCES
// Short sentences (5-10 words) - good for beginners and warm-up
// =============================================================================

export const SIMPLE_SENTENCES = [
  // Daily activities
  "The cat sat on the mat.",
  "She walked to the store.",
  "He made a cup of tea.",
  "They played in the park.",
  "I read a good book today.",
  "The dog ran very fast.",
  "We ate lunch at noon.",
  "She smiled at her friend.",
  "The bird flew over the tree.",
  "He opened the window slowly.",

  // Weather and nature
  "The sun is shining brightly.",
  "Rain began to fall softly.",
  "Snow covered the ground completely.",
  "The wind blew through the trees.",
  "Clouds floated across the sky.",
  "The moon rose over the hills.",
  "Stars twinkled in the night.",
  "Flowers bloomed in the garden.",
  "The river flowed to the sea.",
  "Leaves fell from the branches.",

  // Simple observations
  "This is a beautiful day.",
  "That was a great meal.",
  "Time goes by so quickly.",
  "Music makes me feel happy.",
  "Books open up new worlds.",
  "Friends make life better.",
  "Sleep helps you feel rested.",
  "Exercise keeps you healthy.",
  "Water is good for you.",
  "Laughter is the best medicine.",

  // Actions
  "Please close the door quietly.",
  "Turn off the lights please.",
  "Write your name at the top.",
  "Read the instructions carefully.",
  "Listen to the teacher speak.",
  "Watch where you are going.",
  "Think before you answer.",
  "Wait for the signal.",
  "Follow the path ahead.",
  "Check your work twice.",
];

// =============================================================================
// MEDIUM SENTENCES
// Standard length sentences (10-20 words) - intermediate practice
// =============================================================================

export const MEDIUM_SENTENCES = [
  // Everyday situations
  "The morning sun cast long shadows across the quiet neighborhood streets.",
  "She picked up her phone and noticed several new messages waiting.",
  "He decided to take the longer route home to enjoy the scenery.",
  "They gathered around the table for their weekly family dinner together.",
  "I found an interesting article about space exploration online today.",
  "The children played happily in the backyard until it got dark.",
  "We planned our vacation carefully to make the most of our time.",
  "She finished her project just before the deadline and felt relieved.",
  "The train arrived at the station exactly on time this morning.",
  "He learned to play the guitar by watching online tutorials.",

  // Observations and reflections
  "Technology has changed the way we communicate with each other dramatically.",
  "Learning something new every day keeps the mind sharp and active.",
  "A good night of sleep can make all the difference tomorrow.",
  "The library was quiet except for the soft rustle of pages.",
  "Working from home has become more common in recent years.",
  "The city skyline looked beautiful against the orange sunset backdrop.",
  "She remembered the advice her grandmother had given her years ago.",
  "The old photographs brought back many wonderful childhood memories.",
  "Music has the power to change your mood in an instant.",
  "Reading before bed helps many people relax and fall asleep.",

  // Work and productivity
  "The meeting was scheduled for two o'clock in the conference room.",
  "She organized her desk before starting work each morning.",
  "The team worked together to solve the complex problem.",
  "He reviewed the document carefully before sending it to the client.",
  "They brainstormed ideas for the new marketing campaign.",
  "The presentation went well despite some initial technical difficulties.",
  "She set specific goals to track her progress throughout the year.",
  "The deadline was approaching fast and everyone felt the pressure.",
  "He delegated tasks to make sure everything was done on time.",
  "The company announced plans to expand into new markets next year.",

  // Learning and growth
  "Practice makes progress, not perfection, and that is okay.",
  "Mistakes are opportunities to learn and improve your skills.",
  "Consistency is more important than intensity when building new habits.",
  "She took notes during the lecture to help remember the key points.",
  "Reading widely exposes you to different perspectives and ideas.",
  "The best way to learn is to teach what you know to others.",
  "He started small and gradually increased the difficulty over time.",
  "Setting clear intentions helps you stay focused on your goals.",
  "Feedback from others can help you see your blind spots.",
  "Growth often happens outside of your comfort zone.",

  // Nature and environment
  "The autumn leaves created a colorful carpet on the forest floor.",
  "The ocean waves crashed against the rocky shore rhythmically.",
  "Birds sang their morning songs as the sun began to rise.",
  "The mountain peak was visible through the clearing in the clouds.",
  "Fresh snow covered everything in a blanket of sparkling white.",
  "The garden flourished under her careful attention and regular watering.",
  "A gentle breeze carried the scent of flowers through the window.",
  "The sunset painted the clouds in shades of pink and gold.",
  "Wildlife thrives in areas protected from human development.",
  "The river wound its way through the valley below.",

  // Technology and modern life
  "Smartphones have become an essential part of daily life for many people.",
  "The internet makes it easy to access information from anywhere.",
  "Social media connects people across vast distances instantly.",
  "Electric vehicles are becoming more popular each year.",
  "Streaming services have changed how we consume entertainment.",
  "Cloud storage allows you to access your files from any device.",
  "Video calls make remote collaboration feel more personal.",
  "Automation is transforming many industries and creating new opportunities.",
  "Digital tools can help improve productivity and organization.",
  "Online learning platforms offer courses on almost any subject imaginable.",
];

// =============================================================================
// COMPLEX SENTENCES
// Longer sentences (20+ words) with varied punctuation - advanced practice
// =============================================================================

export const COMPLEX_SENTENCES = [
  // Narrative style
  "After spending several hours in the library, she finally found the book she had been searching for all week.",
  "The old house at the end of the street had been abandoned for years, but recently someone had started renovating it.",
  "Despite the heavy rain that had been falling all morning, they decided to continue with their outdoor plans anyway.",
  "He realized, after much deliberation, that the decision he was about to make would change his life forever.",
  "The conference, which brought together experts from around the world, focused on sustainable development and environmental protection.",

  // Descriptive style
  "The ancient castle, perched high on the cliff overlooking the turbulent sea, had witnessed centuries of history unfold below its weathered walls.",
  "Walking through the bustling market, she was overwhelmed by the vibrant colors, exotic smells, and cacophony of sounds that surrounded her.",
  "The museum's newest exhibit featured remarkable artifacts from civilizations that had flourished thousands of years before our time.",
  "In the quiet moments before dawn, when the world still slept, he would sit by the window and watch the stars fade away.",
  "The garden, which her grandmother had lovingly tended for over fifty years, was now a sanctuary for birds, butterflies, and bees.",

  // Explanatory style
  "Understanding complex systems requires breaking them down into smaller components and analyzing how each part contributes to the whole.",
  "The research team discovered that the phenomenon they had been studying was far more intricate than anyone had previously suspected.",
  "Effective communication involves not only speaking clearly but also listening carefully and responding thoughtfully to what others say.",
  "The process of learning a new skill typically follows a predictable pattern: initial enthusiasm, followed by frustration, and eventually mastery.",
  "Scientists have long been fascinated by the question of how life began on Earth and whether it exists elsewhere in the universe.",

  // Philosophical style
  "The pursuit of happiness, according to many philosophers, is not about accumulating possessions but about finding meaning and purpose in life.",
  "History teaches us that societies that fail to learn from their mistakes are often destined to repeat them in different forms.",
  "The relationship between freedom and responsibility is complex: with greater freedom comes greater obligation to use it wisely.",
  "Time is perhaps our most valuable resource, yet we often spend it carelessly without considering how limited and precious it truly is.",
  "The beauty of art lies not in technical perfection but in its ability to evoke emotions and provoke thought in those who experience it.",

  // Professional style
  "The quarterly report indicated that the company had exceeded expectations in all key performance indicators, resulting in significant shareholder value.",
  "After reviewing the data from multiple sources, the analyst concluded that market conditions would likely remain favorable through the end of the fiscal year.",
  "The project management methodology employed by the team emphasized iterative development, continuous feedback, and adaptive planning throughout the entire process.",
  "Successful organizations recognize that investing in employee development leads to improved retention, increased productivity, and better overall business outcomes.",
  "The strategic partnership between the two companies was designed to leverage their respective strengths and create synergies in product development and marketing.",

  // Technical style
  "The algorithm processes each input sequentially, comparing it against the stored values and updating the output based on predefined rules and conditions.",
  "Modern programming languages provide abstractions that allow developers to focus on solving problems rather than managing low-level system resources.",
  "The database architecture was designed to handle millions of concurrent users while maintaining acceptable response times and data integrity.",
  "Cloud computing enables organizations to scale their infrastructure dynamically, paying only for the resources they actually use.",
  "Cybersecurity best practices include regular software updates, strong password policies, multi-factor authentication, and comprehensive employee training programs.",

  // Conversational style
  "When you think about it, the things that matter most in life are often the simplest: good health, meaningful relationships, and a sense of purpose.",
  "I've always believed that the best way to predict the future is to create it, rather than waiting passively for things to happen.",
  "Looking back on my career, I realize that the failures taught me more valuable lessons than the successes ever did.",
  "The thing about change is that it's inevitable; the only question is whether we adapt to it gracefully or resist it futilely.",
  "Sometimes the best advice is the hardest to follow, which is probably why we often need to learn the same lessons multiple times.",

  // Inspirational style
  "Every great achievement in human history began with someone believing that something impossible could be made possible through dedication and perseverance.",
  "The journey of a thousand miles begins with a single step, but it is the commitment to continue stepping that makes the destination reachable.",
  "In the face of adversity, true character is revealed: some people crumble under pressure while others rise to meet the challenge.",
  "The measure of success is not how high you climb but how many others you help along the way.",
  "Life is not about waiting for the storm to pass but learning to dance in the rain and finding joy despite the challenges.",
];

// =============================================================================
// PANGRAM SENTENCES
// Sentences containing all letters of the alphabet - comprehensive practice
// =============================================================================

export const PANGRAM_SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump!",
  "The five boxing wizards jump quickly.",
  "Jackdaws love my big sphinx of quartz.",
  "Sympathizing would fix Quaker objectives.",
  "A wizard's job is to vex chumps quickly in fog.",
  "Watch Jeopardy, Alex Trebek's fun TV quiz game.",
  "By Jove, my quick study of lexicography won a prize!",
  "Crazy Frederick bought many very exquisite opal jewels.",
];

// =============================================================================
// PUNCTUATION-FOCUSED SENTENCES
// Sentences with varied punctuation for special character practice
// =============================================================================

export const PUNCTUATION_SENTENCES = [
  // Questions
  "What time does the meeting start tomorrow?",
  "Have you finished reading that book yet?",
  "Where did you put the car keys?",
  "Why didn't anyone tell me about the change in plans?",
  "How long have you been working on this project?",

  // Exclamations
  "What a wonderful surprise this is!",
  "I can't believe we actually won!",
  "Stop right there!",
  "This is absolutely incredible!",
  "Watch out for that car!",

  // Quotes and dialogue
  "She said, \"I'll be there in five minutes.\"",
  "\"That's not what I meant,\" he replied quietly.",
  "The sign read: \"No parking beyond this point.\"",
  "'Why bother?' she asked with a shrug.",
  "He whispered, \"Follow me, and stay quiet.\"",

  // Lists and colons
  "We need three things: patience, persistence, and practice.",
  "The recipe calls for: flour, sugar, eggs, and butter.",
  "Remember the golden rule: treat others as you want to be treated.",
  "Here's the plan: we meet at noon, grab lunch, then head to the park.",
  "The options are: red, blue, green, or yellow.",

  // Semicolons and complex punctuation
  "The weather was terrible; however, we continued our journey.",
  "She loved coffee; he preferred tea.",
  "First, read the instructions; then, begin the assembly.",
  "Some people learn by reading; others learn by doing.",
  "The project had three phases: planning, execution, and review; each equally important.",

  // Parentheses and dashes
  "The meeting (originally scheduled for Monday) was moved to Thursday.",
  "Her brother - the one who lives in Boston - is visiting next week.",
  "The results (see Figure 3) clearly support our hypothesis.",
  "That restaurant - if you can call it that - was a disaster.",
  "The book (published in 1984) is still relevant today.",

  // Apostrophes and contractions
  "I can't figure out what's wrong with this code.",
  "They're going to their house over there.",
  "It's been a while since its last update.",
  "We'll need everyone's input before we're done.",
  "Don't forget to check you've saved your work.",

  // Numbers and special characters
  "The total comes to $127.50 (including tax).",
  "The temperature dropped to -15°C overnight.",
  "Her score improved by 25% compared to last year.",
  "The file size is approximately 2.5GB.",
  "Contact us at support@example.com for assistance.",
];

// =============================================================================
// PROVERBS AND SAYINGS
// Well-known expressions for familiar text practice
// =============================================================================

export const PROVERBS = [
  "A journey of a thousand miles begins with a single step.",
  "Actions speak louder than words.",
  "All that glitters is not gold.",
  "Better late than never.",
  "Every cloud has a silver lining.",
  "Practice makes perfect.",
  "Time flies when you're having fun.",
  "Knowledge is power.",
  "The early bird catches the worm.",
  "Where there's a will, there's a way.",
  "Two wrongs don't make a right.",
  "The pen is mightier than the sword.",
  "When in Rome, do as the Romans do.",
  "Fortune favors the bold.",
  "Necessity is the mother of invention.",
  "A picture is worth a thousand words.",
  "Rome wasn't built in a day.",
  "Look before you leap.",
  "Hope for the best, prepare for the worst.",
  "The squeaky wheel gets the grease.",
];

// =============================================================================
// SENTENCES WITH NUMBERS
// Sentences containing dates, times, prices, quantities, statistics, measurements
// =============================================================================

// Sentences with dates and times
export const SENTENCES_WITH_DATES = [
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

export const SENTENCES_WITH_TIMES = [
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
export const SENTENCES_WITH_PRICES = [
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
export const SENTENCES_WITH_QUANTITIES = [
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
export const SENTENCES_WITH_STATISTICS = [
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
export const SENTENCES_WITH_MEASUREMENTS = [
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

// =============================================================================
// RICH PUNCTUATION SENTENCES
// Sentences with varied punctuation for special character practice
// =============================================================================

export const RICH_PUNCTUATION_SENTENCES = [
  // Questions and exclamations
  "Wait... what?! I can't believe it!",
  "Really? Are you absolutely sure about that?",
  "No way! That's incredible - truly amazing!",
  "What?! How did that happen?",
  "Is this real? I mean... seriously?!",

  // Quoted speech
  "She asked, \"Did you really say 'never'?\"",
  "He replied, \"Of course! Why wouldn't I?\"",
  "\"Well,\" she said, \"that's interesting.\"",
  "\"Stop!\" he shouted. \"Don't move!\"",
  "She whispered, \"It's a secret... don't tell anyone.\"",

  // Lists and semicolons
  "We need eggs, milk, bread; also cheese, butter, and yogurt.",
  "The colors were: red, blue, green; purple, orange, and yellow.",
  "First, gather materials; second, read instructions; third, begin.",
  "Pack the following: shirts, pants, socks; a jacket; and shoes.",

  // Parenthetical information
  "The meeting (originally at 3:00) was moved to 4:30.",
  "His car (a red convertible) was parked outside.",
  "The book - her favorite one - was on the shelf.",
  "The recipe (see page 42) calls for three cups.",
  "My friend (you met her last week) called today.",

  // Technical and email-like
  "Contact us at: support@example.com or sales@company.org.",
  "Visit https://www.example.com/page for more details.",
  "Press Ctrl+Alt+Delete to continue; then select 'Restart'.",
  "The file is located at: /home/user/documents/file.txt.",
  "Run the command: npm install --save-dev @types/node.",

  // Complex punctuation combinations
  "Yes! No? Maybe... I just don't know anymore.",
  "Think about it: why? how? when? where? who?",
  "The answer - believe it or not - is quite simple.",
  "\"Perfect!\" she exclaimed; \"Just what I needed!\"",
  "Warning: do NOT (under any circumstances) press that button!",

  // Dashes and hyphens
  "The well-known author - famous for her mystery novels - arrived.",
  "It's a once-in-a-lifetime opportunity; don't miss it!",
  "The old-fashioned recipe - handed down for generations - was perfect.",
  "Self-improvement requires self-discipline and self-awareness.",
  "The up-to-date information is available twenty-four/seven.",

  // Colons and semicolons
  "Remember this: practice makes perfect; perfection takes time.",
  "The rules are simple: be kind; be honest; be helpful.",
  "Consider the options: stay or go; act or wait; speak or listen.",
  "Here's the truth: life is short; make it count.",

  // Apostrophes and contractions
  "It's not that I can't; it's that I won't - there's a difference!",
  "They're going to their house over there; they've done it before.",
  "She's already said she'll be there; she's never been late.",
  "We've got what you're looking for; it's right here!",

  // Mixed complex sentences
  "The report (dated 12/15/2024) showed: sales up 25%; costs down 10%.",
  "\"Wait!\" he called - but she'd already left; the door slammed shut.",
  "Options include: A) red, B) blue, or C) green - choose wisely!",
  "Question: What's 2 + 2? Answer: 4! (That was easy.)",
];

// Sentences emphasizing specific punctuation marks
export const SENTENCES_WITH_COLONS = [
  "Here's what you need: patience, practice, and persistence.",
  "The answer is clear: hard work pays off.",
  "Note: all entries must be submitted by Friday.",
  "Warning: contents may be hot; handle with care.",
  "The time has come: we must make a decision.",
  "Remember: success requires dedication.",
  "The forecast shows: sunny skies ahead.",
  "The verdict: guilty on all counts.",
];

export const SENTENCES_WITH_SEMICOLONS = [
  "The sun was setting; the sky turned orange and pink.",
  "She studied hard; consequently, she passed the exam.",
  "He arrived early; she came late; they met in the middle.",
  "The road was long; however, they kept going.",
  "Practice is important; without it, you won't improve.",
  "The storm passed; calm returned to the village.",
  "Life is short; make every moment count.",
  "Some prefer tea; others prefer coffee.",
];

export const SENTENCES_WITH_DASHES = [
  "The solution - if you can call it that - was temporary.",
  "Her idea - brilliant as it was - faced opposition.",
  "The old building - once a school - now stands empty.",
  "This opportunity - rare and precious - won't come again.",
  "The secret - known only to a few - was finally revealed.",
  "His plan - daring but risky - actually worked.",
  "The answer - surprisingly simple - was right in front of us.",
  "Their journey - long and difficult - finally ended.",
];

export const SENTENCES_WITH_QUOTES = [
  "\"I'll be back,\" he promised as he walked out the door.",
  "She said \"yes\" without any hesitation whatsoever.",
  "\"Why?\" he asked. \"Why did you do it?\"",
  "The sign read \"No Entry\" in bold red letters.",
  "\"Perfect,\" she whispered. \"Absolutely perfect.\"",
  "He always said \"never give up\" no matter what.",
  "\"Help!\" she called out. \"Is anyone there?\"",
  "The word \"impossible\" doesn't exist in her vocabulary.",
];

export const SENTENCES_WITH_PARENTHESES = [
  "The book (first edition) is worth a fortune today.",
  "Their house (built in 1920) needs major repairs.",
  "The answer (as I explained earlier) is quite simple.",
  "My brother (the younger one) lives in Boston.",
  "The meeting (see attached agenda) starts at nine.",
  "This recipe (my grandmother's) never fails.",
  "The test (multiple choice) took two hours.",
  "Her car (a blue sedan) was parked outside.",
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Get all sentences combined
export function getAllSentences(): string[] {
  return [
    ...SIMPLE_SENTENCES,
    ...MEDIUM_SENTENCES,
    ...COMPLEX_SENTENCES,
    ...PANGRAM_SENTENCES,
    ...PUNCTUATION_SENTENCES,
    ...PROVERBS,
    ...SENTENCES_WITH_DATES,
    ...SENTENCES_WITH_TIMES,
    ...SENTENCES_WITH_PRICES,
    ...SENTENCES_WITH_QUANTITIES,
    ...SENTENCES_WITH_STATISTICS,
    ...SENTENCES_WITH_MEASUREMENTS,
    ...RICH_PUNCTUATION_SENTENCES,
    ...SENTENCES_WITH_COLONS,
    ...SENTENCES_WITH_SEMICOLONS,
    ...SENTENCES_WITH_DASHES,
    ...SENTENCES_WITH_QUOTES,
    ...SENTENCES_WITH_PARENTHESES,
    ...getAllExpandedSentences(),
  ];
}

// Get sentences by difficulty
export function getSentencesByDifficulty(level: "easy" | "medium" | "hard"): string[] {
  switch (level) {
    case "easy":
      return [...SIMPLE_SENTENCES, ...PROVERBS];
    case "medium":
      return [...MEDIUM_SENTENCES, ...PANGRAM_SENTENCES];
    case "hard":
      return [...COMPLEX_SENTENCES, ...PUNCTUATION_SENTENCES];
  }
}

// Get sentences with specific punctuation
export function getSentencesWithPunctuation(): string[] {
  return PUNCTUATION_SENTENCES;
}
