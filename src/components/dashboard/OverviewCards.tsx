
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Book, Trophy, Star, Image } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface OverviewData {
  academics: {
    grade: string;
    lastAssessment: string;
  };
  sports: {
    events: number;
    recentEvent: string;
  };
  talents: {
    skills: number;
    latestSkill: string;
  };
  gallery: {
    photos: number;
    lastUpdate: string;
  };
}

const OverviewCards = () => {
  const [data, setData] = useState<OverviewData>({
    academics: { grade: '-', lastAssessment: '-' },
    sports: { events: 0, recentEvent: 'None' },
    talents: { skills: 0, latestSkill: 'None' },
    gallery: { photos: 0, lastUpdate: 'Never' }
  });

  useEffect(() => {
    const fetchOverviewData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch academic data
        const academicRef = collection(db, "academicRecords");
        const academicQuery = query(academicRef, where("userId", "==", user.uid));
        const academicDocs = await getDocs(academicQuery);
        let latestGrade = '-';
        let latestSubject = '';
        if (!academicDocs.empty) {
          const latestRecord = academicDocs.docs
            .map(doc => ({ ...doc.data() }))
            .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate())[0];
          latestGrade = latestRecord.grade;
          latestSubject = latestRecord.subject;
        }

        // Fetch sports data
        const sportsRef = collection(db, "sportsRecords");
        const sportsQuery = query(sportsRef, where("userId", "==", user.uid));
        const sportsDocs = await getDocs(sportsQuery);
        const eventsCount = sportsDocs.size;
        let recentEvent = 'None';
        if (!sportsDocs.empty) {
          const latestSport = sportsDocs.docs
            .map(doc => ({ ...doc.data() }))
            .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate())[0];
          recentEvent = latestSport.event || 'None';
        }

        // Fetch extracurricular/talents data
        const talentsRef = collection(db, "extraCurricularRecords");
        const talentsQuery = query(talentsRef, where("userId", "==", user.uid));
        const talentsDocs = await getDocs(talentsQuery);
        const skillsCount = talentsDocs.size;
        let latestSkill = 'None';
        if (!talentsDocs.empty) {
          const latestTalent = talentsDocs.docs
            .map(doc => ({ ...doc.data() }))
            .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate())[0];
          latestSkill = latestTalent.activity || 'None';
        }

        // Update state with fetched data
        setData({
          academics: {
            grade: latestGrade,
            lastAssessment: latestSubject
          },
          sports: {
            events: eventsCount,
            recentEvent
          },
          talents: {
            skills: skillsCount,
            latestSkill
          },
          gallery: {
            photos: 0, // This will be implemented when gallery feature is added
            lastUpdate: 'Never'
          }
        });

      } catch (error) {
        console.error("Error fetching overview data:", error);
      }
    };

    fetchOverviewData();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
            <Book className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{data.academics.grade}</h3>
            <p className="text-sm text-muted-foreground">
              Last assessment: {data.academics.lastAssessment}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-l-4 border-l-orange-500">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/20">
            <Trophy className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{data.sports.events} Events</h3>
            <p className="text-sm text-muted-foreground">
              Recent: {data.sports.recentEvent}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-l-4 border-l-green-500">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
            <Star className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{data.talents.skills} Skills</h3>
            <p className="text-sm text-muted-foreground">
              Latest: {data.talents.latestSkill}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-l-4 border-l-purple-500">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/20">
            <Image className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{data.gallery.photos} Photos</h3>
            <p className="text-sm text-muted-foreground">
              Last update: {data.gallery.lastUpdate}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewCards;
