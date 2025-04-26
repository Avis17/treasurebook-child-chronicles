
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, serverTimestamp, increment, Timestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

// Badge types
export interface Badge {
  id: string;
  name: string;
  category: 'Quiz' | 'Journal' | 'Goals' | 'Sports' | 'ExtraCurricular';
  level: 'Bronze' | 'Silver' | 'Gold';
  unlockedAt?: Timestamp;
  progress?: number;
  required?: number;
  status: 'Locked' | 'Unlocked';
  icon?: string;
  description?: string;
}

// Badge thresholds for different categories
export const BADGE_THRESHOLDS = {
  Quiz: {
    Bronze: 5,
    Silver: 20,
    Gold: 50
  },
  Journal: {
    Bronze: 3,
    Silver: 10,
    Gold: 30
  },
  Goals: {
    Bronze: 5,
    Silver: 15,
    Gold: 30
  },
  Sports: {
    Bronze: 3,
    Silver: 10,
    Gold: 20
  },
  ExtraCurricular: {
    Bronze: 3,
    Silver: 10,
    Gold: 20
  }
};

// Initialize user badges if they don't exist
export const initializeUserBadges = async (userId: string) => {
  try {
    // Check if the user already has badges
    const userBadgesRef = collection(db, `badges/${userId}/badgeList`);
    const badgeSnapshot = await getDocs(userBadgesRef);
    
    if (badgeSnapshot.empty) {
      console.log("Initializing badges for user:", userId);
      const badgesToCreate: Badge[] = [];
      
      // Create badges for each category and level
      Object.keys(BADGE_THRESHOLDS).forEach((category) => {
        Object.keys(BADGE_THRESHOLDS[category as keyof typeof BADGE_THRESHOLDS]).forEach((level) => {
          const badgeId = `${category.toLowerCase()}_${level.toLowerCase()}`;
          const threshold = BADGE_THRESHOLDS[category as keyof typeof BADGE_THRESHOLDS][level as 'Bronze' | 'Silver' | 'Gold'];
          
          const badge: Badge = {
            id: badgeId,
            name: `${category} ${level}`,
            category: category as Badge['category'],
            level: level as Badge['level'],
            progress: 0,
            required: threshold,
            status: 'Locked',
            description: `Achieve ${threshold} ${category.toLowerCase() === 'goals' ? 'completed goals' : 
                                              category.toLowerCase() === 'extraCurricular' ? 'extracurricular activities' : 
                                              `${category.toLowerCase()}s`}`
          };
          
          badgesToCreate.push(badge);
        });
      });
      
      // Batch create all badges
      const promises = badgesToCreate.map(badge => 
        setDoc(doc(db, `badges/${userId}/badgeList`, badge.id), badge)
      );
      
      await Promise.all(promises);
      console.log(`Created ${badgesToCreate.length} badges for user ${userId}`);
      
      // Also initialize progress counters in the user profile document
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        await updateDoc(profileRef, {
          quizAttemptsCount: 0,
          journalEntriesCount: 0,
          goalsCompletedCount: 0,
          sportsParticipationsCount: 0,
          extraCurricularParticipationsCount: 0
        });
      } else {
        // Create profile document if it doesn't exist
        await setDoc(profileRef, {
          quizAttemptsCount: 0,
          journalEntriesCount: 0,
          goalsCompletedCount: 0,
          sportsParticipationsCount: 0,
          extraCurricularParticipationsCount: 0,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error("Error initializing badges:", error);
  }
};

// Fetch all badges for a user
export const fetchUserBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const userBadgesRef = collection(db, `badges/${userId}/badgeList`);
    const q = query(userBadgesRef, orderBy("category"), orderBy("level"));
    const badgeSnapshot = await getDocs(q);
    
    if (badgeSnapshot.empty) {
      await initializeUserBadges(userId);
      return fetchUserBadges(userId); // Recursive call after initialization
    }
    
    return badgeSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Badge[];
  } catch (error) {
    console.error("Error fetching badges:", error);
    return [];
  }
};

// Get user progress counts
export const getUserProgressCounts = async (userId: string) => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      return {
        quizAttemptsCount: 0,
        journalEntriesCount: 0,
        goalsCompletedCount: 0,
        sportsParticipationsCount: 0,
        extraCurricularParticipationsCount: 0
      };
    }
    
    const data = profileSnap.data();
    return {
      quizAttemptsCount: data.quizAttemptsCount || 0,
      journalEntriesCount: data.journalEntriesCount || 0,
      goalsCompletedCount: data.goalsCompletedCount || 0,
      sportsParticipationsCount: data.sportsParticipationsCount || 0,
      extraCurricularParticipationsCount: data.extraCurricularParticipationsCount || 0
    };
  } catch (error) {
    console.error("Error fetching user progress counts:", error);
    return {
      quizAttemptsCount: 0,
      journalEntriesCount: 0,
      goalsCompletedCount: 0,
      sportsParticipationsCount: 0,
      extraCurricularParticipationsCount: 0
    };
  }
};

