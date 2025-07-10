interface Quote {
  quote: string;
  author: string;
}

const quotes: Quote[] = [
  {
    quote: "The best way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    quote: "Don't let yesterday take up too much of today.",
    author: "Will Rogers",
  },
  {
    quote: "It's not whether you get knocked down, it's whether you get up.",
    author: "Vince Lombardi",
  },
  {
    quote:
      "If you are working on something exciting, it will keep you motivated.",
    author: "Steve Jobs",
  },
  {
    quote: "Success is not in what you have, but who you are.",
    author: "Bo Bennett",
  },
  {
    quote: "Hard work beats talent when talent doesn't work hard.",
    author: "Tim Notke",
  },
  {
    quote:
      "You don’t have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  {
    quote:
      "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
  },
  {
    quote: "Opportunities don't happen. You create them.",
    author: "Chris Grosser",
  },
  {
    quote: "Try not to become a man of success. Rather become a man of value.",
    author: "Albert Einstein",
  },
  {
    quote:
      "Great minds discuss ideas; average minds discuss events; small minds discuss people.",
    author: "Eleanor Roosevelt",
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    quote: "Whether you think you can or you think you can’t, you’re right.",
    author: "Henry Ford",
  },
  {
    quote: "Creativity is intelligence having fun.",
    author: "Albert Einstein",
  },
  {
    quote: "Do what you can with all you have, wherever you are.",
    author: "Theodore Roosevelt",
  },
  {
    quote: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
  },
  {
    quote: "Reading is to the mind, as exercise is to the body.",
    author: "Brian Tracy",
  },
  {
    quote:
      "The future belongs to the competent. Get good, get better, be the best!",
    author: "Brian Tracy",
  },
  {
    quote:
      "For every reason it’s not possible, there are hundreds of people who have faced the same circumstances and succeeded.",
    author: "Jack Canfield",
  },
  {
    quote:
      "Things work out best for those who make the best of how things work out.",
    author: "John Wooden",
  },
];

// Track the current index
let currentIndex = 0;

export function getQuoteSequentially(): Quote {
  const quote = quotes[currentIndex];
  currentIndex = (currentIndex + 1) % quotes.length; // Loop back to 0 after 19
  return quote;
}
