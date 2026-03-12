export type Letter = {
  id: string;
  title: string;
  message: string;
};

export const letters: Letter[] = [
  {
    id: 'sad',
    title: 'Open when you are sad',
    message:
      "I'm always here for you. Even on the heavy days, you are never carrying it alone. Take a breath, drink some water, and remember how deeply you are loved.",
  },
  {
    id: 'miss-me',
    title: 'Open when you miss me',
    message:
      "Close your eyes and picture us laughing together. Distance can stretch time, but it cannot shrink what I feel for you. I am with you in every little moment.",
  },
  {
    id: 'proud',
    title: 'Open when you need a reminder',
    message:
      'You are kind, strong, and brave in ways you do not always notice. I am proud of you, and I hope you are proud of yourself too.',
  },
];
