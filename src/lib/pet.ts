import { loadUserProfile, saveUserProfile, UserProfile, awardXP, calculateUserStats } from './gamification';
import { notificationService } from './notification-service';

const HUNGER_INCREASE_RATE = 1; // Hunger increases by 1 every hour
const HAPPINESS_DECREASE_RATE = 2; // Happiness decreases by 2 every hour if hungry

export const updatePetStats = () => {
  const profile = loadUserProfile();
  const pet = profile.pet;

  if (!pet.isAlive) {
    return; // No need to update stats for a dead pet
  }

  const now = new Date();
  const lastFedDate = new Date(pet.lastFed);
  const lastPlayedDate = new Date(pet.lastPlayed);

  // Calculate hours since last update (assuming hourly updates for now)
  const hoursSinceLastFed = Math.floor((now.getTime() - lastFedDate.getTime()) / (1000 * 60 * 60));
  const hoursSinceLastPlayed = Math.floor((now.getTime() - lastPlayedDate.getTime()) / (1000 * 60 * 60));

  // Get user stats
  const userStats = calculateUserStats();
  const totalFocusTimeHours = userStats.totalFocusTime / 3600; // Convert to hours
  const completedTodosCount = userStats.completedTodos;

  // Determine pet's favorite subject based on user's most focused subject
  let mostFocusedSubject = 'General';
  let maxFocusTime = 0;
  for (const subject in userStats.subjectStats) {
    if (userStats.subjectStats[subject].totalTime > maxFocusTime) {
      maxFocusTime = userStats.subjectStats[subject].totalTime;
      mostFocusedSubject = subject;
    }
  }
  pet.favoriteSubject = mostFocusedSubject;

  // Hunger increases over time, but can be offset by activity
  // Base hunger increase
  pet.hunger = Math.min(100, pet.hunger + (hoursSinceLastFed * HUNGER_INCREASE_RATE));

  // Reduce hunger based on focus time and completed todos
  // 1 hour of focus time reduces hunger by 5
  // 1 completed todo reduces hunger by 1
  pet.hunger = Math.max(0, pet.hunger - (totalFocusTimeHours * 5) - (completedTodosCount * 1));

  // If user is studying pet's favorite subject, reduce hunger more
  if (userStats.subjectStats[pet.favoriteSubject] && userStats.subjectStats[pet.favoriteSubject].totalTime > 0) {
    pet.hunger = Math.max(0, pet.hunger - 5); // Additional hunger reduction
  }

  // Happiness decreases over time if hungry, but increases with activity
  // Base happiness decrease if hungry
  if (pet.hunger >= 50) {
    pet.happiness = Math.max(0, pet.happiness - (hoursSinceLastPlayed * HAPPINESS_DECREASE_RATE));
  }

  // Increase happiness based on focus time and completed todos
  // 1 hour of focus time increases happiness by 10
  // 1 completed todo increases happiness by 2
  pet.happiness = Math.min(100, pet.happiness + (totalFocusTimeHours * 10) + (completedTodosCount * 2));

  // If user is studying pet's favorite subject, increase happiness more
  if (userStats.subjectStats[pet.favoriteSubject] && userStats.subjectStats[pet.favoriteSubject].totalTime > 0) {
    pet.happiness = Math.min(100, pet.happiness + 10); // Additional happiness increase
  }


  // Check for pet death
  if (pet.hunger >= 90 && pet.happiness <= 10) { // Adjusted death condition
    pet.isAlive = false;
    notificationService.scheduleImmediateNotification('💔 Pet Lost!', `${pet.name} has run away due to neglect. You need 10,000 XP to get a new pet.`, 'pet_death');
  }

  // Update last fed/played times to now if stats were updated
  if (hoursSinceLastFed > 0) {
    pet.lastFed = now.toISOString();
  }
  if (hoursSinceLastPlayed > 0) {
    pet.lastPlayed = now.toISOString();
  }

  profile.pet = pet;
  saveUserProfile(profile);
};

