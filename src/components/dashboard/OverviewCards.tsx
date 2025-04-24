
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
      date: string;
    };
  };
  sports: {
    events: number;
    recentEvent: {
      name: string;
      date: string;
    };
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
    academics: { 
      grade: '-', 
      lastAssessment: {
        subject: '-',
        grade: '-',
        term: '-',
        date: '-'
      }
    },
    sports: { 
      events: 0, 
      recentEvent: {
        name: 'None',
        date: '-'
      }
    },
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
        const academicQuery = query(
          academicRef, 
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
          limit(1)
        );
        const academicDocs = await getDocs(academicQuery);
        let latestGrade = '-';
        let lastAssessment = {
          subject: '-',
          grade: '-',
          term: '-',
          date: '-'
        };

        if (!academicDocs.empty) {
          const latestRecord = academicDocs.docs[0].data();
          latestGrade = latestRecord.grade;
          lastAssessment = {
            subject: latestRecord.subject,
            grade: latestRecord.grade,
            term: latestRecord.term || '-',
            date: format(latestRecord.date.toDate(), 'MMM dd, yyyy')
          };
        }

        // Fetch sports data
        const sportsRef = collection(db, "sportsRecords");
        const sportsQuery = query(
          sportsRef, 
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
          limit(1)
        );
        const sportsDocs = await getDocs(sportsQuery);
        const eventsCount = sportsDocs.size;
        let recentEvent = { name: 'None', date: '-' };
        
        if (!sportsDocs.empty) {
          const latestSport = sportsDocs.docs[0].data();
          recentEvent = {
            name: latestSport.event || 'None',
            date: format(latestSport.date.toDate(), 'MMM dd, yyyy')
          };
        }

        // Fetch extracurricular/talents data
        const talentsRef = collection(db, "extraCurricularRecords");
        const talentsQuery = query(
          talentsRef, 
          where("userId", "==", user.uid),
          orderBy("date", "desc")
        );
        const talentsDocs = await getDocs(talentsQuery);
        const skillsCount = talentsDocs.size;
        let latestSkill = 'None';
        
        if (!talentsDocs.empty) {
          const latestTalent = talentsDocs.docs[0].data();
          latestSkill = latestTalent.activity || 'None';
        }

        // Fetch gallery data
        const galleryRef = collection(db, "gallery");
        const galleryQuery = query(
          galleryRef, 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const galleryDocs = await getDocs(galleryQuery);
        const photosCount = galleryDocs.size;
        let lastUpdate = 'Never';
        
        if (!galleryDocs.empty) {
          const latestPhoto = galleryDocs.docs[0].data();
          lastUpdate = format(latestPhoto.createdAt.toDate(), 'MMM dd, yyyy');
        }

        // Update state with fetched data
        setData({
          academics: {
            grade: latestGrade,
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
            <Book className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">{data.academics.grade}</h3>
            <div className="space-y-0.5">
              <p className="text-sm text-muted-foreground">
                Last assessment: {data.academics.lastAssessment.subject}
              </p>
              <p className="text-xs text-muted-foreground">
                Term: {data.academics.lastAssessment.term} | Grade: {data.academics.lastAssessment.grade}
              </p>
              <p className="text-xs text-muted-foreground">
                Date: {data.academics.lastAssessment.date}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-l-4 border-l-orange-500">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/20">
            <Trophy className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">{data.sports.events} Events</h3>
            <div className="space-y-0.5">
              <p className="text-sm text-muted-foreground">
                Recent: {data.sports.recentEvent.name}
              </p>
              {data.sports.recentEvent.name !== 'None' && (
                <p className="text-xs text-muted-foreground">
                  Date: {data.sports.recentEvent.date}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-l-4 border-l-green-500">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
            <Star className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">{data.talents.skills} Skills</h3>
            <div className="space-y-0.5">
              <p className="text-sm text-muted-foreground">
                Latest: {data.talents.latestSkill}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-l-4 border-l-purple-500">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/20">
            <Image className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">{data.gallery.photos} Photos</h3>
            <div className="space-y-0.5">
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
