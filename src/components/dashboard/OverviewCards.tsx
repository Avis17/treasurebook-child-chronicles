
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Book, Trophy, Star, Image, AlertCircle } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOverviewData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        console.log("Fetching overview data for user:", user.uid);
        setLoading(true);
        setError(null);
        
        // --- ACADEMICS DATA ---
        // Fetch academic records
        const academicRef = collection(db, "academicRecords");
        const academicQuery = query(
          academicRef, 
          where("userId", "==", user.uid)
        );
        
        console.log("Fetching academic records...");
        let academicDocs;
        try {
          academicDocs = await getDocs(academicQuery);
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
            } else if (record.updatedAt && record.updatedAt.toDate) {
              const recordDate = record.updatedAt.toDate();
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
              date: latestRecord.createdAt ? 
                format(latestRecord.createdAt.toDate(), 'MMM dd, yyyy') : 
                latestRecord.updatedAt ? 
                  format(latestRecord.updatedAt.toDate(), 'MMM dd, yyyy') : '-'
            };
            console.log("Processed last assessment:", lastAssessment);
          }
          
          // --- SPORTS DATA ---
          // Fetch sports events
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
            } else if (record.updatedAt && record.updatedAt.toDate) {
              const recordDate = record.updatedAt.toDate();
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
              date: latestSportRecord.createdAt ? 
                format(latestSportRecord.createdAt.toDate(), 'MMM dd, yyyy') : 
                latestSportRecord.updatedAt ? 
                  format(latestSportRecord.updatedAt.toDate(), 'MMM dd, yyyy') : '-'
            };
          }

          // --- EXTRACURRICULAR DATA ---
          // Fetch extracurricular activities
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
            } else if (record.updatedAt && record.updatedAt.toDate) {
              const recordDate = record.updatedAt.toDate();
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
          // Fetch gallery items
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
            } else if (record.updatedAt && record.updatedAt.toDate) {
              const recordDate = record.updatedAt.toDate();
              if (recordDate > latestGalleryDate) {
                latestGalleryDate = recordDate;
                latestGalleryRecord = record;
              }
            }
          });
          
          if (latestGalleryRecord) {
            console.log("Latest gallery item:", latestGalleryRecord);
            lastUpdate = latestGalleryRecord.createdAt ? 
              format(latestGalleryRecord.createdAt.toDate(), 'MMM dd, yyyy') : 
              latestGalleryRecord.updatedAt ? 
                format(latestGalleryRecord.updatedAt.toDate(), 'MMM dd, yyyy') : '-';
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
        } catch (err) {
          console.error("Error fetching overview data:", err);
          setError("Database indexing error. Please check Firebase console to create required indexes.");
          toast({
            variant: "destructive", 
            title: "Database indexing error",
            description: "Some data may not display correctly"
          });
        }

      } catch (error) {
        console.error("Error fetching overview data:", error);
        setError("Failed to load overview data");
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [toast]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6 shadow-md dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-700">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-10 w-10"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error Loading Overview Data</h3>
          <p className="text-sm text-red-600 dark:text-red-400 max-w-md mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6 border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/20">
            <Book className="h-6 w-6 text-blue-500" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-bold">Academic</h3>
            <div className="space-y-1.5">
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

      <Card className="p-6 border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-orange-100 rounded-lg dark:bg-orange-900/20">
            <Trophy className="h-6 w-6 text-orange-500" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-bold">Sports</h3>
            <div className="space-y-1.5">
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

      <Card className="p-6 border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900/20">
            <Star className="h-6 w-6 text-green-500" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-bold">Activities</h3>
            <div className="space-y-1.5">
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

      <Card className="p-6 border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900/20">
            <Image className="h-6 w-6 text-purple-500" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-bold">Gallery</h3>
            <div className="space-y-1.5">
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