export const feedPet = () => {
  const profile = loadUserProfile();
  const pet = profile.pet;

  if (!pet.isAlive) {
    notificationService.scheduleImmediateNotification('😔 No Pet', 'You don\'t have a pet to feed!', 'pet_no_pet');
    return;
  }

  const XP_COST_FEED = 50; // XP cost to feed the pet
  if (profile.xp < XP_COST_FEED) {
    notificationService.scheduleImmediateNotification('💰 Not Enough XP', `You need ${XP_COST_FEED - profile.xp} more XP to feed your pet.`, 'pet_xp_needed');
    return;
  }

  profile.xp -= XP_COST_FEED; // Deduct XP

  pet.hunger = Math.max(0, pet.hunger - 30); // Reduce hunger by 30
  pet.happiness = Math.min(100, pet.happiness + 10); // Increase happiness slightly
  pet.lastFed = new Date().toISOString(); // Update last fed time

  profile.pet = pet;
  saveUserProfile(profile);
  notificationService.scheduleImmediateNotification('🍖 Yum!', `${pet.name} is less hungry now. -${XP_COST_FEED} XP`, 'pet_fed');
};

export const playWithPet = () => {
  const profile = loadUserProfile();
  const pet = profile.pet;

  if (!pet.isAlive) {
    notificationService.scheduleImmediateNotification('😔 No Pet', 'You don\'t have a pet to play with!', 'pet_no_pet');
    return;
  }

  const XP_COST_PLAY = 30; // XP cost to play with the pet
  if (profile.xp < XP_COST_PLAY) {
    notificationService.scheduleImmediateNotification('💰 Not Enough XP', `You need ${XP_COST_PLAY - profile.xp} more XP to play with your pet.`, 'pet_xp_needed');
    return;
  }

  profile.xp -= XP_COST_PLAY; // Deduct XP

  pet.happiness = Math.min(100, pet.happiness + 20); // Increase happiness by 20
  pet.hunger = Math.min(100, pet.hunger + 5); // Playing makes pet a little hungry
  pet.lastPlayed = new Date().toISOString(); // Update last played time

  profile.pet = pet;
  saveUserProfile(profile);
  notificationService.scheduleImmediateNotification('🎾 Fun!', `${pet.name} is happier now! -${XP_COST_PLAY} XP`, 'pet_played');
};

export const buyNewPet = (): boolean => {
  const profile = loadUserProfile();
  if (profile.pet.isAlive) {
    notificationService.scheduleImmediateNotification('🤔 Already Have a Pet', 'You already have a pet. You can\'t buy another one!', 'pet_already_have');
    return false;
  }

  const COST_NEW_PET = 10000;
  if (profile.xp >= COST_NEW_PET) {
    profile.xp -= COST_NEW_PET;
    profile.pet = {
      name: 'Buddy', // Default name for new pet
      hunger: 50,
      happiness: 50,
      isAlive: true,
      head: 'default',
      lastFed: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
    };
    saveUserProfile(profile);
    notificationService.scheduleImmediateNotification('🎉 New Pet!', 'You\'ve adopted a new pet! Welcome Buddy!', 'pet_new');
    return true;
  } else {
    notificationService.scheduleImmediateNotification('💰 Not Enough XP', `You need ${COST_NEW_PET - profile.xp} more XP to buy a new pet.`, 'pet_xp_needed');
    return false;
  }
};

export const changePetHead = (newHead: string): boolean => {
  const profile = loadUserProfile();
  const pet = profile.pet;

  if (!pet.isAlive) {
    notificationService.scheduleImmediateNotification('😔 No Pet', 'You don\'t have a pet to customize!', 'pet_no_pet');
    return false;
  }

  const COST_CHANGE_HEAD = 500; // Example XP cost
  if (profile.xp >= COST_CHANGE_HEAD) {
    profile.xp -= COST_CHANGE_HEAD;
    pet.head = newHead;
    saveUserProfile(profile);
    notificationService.scheduleImmediateNotification('✨ Pet Makeover!', `${pet.name}'s head has been changed!`, 'pet_head_changed');
    return true;
  } else {
    notificationService.scheduleImmediateNotification('💰 Not Enough XP', `You need ${COST_CHANGE_HEAD - profile.xp} more XP to change your pet's head.`, 'pet_xp_needed_head');
    return false;
  }
};

