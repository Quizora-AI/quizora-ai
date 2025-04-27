
export function getRandomAvatar(): string {
  const avatars = [
    "https://api.dicebear.com/6.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/6.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/6.x/adventurer/svg?seed=Jasper",
    "https://api.dicebear.com/6.x/adventurer/svg?seed=Lily",
    "https://api.dicebear.com/6.x/adventurer/svg?seed=Nova",
    "https://api.dicebear.com/6.x/adventurer/svg?seed=Zoe",
  ];
  
  return avatars[Math.floor(Math.random() * avatars.length)];
}
