
export interface Task {
  id: string;
  type: 'L' | 'S' | 'R' | 'W';
  title: string;
  description: string;
  xp: number;
  content: any; // Could be a path to audio, a text snippet, a question, etc.
}

export interface Level {
  level: number;
  name: string;
  tasks: Task[];
}

export const levels: Level[] = [
  // Levels 1-5: Beginner
  {
    level: 1,
    name: 'Rookie Ranger 1',
    tasks: [
      { id: '1-L', type: 'L', title: 'Listen to Greetings', description: 'Listen to "Hello" and "Goodbye"', xp: 10, content: { textToSpeak: 'Hello... Goodbye', question: 'Which word means "Hello"?', options: ['Shalom', 'Aloha', 'Hola'], answer: 'Hola' } },
      { id: '1-S', type: 'S', title: 'Say "Hello"', description: 'Record yourself saying "Hello"', xp: 15, content: { phrase: 'Hello' } },
      { id: '1-R', type: 'R', title: 'Read Basic Words', description: 'Read the words for "Yes" and "No"', xp: 10, content: { text: 'Yes / No', question: 'Which word means affirmation?', options: ['Yes', 'No'], answer: 'Yes' } },
      { id: '1-W', type: 'W', title: 'Write Your Name', description: 'Type your name', xp: 10, content: { prompt: 'Write your first name.' } },
    ],
  },
  {
    level: 2,
    name: 'Rookie Ranger 2',
    tasks: [
      { id: '2-L', type: 'L', title: 'Numbers 1-3', description: 'Listen to numbers 1, 2, 3', xp: 10, content: { textToSpeak: 'One... Two... Three', question: 'Which number was spoken last?', options: ['One', 'Two', 'Three'], answer: 'Three' } },
      { id: '2-S', type: 'S', title: 'Count to Three', description: 'Record yourself counting to three', xp: 15, content: { phrase: 'One, Two, Three' } },
      { id: '2-R', type: 'R', title: 'Identify Colors', description: 'Read the words "Red" and "Blue"', xp: 10, content: { text: 'Red / Blue', question: 'Which color is like the sky?', options: ['Red', 'Blue'], answer: 'Blue' } },
      { id: '2-W', type: 'W', title: 'Write "Yes" and "No"', description: 'Type the words for "Yes" and "No"', xp: 10, content: { prompt: 'Write "Yes" and "No".' } },
    ],
  },
  {
    level: 3,
    name: 'Rookie Ranger 3',
    tasks: [
        { id: '3-L', type: 'L', title: 'Common Phrases', description: 'Listen to "Thank You" and "Please"', xp: 15, content: { textToSpeak: 'Thank You... Please', question: 'Which phrase is used to show gratitude?', options: ['Please', 'Thank You'], answer: 'Thank You' } },
        { id: '3-S', type: 'S', title: 'Say "Thank You"', description: 'Practice saying "Thank You"', xp: 20, content: { phrase: 'Thank you' } },
        { id: '3-R', type: 'R', title: 'Read a Short Sentence', description: 'Read "The cat is black."', xp: 15, content: { text: 'The cat is black.', question: 'What color is the cat?', options: ['White', 'Black', 'Brown'], answer: 'Black' } },
        { id: '3-W', type: 'W', title: 'Introduce Yourself', description: 'Write "My name is..."', xp: 15, content: { prompt: 'Write the sentence "My name is [Your Name]".' } },
    ],
  },
  {
    level: 4,
    name: 'Grammar Guardian 1',
    tasks: [
        { id: '4-L', type: 'L', title: 'Identify Questions', description: 'Listen and identify the question', xp: 20, content: { textToSpeak: 'My name is John... What is your name?', question: 'Which sentence was a question?', options: ['My name is John.', 'What is your name?'], answer: 'What is your name?' } },
        { id: '4-S', type: 'S', title: 'Ask a Question', description: 'Ask "What is your name?"', xp: 25, content: { phrase: 'What is your name?' } },
        { id: '4-R', type: 'R', title: 'Simple Commands', description: 'Read "Sit down" and "Stand up"', xp: 20, content: { text: 'Sit down. Stand up.', question: 'Which command tells you to be seated?', options: ['Sit down', 'Stand up'], answer: 'Sit down' } },
        { id: '4-W', type: 'W', title: 'Form a Question', description: 'Write "How are you?"', xp: 20, content: { prompt: 'Write the question "How are you?".' } },
    ],
  },
    {
    level: 5,
    name: 'Grammar Guardian 2',
    tasks: [
        { id: '5-L', type: 'L', title: 'Food Vocabulary', description: 'Listen to "Apple" and "Banana"', xp: 20, content: { textToSpeak: 'Apple... Banana', question: 'Which fruit is yellow?', options: ['Apple', 'Banana'], answer: 'Banana' } },
        { id: '5-S', type: 'S', title: 'Say "I want an apple"', description: 'Practice a full sentence', xp: 25, content: { phrase: 'I want an apple' } },
        { id: '5-R', type: 'R', title: 'Read a Menu', description: 'Read a simple menu with two items', xp: 20, content: { text: 'Menu: Pizza, Salad.', question: 'Which item is a healthy option?', options: ['Pizza', 'Salad'], answer: 'Salad' } },
        { id: '5-W', type: 'W', title: 'Order Food', description: 'Write "I would like a pizza."', xp: 20, content: { prompt: 'Write "I would like a pizza, please.".' } },
    ],
  },
  // Levels 6-20 would be defined here...
  ...Array.from({ length: 15 }, (_, i) => ({
    level: i + 6,
    name: 'Level ' + (i + 6),
    tasks: [],
  })),
];