export interface PetItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: (profile: UserProfile) => UserProfile; // Function to apply item effect
}

export const PET_ITEMS: PetItem[] = [
  {
    id: 'food_bowl',
    name: 'Food Bowl',
    description: 'Reduces hunger by 20%',
    cost: 100,
    effect: (profile: UserProfile) => {
      profile.pet.hunger = Math.max(0, profile.pet.hunger - 20);
      return profile;
    },
  },
  {
    id: 'toy_ball',
    name: 'Toy Ball',
    description: 'Increases happiness by 15%',
    cost: 75,
    effect: (profile: UserProfile) => {
      profile.pet.happiness = Math.min(100, profile.pet.happiness + 15);
      return profile;
    },
  },
  {
    id: 'xp_boost',
    name: 'XP Boost',
    description: 'Gives 50 XP',
    cost: 150,
    effect: (profile: UserProfile) => {
      profile.xp += 50;
      return profile;
    },
  },
  {
    id: 'energy_drink',
    name: 'Energy Drink',
    description: 'Temporarily boosts pet activity (reduces hunger and increases happiness more for a short period)',
    cost: 200,
    effect: (profile: UserProfile) => {
      profile.pet.hunger = Math.max(0, profile.pet.hunger - 30);
      profile.pet.happiness = Math.min(100, profile.pet.happiness + 25);
      // In a real app, you'd set a timer for the boost effect
      return profile;
    },
  },
  {
    id: 'comfort_bed',
    name: 'Comfort Bed',
    description: 'Slows down hunger increase by 10%',
    cost: 300,
    effect: (profile: UserProfile) => {
      // This would require a more complex hunger calculation that considers owned items
      // For now, we'll just give a one-time boost
      profile.pet.happiness = Math.min(100, profile.pet.happiness + 20);
      return profile;
    },
  },
];

export const buyPetItem = (itemId: string): boolean => {
  const profile = loadUserProfile();
  const item = PET_ITEMS.find((i) => i.id === itemId);

  if (!item) {
    notificationService.scheduleImmediateNotification('🛒 Shop', 'Item not found.', 'pet_shop');
    return false;
  }

  if (profile.xp < item.cost) {
    notificationService.scheduleImmediateNotification('💰 Not Enough XP', `You need ${item.cost - profile.xp} more XP to buy ${item.name}.`, 'pet_xp_needed');
    return false;
  }

  profile.xp -= item.cost;
  const updatedProfile = item.effect(profile);
  saveUserProfile(updatedProfile);
  notificationService.scheduleImmediateNotification('🛒 Shop', `You bought ${item.name}!`, 'pet_shop');
  return true;
};

export const renamePet = (newName: string): boolean => {
  const profile = loadUserProfile();
  const pet = profile.pet;

  if (!pet.isAlive) {
    notificationService.scheduleImmediateNotification('😔 No Pet', 'You don\'t have a pet to rename!', 'pet_no_pet');
    return false;
  }

  const XP_COST_RENAME = 200; // XP cost to rename the pet
  if (profile.xp < XP_COST_RENAME) {
    notificationService.scheduleImmediateNotification('💰 Not Enough XP', `You need ${XP_COST_RENAME - profile.xp} more XP to rename your pet.`, 'pet_xp_needed');
    return false;
  }

  profile.xp -= XP_COST_RENAME;
  pet.name = newName;
  saveUserProfile(profile);
  notificationService.scheduleImmediateNotification('📝 Renamed!', `Your pet is now named ${newName}! -${XP_COST_RENAME} XP`, 'pet_renamed');
  return true;
};
