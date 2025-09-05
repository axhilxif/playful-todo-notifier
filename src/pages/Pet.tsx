import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/ui/page-header';
import { Heart, Utensils, Play, PawPrint, DollarSign, RefreshCcw } from 'lucide-react';
import { loadUserProfile, saveUserProfile, calculateUserStats } from '@/lib/gamification';
import { updatePetStats, feedPet, playWithPet, buyNewPet, changePetHead, PET_ITEMS, buyPetItem, renamePet } from '@/lib/pet';
import { generatePetSuggestion } from '@/lib/pet-ai-service';
import { useToast } from '@/hooks/use-toast';

export default function Pet() {
  const [profile, setProfile] = useState(loadUserProfile());
  const { toast } = useToast();
  const [newPetName, setNewPetName] = useState('');
  const [petSuggestion, setPetSuggestion] = useState('');

  useEffect(() => {
    const stats = calculateUserStats();
    setPetSuggestion(generatePetSuggestion(stats));

    const interval = setInterval(() => {
      updatePetStats(); // Update pet stats periodically
      const updatedProfile = loadUserProfile();
      setProfile(updatedProfile); // Reload profile to get updated pet stats
      setPetSuggestion(generatePetSuggestion(calculateUserStats())); // Update suggestion
    }, 5 * 60 * 1000); // Update every 5 minutes for more immediate feedback during development

    return () => clearInterval(interval);
  }, []);

  const handleFeed = () => {
    feedPet();
    setProfile(loadUserProfile());
    toast({
      title: "Pet Fed!",
      description: `${profile.pet.name} is less hungry.`,
    });
  };

  const handlePlay = () => {
    playWithPet();
    setProfile(loadUserProfile());
    toast({
      title: "Played with Pet!",
      description: `${profile.pet.name} is happier.`,
    });
  };

  const handleBuyNewPet = () => {
    if (buyNewPet()) {
      setProfile(loadUserProfile());
      toast({
        title: "New Pet Acquired!",
        description: "Welcome your new companion!",
      });
    } else {
      toast({
        title: "Cannot Buy Pet",
        description: "Not enough XP or you already have a pet.",
        variant: "destructive",
      });
    }
  };

  const handleChangeHead = (head: string) => {
    if (changePetHead(head)) {
      setProfile(loadUserProfile());
      toast({
        title: "Pet Head Changed!",
        description: `${profile.pet.name}'s look has been updated.`,
      });
    } else {
      toast({
        title: "Cannot Change Head",
        description: "Not enough XP.",
        variant: "destructive",
      });
    }
  };

  const handleBuyItem = (itemId: string) => {
    if (buyPetItem(itemId)) {
      setProfile(loadUserProfile());
      toast({
        title: "Item Purchased!",
        description: "Your pet will love it!",
      });
    } else {
      // Error toast handled within buyPetItem
    }
  };

  const handleRenamePet = () => {
    if (renamePet(newPetName.trim())) {
      setProfile(loadUserProfile());
      setNewPetName('');
    } else {
      // Error toast handled within renamePet
    }
  };

  const pet = profile.pet;

  return (
    <div className="pb-20 px-4 pt-6">
      <PageHeader
        title="My Pet"
        subtitle="Your loyal companion"
        icon={<PawPrint className="h-6 w-6" />}
      />

      <Card className="mt-6">
        <CardContent className="p-6 text-center">
          {!pet.isAlive ? (
            <div className="space-y-4">
              <p className="text-4xl">👻</p>
              <h3 className="text-xl font-bold text-destructive">Your pet is gone...</h3>
              <p className="text-muted-foreground">
                You need 10,000 XP to buy a new companion.
              </p>
              <Button onClick={handleBuyNewPet} disabled={profile.xp < 10000}>
                <DollarSign className="h-4 w-4 mr-2" /> Buy New Pet (10,000 XP)
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl mb-4">
                {pet.head === 'default' && '🐶'}
                {pet.head === 'cat' && '🐱'}
                {pet.head === 'rabbit' && '🐰'}
                {pet.head === 'fox' && '🦊'}
                {pet.head === 'lion' && '🦁'}
                {pet.head === 'panda' && '🐼'}
              </div>
              <h3 className="text-2xl font-bold">{pet.name}</h3>

              <div className="flex justify-center items-center gap-2 mt-2">
                <Input
                  type="text"
                  placeholder="New pet name"
                  value={newPetName}
                  onChange={(e) => setNewPetName(e.target.value)}
                  className="w-48"
                />
                <Button onClick={handleRenamePet} disabled={!newPetName.trim() || profile.xp < 200}>
                  Rename (200 XP)
                </Button>
              </div>

              <div className="text-lg font-semibold text-primary mt-4">
                Your XP: {profile.xp} XP
              </div>

              <p className="text-muted-foreground mt-4 italic">"{petSuggestion}"</p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="flex items-center justify-center gap-2 text-lg font-medium">
                    <Utensils className="h-5 w-5 text-orange-500" /> Hunger
                  </div>
                  <Progress value={pet.hunger} className="mt-2" indicatorClassName={pet.hunger > 70 ? "bg-red-500" : "bg-orange-500"} />
                  <span className="text-sm text-muted-foreground">{pet.hunger}%</span>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-lg font-medium">
                    <Heart className="h-5 w-5 text-pink-500" /> Happiness
                  </div>
                  <Progress value={pet.happiness} className="mt-2" indicatorClassName={pet.happiness < 30 ? "bg-red-500" : "bg-pink-500"} />
                  <span className="text-sm text-muted-foreground">{pet.happiness}%</span>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <Button onClick={handleFeed}>
                  <Utensils className="h-4 w-4 mr-2" /> Feed
                </Button>
                <Button onClick={handlePlay}>
                  <Play className="h-4 w-4 mr-2" /> Play
                </Button>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-3">Change Pet Head (500 XP each)</h4>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => handleChangeHead('default')} disabled={pet.head === 'default' || profile.xp < 500}>
                    🐶 Default
                  </Button>
                  <Button variant="outline" onClick={() => handleChangeHead('cat')} disabled={pet.head === 'cat' || profile.xp < 500}>
                    🐱 Cat
                  </Button>
                  <Button variant="outline" onClick={() => handleChangeHead('rabbit')} disabled={pet.head === 'rabbit' || profile.xp < 500}>
                    🐰 Rabbit
                  </Button>
                  <Button variant="outline" onClick={() => handleChangeHead('fox')} disabled={pet.head === 'fox' || profile.xp < 500}>
                    🦊 Fox
                  </Button>
                  <Button variant="outline" onClick={() => handleChangeHead('lion')} disabled={pet.head === 'lion' || profile.xp < 500}>
                    🦁 Lion
                  </Button>
                  <Button variant="outline" onClick={() => handleChangeHead('panda')} disabled={pet.head === 'panda' || profile.xp < 500}>
                    🐼 Panda
                  </Button>
                </div>
              </div>
            </div>
          )
        }
        </CardContent>
      </Card>

      {/* Pet Shop */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 p-4">
            <DollarSign className="h-5 w-5 text-green-500" /> Pet Shop
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PET_ITEMS.map((item) => (
              <Card key={item.id} className="p-4">
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold flex items-center">
                    {item.cost} XP
                  </span>
                  <Button
                    onClick={() => handleBuyItem(item.id)}
                    disabled={profile.xp < item.cost}
                  >
                    Buy
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}