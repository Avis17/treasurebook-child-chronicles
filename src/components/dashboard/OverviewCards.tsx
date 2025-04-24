
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Book, Trophy, Star, Image } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
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
        
        // --- ACADEMICS DATA ---
        // Fetch academic records without orderBy (avoiding index errors)
        const academicRef = collection(db, "academicRecords");
        const academicQuery = query(
          academicRef, 
          where("userId", "==", user.uid)
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

        // Manually find the latest record
        let latestRecord = null;
        let latestDate = new Date(0); // Start with oldest possible date

        academicDocs.forEach(doc => {
          const record = doc.data();
          console.log("Processing academic record:", record.subject, record.score);
          
          if (record.createdAt && record.createdAt.toDate) {
            const recordDate = record.createdAt.toDate();
            if (recordDate > latestDate) {
              latestDate = recordDate;
              latestRecord = record;
            }
          }
        });

        if (latestRecord) {
          console.log("Latest academic record:", latestRecord);
          lastAssessment = {
            subject: latestRecord.subject || '-',
            grade: latestRecord.grade || latestRecord.score || '-',
            term: latestRecord.term || '-',
            class: latestRecord.class || latestRecord.year || '-',
            date: latestRecord.createdAt ? format(latestRecord.createdAt.toDate(), 'MMM dd, yyyy') : '-'
          };
          console.log("Processed last assessment:", lastAssessment);
        }
        
        // --- SPORTS DATA ---
        // Fetch sports events without orderBy
        const sportsRef = collection(db, "sportsRecords");
        const sportsQuery = query(
          sportsRef, 
          where("userId", "==", user.uid)
        );
        
        const sportsDocs = await getDocs(sportsQuery);
        console.log(`Found ${sportsDocs.size} sports records`);
        
        const eventsCount = sportsDocs.size;
        let recentEvent = { name: '-', category: '-', date: '-' };
        
        // Manually find the latest record
        let latestSportRecord = null;
        let latestSportDate = new Date(0);

        sportsDocs.forEach(doc => {
          const record = doc.data();
          if (record.createdAt && record.createdAt.toDate) {
            const recordDate = record.createdAt.toDate();
            if (recordDate > latestSportDate) {
              latestSportDate = recordDate;
              latestSportRecord = record;
            }
          }
        });
        
        if (latestSportRecord) {
          console.log("Latest sports record:", latestSportRecord);
          recentEvent = {
            name: latestSportRecord.eventName || latestSportRecord.name || '-',
            category: latestSportRecord.category || '-',
            date: latestSportRecord.createdAt ? format(latestSportRecord.createdAt.toDate(), 'MMM dd, yyyy') : '-'
          };
        }

        // --- EXTRACURRICULAR DATA ---
        // Fetch extracurricular activities without orderBy
        const talentsRef = collection(db, "extraCurricularRecords");
        const talentsQuery = query(
          talentsRef, 
          where("userId", "==", user.uid)
        );
        
        const talentsDocs = await getDocs(talentsQuery);
        console.log(`Found ${talentsDocs.size} extracurricular records`);
        
        const skillsCount = talentsDocs.size;
        let latestSkill = { activity: '-', category: '-' };
        
        // Manually find the latest record
        let latestTalentRecord = null;
        let latestTalentDate = new Date(0);

        talentsDocs.forEach(doc => {
          const record = doc.data();
          if (record.createdAt && record.createdAt.toDate) {
            const recordDate = record.createdAt.toDate();
            if (recordDate > latestTalentDate) {
              latestTalentDate = recordDate;
              latestTalentRecord = record;
            }
          }
        });
        
        if (latestTalentRecord) {
          console.log("Latest talent record:", latestTalentRecord);
          latestSkill = {
            activity: latestTalentRecord.activity || '-',
            category: latestTalentRecord.category || '-'
          };
        }

        // --- GALLERY DATA ---
        // Fetch gallery items without orderBy
        const galleryRef = collection(db, "gallery");
        const galleryQuery = query(
          galleryRef, 
          where("userId", "==", user.uid)
        );
        
        const galleryDocs = await getDocs(galleryQuery);
        console.log(`Found ${galleryDocs.size} gallery records`);
        
        const photosCount = galleryDocs.size;
        let lastUpdate = '-';
        
        // Manually find the latest record
        let latestGalleryRecord = null;
        let latestGalleryDate = new Date(0);

        galleryDocs.forEach(doc => {
          const record = doc.data();
          if (record.createdAt && record.createdAt.toDate) {
            const recordDate = record.createdAt.toDate();
            if (recordDate > latestGalleryDate) {
              latestGalleryDate = recordDate;
              latestGalleryRecord = record;
            }
          }
        });
        
        if (latestGalleryRecord) {
          console.log("Latest gallery item:", latestGalleryRecord);
          lastUpdate = latestGalleryRecord.createdAt ? format(latestGalleryRecord.createdAt.toDate(), 'MMM dd, yyyy') : '-';
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
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  return (
    <div className="mt-8 mb-12 px-6">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all dark:bg-gray-800">
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

        <Card className="p-6 border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-all dark:bg-gray-800">
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

        <Card className="p-6 border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all dark:bg-gray-800">
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

        <Card className="p-6 border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all dark:bg-gray-800">
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
    </div>
  );
};

export default OverviewCards;