// Increment a specific progress counter
export const incrementProgressCounter = async (userId: string, counterType: keyof typeof BADGE_THRESHOLDS) => {
  try {
    if (!userId) return null;

    const counterMap: Record<string, string> = {
      'Quiz': 'quizAttemptsCount',
      'Journal': 'journalEntriesCount',
      'Goals': 'goalsCompletedCount',
      'Sports': 'sportsParticipationsCount',
      'ExtraCurricular': 'extraCurricularParticipationsCount'
    };
    
    const fieldToUpdate = counterMap[counterType];
    if (!fieldToUpdate) return null;
    
    const profileRef = doc(db, 'profiles', userId);
    
    // Update counter
    const updateObj: Record<string, any> = {};
    updateObj[fieldToUpdate] = increment(1);
    await updateDoc(profileRef, updateObj);
    
    // Get updated count
    const updatedProfile = await getDoc(profileRef);
    if (!updatedProfile.exists()) return null;
    
    const newCount = updatedProfile.data()[fieldToUpdate] || 0;
    
    // Check if any badges need to be unlocked based on the new count
    const unlockedBadges = await checkAndUnlockBadges(userId, counterType, newCount);
    return unlockedBadges;
  } catch (error) {
    console.error(`Error incrementing ${counterType} counter:`, error);
    return null;
  }
};

// Check and unlock badges based on progress
export const checkAndUnlockBadges = async (userId: string, category: keyof typeof BADGE_THRESHOLDS, count: number) => {
  try {
    const unlockedBadges: Badge[] = [];
    const thresholds = BADGE_THRESHOLDS[category];
    
    // Check each badge level
    for (const [level, threshold] of Object.entries(thresholds)) {
      if (count >= threshold) {
        const badgeId = `${category.toLowerCase()}_${level.toLowerCase()}`;
        const badgeRef = doc(db, `badges/${userId}/badgeList`, badgeId);
        const badgeSnap = await getDoc(badgeRef);
        
        if (badgeSnap.exists()) {
          const badgeData = badgeSnap.data() as Badge;
          
          // If badge is still locked, unlock it
          if (badgeData.status === 'Locked') {
            await updateDoc(badgeRef, {
              status: 'Unlocked',
              unlockedAt: serverTimestamp(),
              progress: count
            });
            
            // Create a copy with the updated data for the return value
            const updatedBadge: Badge = {
              ...badgeData,
              status: 'Unlocked',
              progress: count,
              unlockedAt: Timestamp.now()
            };
            
            unlockedBadges.push(updatedBadge);
            
            toast({
              title: "🏆 New Badge Unlocked!",
              description: `${updatedBadge.name}: ${updatedBadge.description}`,
              duration: 5000
            });
          }
        }
      }
    }
    
    // Update progress on all badges in this category
    const badgesRef = collection(db, `badges/${userId}/badgeList`);
    const q = query(badgesRef, where("category", "==", category));
    const badges = await getDocs(q);
    
    badges.forEach(async (badgeDoc) => {
      const badgeData = badgeDoc.data() as Badge;
      if (badgeData.status === 'Locked') {
        await updateDoc(badgeDoc.ref, {
          progress: count
        });
      }
    });
    
    return unlockedBadges;
  } catch (error) {
    console.error("Error checking and unlocking badges:", error);
    return [];
  }
};
