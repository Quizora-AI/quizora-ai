
// Doodle-style avatars (emoji-like characters)
const premiumAvatars = [
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Luna",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Charlie",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Milo",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Lucy",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Max",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Bella"
];

export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * premiumAvatars.length);
  return premiumAvatars[randomIndex];
};

