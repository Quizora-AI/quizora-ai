
// Premium avatars from UI Faces (free for use)
const premiumAvatars = [
  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
  "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
  "https://images.unsplash.com/photo-1501286353178-1ec881214838"
];

export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * premiumAvatars.length);
  return premiumAvatars[randomIndex];
};
