
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Book, Trophy, Star, Image } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        console.log("Fetching overview data for user:", user.uid);
        setLoading(true);
        
        // Fetch academic records
        const academicRef = collection(db, "academicRecords");
        const academicQuery = query(
          academicRef, 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        
        console.log("Fetching academic records...");
        const academicDocs = await getDocs(academicQuery);
        console.log(`Found ${academicDocs.size} academic records`);
        
        let lastAssessment = {
          subject: '-',
          grade: '-',
          term: '-',
          class: '-',
          date: '-'
        };

        if (!academicDocs.empty) {
          const latestRecord = academicDocs.docs[0].data();
          console.log("Latest academic record:", latestRecord);
          
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
        
        console.log("Fetching sports records...");
        const sportsDocs = await getDocs(sportsQuery);
        console.log(`Found ${sportsDocs.size} sports records`);
        
        const eventsCount = sportsDocs.size;
        let recentEvent = { name: '-', category: '-', date: '-' };
        
        if (!sportsDocs.empty) {
          const latestSport = sportsDocs.docs[0].data();
          console.log("Latest sports record:", latestSport);
          
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
        
        console.log("Fetching extracurricular records...");
        const talentsDocs = await getDocs(talentsQuery);
        console.log(`Found ${talentsDocs.size} extracurricular records`);
        
        const skillsCount = talentsDocs.size;
        let latestSkill = { activity: '-', category: '-' };
        
        if (!talentsDocs.empty) {
          const latestTalent = talentsDocs.docs[0].data();
          console.log("Latest talent record:", latestTalent);
          
          latestSkill = {
            activity: latestTalent.activity || '-',
            category: latestTalent.category || '-'
          };
        }

        // Fetch gallery items
        const galleryRef = collection(db, "gallery");
        const galleryQuery = query(
          galleryRef, 
          where("userId", "==", user.uid)
        );
        
        console.log("Fetching gallery records...");
        const galleryDocs = await getDocs(galleryQuery);
        console.log(`Found ${galleryDocs.size} gallery records`);
        
        const photosCount = galleryDocs.size;
        let lastUpdate = '-';
        
        if (!galleryDocs.empty) {
          // Sort the documents by creation date to find the latest
          const sortedDocs = galleryDocs.docs.sort((a, b) => {
            const aDate = a.data().createdAt ? a.data().createdAt.toDate().getTime() : 0;
            const bDate = b.data().createdAt ? b.data().createdAt.toDate().getTime() : 0;
            return bDate - aDate;
          });
          
          const latestPhoto = sortedDocs[0].data();
          console.log("Latest gallery item:", latestPhoto);
          
          lastUpdate = latestPhoto.createdAt ? format(latestPhoto.createdAt.toDate(), 'MMM dd, yyyy') : '-';
        }
        
        // Fetch calendar events (upcoming activities)
        const calendarRef = collection(db, "calendarEvents");
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        
        const calendarQuery = query(
          calendarRef,
          where("userId", "==", user.uid),
          where("date", ">=", todayStr),
          orderBy("date", "asc"),
          limit(5)
        );
        
        console.log("Fetching calendar events...");
        const calendarDocs = await getDocs(calendarQuery);
        console.log(`Found ${calendarDocs.size} upcoming events`);

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
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 p-6">
      <Card className="p-6 border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/20">
            <Book className="h-6 w-6 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Academic</h3>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {data.academics.lastAssessment.subject !== '-' ? 
                  `Subject: ${data.academics.lastAssessment.subject}` : 
                  'No academic records yet'}
              </p>
              {data.academics.lastAssessment.class !== '-' && (
                <p className="text-sm text-muted-foreground">
                  Class: {data.academics.lastAssessment.class}
                </p>
              )}
              {data.academics.lastAssessment.term !== '-' && (
                <p className="text-sm text-muted-foreground">
                  Term: {data.academics.lastAssessment.term}
                </p>
              )}
              {data.academics.lastAssessment.grade !== '-' && (
                <p className="text-sm text-muted-foreground">
                  Grade: {data.academics.lastAssessment.grade}
                </p>
              )}
              {data.academics.lastAssessment.date !== '-' && (
                <p className="text-xs text-muted-foreground">
                  Date: {data.academics.lastAssessment.date}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-orange-100 rounded-lg dark:bg-orange-900/20">
            <Trophy className="h-6 w-6 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Sports</h3>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {data.sports.events} {data.sports.events === 1 ? 'Event' : 'Events'}
              </p>
              {data.sports.recentEvent.name !== '-' && (
                <p className="text-sm text-muted-foreground">
                  Recent: {data.sports.recentEvent.name}
                </p>
              )}
              {data.sports.recentEvent.category !== '-' && (
                <p className="text-sm text-muted-foreground">
                  Category: {data.sports.recentEvent.category}
                </p>
              )}
              {data.sports.recentEvent.date !== '-' && (
                <p className="text-xs text-muted-foreground">
                  Date: {data.sports.recentEvent.date}
                </p>
              )}
              {data.sports.events === 0 && (
                <p className="text-xs text-muted-foreground">
                  No sports events added yet
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900/20">
            <Star className="h-6 w-6 text-green-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Activities</h3>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {data.talents.skills} {data.talents.skills === 1 ? 'Activity' : 'Activities'}
              </p>
              {data.talents.latestSkill.activity !== '-' && (
                <p className="text-sm text-muted-foreground">
                  Latest: {data.talents.latestSkill.activity}
                </p>
              )}
              {data.talents.latestSkill.category !== '-' && (
                <p className="text-sm text-muted-foreground">
                  Category: {data.talents.latestSkill.category}
                </p>
              )}
              {data.talents.skills === 0 && (
                <p className="text-xs text-muted-foreground">
                  No activities added yet
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900/20">
            <Image className="h-6 w-6 text-purple-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Gallery</h3>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {data.gallery.photos} {data.gallery.photos === 1 ? 'Photo' : 'Photos'}
              </p>
              {data.gallery.lastUpdate !== '-' && (
                <p className="text-sm text-muted-foreground">
                  Last update: {data.gallery.lastUpdate}
                </p>
              )}
              {data.gallery.photos === 0 && (
                <p className="text-xs text-muted-foreground">
                  No photos added yet
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewCards;
