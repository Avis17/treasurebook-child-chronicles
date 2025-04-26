
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, setDoc, collection, getDocs } from "firebase/firestore";

// Update user's activity counters and check if badge should be unlocked
export const updateActivityCounter = async (userId: string, activityType: string) => {
  if (!userId) return;
  
  try {
    // Determine which counter to increment
    let counterField = "";
    switch (activityType.toLowerCase()) {
      case "quiz":
        counterField = "quizAttemptsCount";
        break;
      case "journal":
        counterField = "journalEntriesCount";
        break;
      case "goal":
        counterField = "goalsCompletedCount";
        break;
      case "sport":
        counterField = "sportsParticipationsCount";
        break;
      case "extracurricular":
        counterField = "extraCurricularParticipationsCount";
        break;
      default:
        console.error("Invalid activity type:", activityType);
        return;
    }
    
    // Get the user's profile
    const profileRef = doc(db, "profiles", userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      // Increment the counter
      await updateDoc(profileRef, {
        [counterField]: increment(1)
      });
      
      // Re-fetch the updated profile
      const updatedProfileSnap = await getDoc(profileRef);
      const profileData = updatedProfileSnap.data();
      
      // Get the category and current value
      let category = "";
      let currentValue = 0;
      
      switch (counterField) {
        case "quizAttemptsCount":
          category = "Quizzes";
          currentValue = profileData.quizAttemptsCount || 0;
          break;
        case "journalEntriesCount":
          category = "Journals";
          currentValue = profileData.journalEntriesCount || 0;
          break;
        case "goalsCompletedCount":
          category = "Goals";
          currentValue = profileData.goalsCompletedCount || 0;
          break;
        case "sportsParticipationsCount":
          category = "Sports";
          currentValue = profileData.sportsParticipationsCount || 0;
          break;
        case "extraCurricularParticipationsCount":
          category = "Extracurricular";
          currentValue = profileData.extraCurricularParticipationsCount || 0;
          break;
      }
      
      // Check if any badges should be unlocked
      if (category) {
        await checkAndUnlockBadges(userId, category, currentValue);
      }
    } else {
      // Create profile if it doesn't exist
      await setDoc(profileRef, {
        [counterField]: 1
      });
    }
  } catch (error) {
    console.error("Error updating activity counter:", error);
  }
};

// Check if any badges should be unlocked based on current count
const checkAndUnlockBadges = async (userId: string, category: string, currentCount: number) => {
  try {
    // Define thresholds for each badge level
    const thresholds = {
      "Quizzes": { Bronze: 5, Silver: 20, Gold: 50 },
      "Journals": { Bronze: 3, Silver: 10, Gold: 30 },
      "Goals": { Bronze: 5, Silver: 15, Gold: 30 },
      "Sports": { Bronze: 3, Silver: 10, Gold: 20 },
      "Extracurricular": { Bronze: 3, Silver: 10, Gold: 20 }
    };
    
    // Check each level
    for (const [level, threshold] of Object.entries(thresholds[category as keyof typeof thresholds])) {
      if (currentCount >= threshold) {
        // Check if badge exists and is locked
        const badgeId = `${category}-${level}`;
        const badgeRef = doc(db, "badges", userId, "badgeList", badgeId);
        const badgeSnap = await getDoc(badgeRef);
        
        if (badgeSnap.exists()) {
          const badgeData = badgeSnap.data();
          if (badgeData.status === "Locked") {
            // Unlock the badge
            await updateDoc(badgeRef, {
              status: "Unlocked",
              unlockedAt: new Date(),
              progress: currentCount
            });
            
            // Could trigger notification here
            console.log(`Badge unlocked: ${category} ${level}`);
            return true;
          }
        } else {
          // Create the badge if it doesn't exist
          const badgeData = getBadgeData(category, level as "Bronze" | "Silver" | "Gold");
          
          await setDoc(badgeRef, {
            ...badgeData,
            status: "Unlocked",
            unlockedAt: new Date(),
            progress: currentCount,
            required: threshold
          });
          
          console.log(`Badge created and unlocked: ${category} ${level}`);
          return true;
        }
      }
    }
    
    // Update progress for locked badges
    const badgesRef = collection(db, "badges", userId, "badgeList");
    const badgesSnap = await getDocs(badgesRef);
    
    badgesSnap.forEach(async (badgeDoc) => {
      const badgeData = badgeDoc.data();
      
      if (badgeData.category === category && badgeData.status === "Locked") {
        await updateDoc(doc(db, "badges", userId, "badgeList", badgeDoc.id), {
          progress: currentCount
        });
      }
    });
    
    return false;
  } catch (error) {
    console.error("Error checking badges:", error);
    return false;
  }
};

// Get badge data based on category and level
const getBadgeData = (category: string, level: "Bronze" | "Silver" | "Gold") => {
  const badgeDefinitions = {
    "Quizzes": {
      "Bronze": { name: "Quiz Rookie", description: "Completed 5 quizzes" },
      "Silver": { name: "Quiz Master", description: "Completed 20 quizzes" },
      "Gold": { name: "Quiz Champion", description: "Completed 50 quizzes" }
    },
    "Journals": {
      "Bronze": { name: "Journal Beginner", description: "Created 3 journal entries" },
      "Silver": { name: "Journal Explorer", description: "Created 10 journal entries" },
      "Gold": { name: "Journal Expert", description: "Created 30 journal entries" }
    },
    "Goals": {
      "Bronze": { name: "Goal Setter", description: "Completed 5 goals" },
      "Silver": { name: "Goal Achiever", description: "Completed 15 goals" },
      "Gold": { name: "Goal Champion", description: "Completed 30 goals" }
    },
    "Sports": {
      "Bronze": { name: "Sports Participant", description: "Participated in 3 sports events" },
      "Silver": { name: "Sports Competitor", description: "Participated in 10 sports events" },
      "Gold": { name: "Sports Star", description: "Participated in 20 sports events" }
    },
    "Extracurricular": {
      "Bronze": { name: "Activity Explorer", description: "Participated in 3 extracurricular activities" },
      "Silver": { name: "Activity Enthusiast", description: "Participated in 10 extracurricular activities" },
      "Gold": { name: "Activity Champion", description: "Participated in 20 extracurricular activities" }
    }
  };
  
  return {
    name: badgeDefinitions[category as keyof typeof badgeDefinitions][level].name,
    description: badgeDefinitions[category as keyof typeof badgeDefinitions][level].description,
    category,
    level,
    status: "Locked",
    progress: 0,
    required: getThresholdForBadge(category, level)
  };
};

// Get threshold for badge
const getThresholdForBadge = (category: string, level: "Bronze" | "Silver" | "Gold") => {
  const thresholds = {
    "Quizzes": { Bronze: 5, Silver: 20, Gold: 50 },
    "Journals": { Bronze: 3, Silver: 10, Gold: 30 },
    "Goals": { Bronze: 5, Silver: 15, Gold: 30 },
    "Sports": { Bronze: 3, Silver: 10, Gold: 20 },
    "Extracurricular": { Bronze: 3, Silver: 10, Gold: 20 }
  };
  
  return thresholds[category as keyof typeof thresholds][level];
};
