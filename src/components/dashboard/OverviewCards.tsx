
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Book, Trophy, Star, Image } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

interface OverviewData {
  academics: {
    grade: string;
    lastAssessment: {
      subject: string;
      grade: string;
      term: string;
      class: string;
      date: string;
    };
  };
  sports: {
    events: number;
    recentEvent: {
      name: string;
      category: string;
      date: string;
    };
  };
  talents: {
    skills: number;
    latestSkill: {
      activity: string;
      category: string;
    };
  };
  gallery: {
    photos: number;
    lastUpdate: string;
  };
}

const OverviewCards = () => {
  const [data, setData] = useState<OverviewData>({
    academics: { 
      grade: '-', 
      lastAssessment: {
        subject: '-',
        grade: '-',
        term: '-',
        class: '-',
        date: '-'
      }
    },
    sports: { 
      events: 0, 
      recentEvent: {
        name: '-',
        category: '-',
        date: '-'
      }
    },
    talents: { 
      skills: 0, 
      latestSkill: {
        activity: '-',
        category: '-'
      }
    },
    gallery: { photos: 0, lastUpdate: '-' }
  });

  useEffect(() => {
    const fetchOverviewData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch academic records
        const academicRef = collection(db, "academicRecords");
        const academicQuery = query(
          academicRef, 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const academicDocs = await getDocs(academicQuery);
        let lastAssessment = {
          subject: '-',
          grade: '-',
          term: '-',
          class: '-',
          date: '-'
        };

        if (!academicDocs.empty) {
          const latestRecord = academicDocs.docs[0].data();
          lastAssessment = {
            subject: latestRecord.subject || '-',
            grade: latestRecord.grade || '-',
            term: latestRecord.term || '-',
            class: latestRecord.class || '-',
            date: latestRecord.createdAt ? format(latestRecord.createdAt.toDate(), 'MMM dd, yyyy') : '-'
          };
        }

        // Fetch sports events
        const sportsRef = collection(db, "sportsRecords");
        const sportsQuery = query(
          sportsRef, 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const sportsDocs = await getDocs(sportsQuery);
        const eventsCount = sportsDocs.size;
        let recentEvent = { name: '-', category: '-', date: '-' };
        
        if (!sportsDocs.empty) {
          const latestSport = sportsDocs.docs[0].data();
          recentEvent = {
            name: latestSport.eventName || latestSport.name || '-',
            category: latestSport.category || '-',
            date: latestSport.createdAt ? format(latestSport.createdAt.toDate(), 'MMM dd, yyyy') : '-'
          };
        }

        // Fetch extracurricular activities
        const talentsRef = collection(db, "extraCurricularRecords");
        const talentsQuery = query(
          talentsRef, 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const talentsDocs = await getDocs(talentsQuery);
        const skillsCount = talentsDocs.size;
        let latestSkill = { activity: '-', category: '-' };
        
        if (!talentsDocs.empty) {
          const latestTalent = talentsDocs.docs[0].data();
          latestSkill = {
            activity: latestTalent.activity || '-',
            category: latestTalent.category || '-'
          };
        }

        // Fetch gallery items
        const galleryRef = collection(db, "gallery");
        const galleryQuery = query(
          galleryRef, 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const galleryDocs = await getDocs(galleryQuery);
        const photosCount = galleryDocs.size;
        let lastUpdate = '-';
        
        if (!galleryDocs.empty) {
          const latestPhoto = galleryDocs.docs[0].data();
          lastUpdate = latestPhoto.createdAt ? format(latestPhoto.createdAt.toDate(), 'MMM dd, yyyy') : '-';
        }

        setData({
          academics: {
            grade: lastAssessment.grade,
            lastAssessment
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
            photos: photosCount,
            lastUpdate
          }
        });

      } catch (error) {
        console.error("Error fetching overview data:", error);
      }
    };

    fetchOverviewData();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 p-6">
      <Card className="p-6 border-l-4 border-l-blue-500">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/20">
            <Book className="h-6 w-6 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{data.academics.lastAssessment.subject}</h3>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Class: {data.academics.lastAssessment.class}
              </p>
              <p className="text-sm text-muted-foreground">
                Term: {data.academics.lastAssessment.term}
              </p>
              <p className="text-sm text-muted-foreground">
                Grade: {data.academics.lastAssessment.grade}
              </p>
              <p className="text-xs text-muted-foreground">
                Date: {data.academics.lastAssessment.date}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-orange-500">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-orange-100 rounded-lg dark:bg-orange-900/20">
            <Trophy className="h-6 w-6 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{data.sports.events} Events</h3>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Recent: {data.sports.recentEvent.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Category: {data.sports.recentEvent.category}
              </p>
              {data.sports.recentEvent.date !== '-' && (
                <p className="text-xs text-muted-foreground">
                  Date: {data.sports.recentEvent.date}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-green-500">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900/20">
            <Star className="h-6 w-6 text-green-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{data.talents.skills} Skills</h3>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Latest: {data.talents.latestSkill.activity}
              </p>
              <p className="text-sm text-muted-foreground">
                Category: {data.talents.latestSkill.category}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-purple-500">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900/20">
            <Image className="h-6 w-6 text-purple-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{data.gallery.photos} Photos</h3>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Last update: {data.gallery.lastUpdate}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewCards;
