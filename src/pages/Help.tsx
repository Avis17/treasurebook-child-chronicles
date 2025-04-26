
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BookOpen, 
  GraduationCap,
  Trophy, 
  Award,
  Target, 
  Calendar, 
  MessageSquare,
  FileArchive,
  Lightbulb,
  HelpCircle, 
  Settings,
  User,
  BookOpenText,
  Archive,
  ImageIcon,
  FileText,
  Users,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  content: React.ReactNode;
}

const HelpPage = () => {
  const [openVideo, setOpenVideo] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  const helpSections: HelpSection[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Overview of your student's performance and activities",
      content: (
        <div className="space-y-4">
          <p>
            The Dashboard is your central hub for monitoring your student's progress across all areas. It provides a comprehensive overview of academic performance, sports activities, extracurricular achievements, and upcoming events.
          </p>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Performance Overview:</span> Visual graphs showing academic progress over time.</li>
            <li><span className="font-medium">Progress Cards:</span> Quick view of key metrics in academics, sports, and extracurricular activities.</li>
            <li><span className="font-medium">Recent Activities:</span> Latest records from various sections of the application.</li>
            <li><span className="font-medium">Calendar Events:</span> Upcoming important dates and events.</li>
          </ul>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-blue-500" />
              Pro Tip
            </h4>
            <p>Check your dashboard regularly to get a quick snapshot of your child's overall progress and areas that may need attention.</p>
          </div>
        </div>
      )
    },
    {
      id: "academics",
      title: "Academic Records",
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Track academic performance, grades, and subjects",
      content: (
        <div className="space-y-4">
          <p>
            The Academic Records section allows you to track your student's academic performance across subjects, terms, and years. It provides detailed insights into grades, exam scores, and progress over time.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click on "Add Academic Record" to enter new grade information.</li>
            <li>Fill in details such as subject, score, term, and year.</li>
            <li>Use filters to view records by year, term, or subject.</li>
            <li>Edit or delete records using the action icons in the table.</li>
            <li>View performance trends in the charts section.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Subject Tracking:</span> Monitor progress in individual subjects.</li>
            <li><span className="font-medium">Performance Analysis:</span> Charts showing grade trends over time.</li>
            <li><span className="font-medium">Term Comparison:</span> Compare academic performance across different terms.</li>
            <li><span className="font-medium">Grade Calculation:</span> Automatic calculation of percentages and grades.</li>
          </ul>
          
          <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Important Note
            </h4>
            <p>Records with scores below 40% will automatically appear in "Areas Needing Attention" in the AI Insights section.</p>
          </div>
        </div>
      )
    },
    {
      id: "sports",
      title: "Sports",
      icon: <Trophy className="h-5 w-5" />,
      description: "Track sports participation and achievements",
      content: (
        <div className="space-y-4">
          <p>
            The Sports section helps you keep track of all sports activities, events, competitions, and achievements. Document your student's participation in various sports, their progress, positions achieved, and coaching details.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click "Add Sports Record" to create a new entry.</li>
            <li>Select the sport type or choose "Other" to specify a custom sport.</li>
            <li>Enter details about the event, venue, date, and achievement.</li>
            <li>Record positions or medals won for competitive events.</li>
            <li>Add coaching information and personal notes as needed.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Custom Sports:</span> Record any sport type, including custom entries.</li>
            <li><span className="font-medium">Achievement Tracking:</span> Document positions, medals, and certificates.</li>
            <li><span className="font-medium">Coach Information:</span> Keep track of trainers and coaches.</li>
            <li><span className="font-medium">Sports History:</span> Build a complete sports participation history over time.</li>
          </ul>
          
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              Pro Tip
            </h4>
            <p>Sports achievements contribute to your student's overall growth score in AI Insights. Higher achievements like gold medals or first positions receive higher weightage.</p>
          </div>
        </div>
      )
    },
    {
      id: "extracurricular",
      title: "Extracurricular Activities",
      icon: <Award className="h-5 w-5" />,
      description: "Track participation in activities beyond academics",
      content: (
        <div className="space-y-4">
          <p>
            The Extracurricular Activities section allows you to document all non-academic and non-sports activities that contribute to your student's holistic development. This includes arts, music, clubs, social work, and more.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click "Add Activity" to create a new extracurricular record.</li>
            <li>Select the category from the dropdown (Arts, Music, Social Work, etc.).</li>
            <li>Choose the participation level (School, District, State, National, etc.).</li>
            <li>Document any achievements or positions using the standardized options.</li>
            <li>Add details about the event, date, and organizers.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Categorized Activities:</span> Organize activities by different types.</li>
            <li><span className="font-medium">Achievement Levels:</span> Standardized tracking of positions and awards.</li>
            <li><span className="font-medium">Participation Breadth:</span> Monitor involvement across different categories.</li>
            <li><span className="font-medium">Holistic Development:</span> Track growth in non-academic areas.</li>
          </ul>
          
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-purple-500" />
              Pro Tip
            </h4>
            <p>A diverse range of extracurricular activities across different categories helps create a well-rounded profile and improves the overall growth score.</p>
          </div>
        </div>
      )
    },
    {
      id: "goals",
      title: "Goals",
      icon: <Target className="h-5 w-5" />,
      description: "Set and track personal and academic goals",
      content: (
        <div className="space-y-4">
          <p>
            The Goals section helps you and your student set specific, achievable objectives and track progress toward them. Goals can be academic, personal, sports-related, or for any area of development.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click "Add Goal" to create a new goal.</li>
            <li>Define a clear and specific goal title and description.</li>
            <li>Set a target date for achievement.</li>
            <li>Assign a category and priority level.</li>
            <li>Update progress regularly as steps are completed.</li>
            <li>Mark goals as complete once achieved.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Progress Tracking:</span> Monitor advancement toward goals.</li>
            <li><span className="font-medium">Prioritization:</span> Assign importance levels to focus efforts.</li>
            <li><span className="font-medium">Deadline Management:</span> Keep track of target dates.</li>
            <li><span className="font-medium">Goal Categories:</span> Organize by areas of development.</li>
          </ul>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-blue-500" />
              Pro Tip
            </h4>
            <p>Setting specific, measurable goals with clear deadlines increases the likelihood of achievement. Completed goals contribute positively to the overall growth score.</p>
          </div>
        </div>
      )
    },
    {
      id: "journal",
      title: "Journal",
      icon: <BookOpenText className="h-5 w-5" />,
      description: "Record thoughts, experiences, and reflections",
      content: (
        <div className="space-y-4">
          <p>
            The Journal section provides a private space for recording thoughts, experiences, achievements, challenges, and reflections. It helps document personal growth and memorable moments throughout the academic journey.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click "Add Journal Entry" to create a new record.</li>
            <li>Give your entry a meaningful title.</li>
            <li>Write your reflections, thoughts, or experiences in the content area.</li>
            <li>Add tags to categorize and easily find entries later.</li>
            <li>Set the date or use the current date.</li>
            <li>Browse past entries by date or search by content.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Private Reflections:</span> Secure space for personal thoughts.</li>
            <li><span className="font-medium">Categorization:</span> Tag entries for easy retrieval.</li>
            <li><span className="font-medium">Chronological View:</span> See entries organized by date.</li>
            <li><span className="font-medium">Search:</span> Find specific entries by content.</li>
          </ul>
          
          <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-amber-500" />
              Pro Tip
            </h4>
            <p>Regular journaling helps track personal growth and emotional development. Consider setting aside time each week for reflection and recording progress.</p>
          </div>
        </div>
      )
    },
    {
      id: "milestones",
      title: "Milestones",
      icon: <Archive className="h-5 w-5" />,
      description: "Track important achievements and life events",
      content: (
        <div className="space-y-4">
          <p>
            The Milestones section helps you record significant achievements, important life events, and memorable moments in your student's journey. Unlike regular records, milestones highlight special accomplishments worth celebrating.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click "Add Milestone" to create a new entry.</li>
            <li>Enter a title that captures the significance of the achievement.</li>
            <li>Provide a detailed description of the milestone.</li>
            <li>Select a category that best matches the type of achievement.</li>
            <li>Set the date when the milestone was reached.</li>
            <li>Optionally add photos or documents to commemorate the event.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Achievement Timeline:</span> Visual chronology of major accomplishments.</li>
            <li><span className="font-medium">Categorization:</span> Organize milestones by type.</li>
            <li><span className="font-medium">Media Attachments:</span> Add photos to preserve memories.</li>
            <li><span className="font-medium">Celebration Focus:</span> Highlight special moments worth remembering.</li>
          </ul>
          
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              Pro Tip
            </h4>
            <p>Milestones contribute to your child's overall growth score and provide a motivational record of progress over time. They're excellent for building confidence and recognizing achievements.</p>
          </div>
        </div>
      )
    },
    {
      id: "calendar",
      title: "Calendar",
      icon: <Calendar className="h-5 w-5" />,
      description: "Manage events, exams, and important dates",
      content: (
        <div className="space-y-4">
          <p>
            The Calendar section helps you keep track of important academic and personal events, such as exams, competitions, project deadlines, parent-teacher meetings, and more. It provides a visual timeline of scheduled activities.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click "Add Event" to create a new calendar entry.</li>
            <li>Enter a title and description for the event.</li>
            <li>Set the date, start time, and end time.</li>
            <li>Select an event category to color-code your calendar.</li>
            <li>Add location information if applicable.</li>
            <li>Set reminders for important events.</li>
            <li>Switch between month, week, and day views to manage your schedule.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Multiple Views:</span> See events in monthly, weekly, or daily format.</li>
            <li><span className="font-medium">Color Coding:</span> Differentiate between event types.</li>
            <li><span className="font-medium">Reminders:</span> Get notifications for upcoming events.</li>
            <li><span className="font-medium">Integration:</span> Events from other sections appear in the calendar.</li>
          </ul>
          
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-purple-500" />
              Pro Tip
            </h4>
            <p>Use the calendar to plan study schedules around important exams and events. The visual layout makes it easier to avoid scheduling conflicts and ensure adequate preparation time.</p>
          </div>
        </div>
      )
    },
    {
      id: "feedback",
      title: "Feedback",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Store feedback from teachers, mentors, and others",
      content: (
        <div className="space-y-4">
          <p>
            The Feedback section allows you to record and organize feedback received from teachers, mentors, coaches, or personal reflections. It helps track growth areas, strengths, and suggestions from various sources.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click "Add Feedback" to create a new feedback record.</li>
            <li>Enter a descriptive title for the feedback.</li>
            <li>Add detailed content about the feedback received.</li>
            <li>Select a category (Teacher, Mentor, Self) to organize the source.</li>
            <li>Enter the author's name who provided the feedback.</li>
            <li>Set the date when the feedback was received.</li>
            <li>Use filters and search to easily find specific feedback.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Categorization:</span> Organize by feedback source.</li>
            <li><span className="font-medium">Searchable Repository:</span> Easily find past feedback.</li>
            <li><span className="font-medium">Chronological Tracking:</span> See progression of feedback over time.</li>
            <li><span className="font-medium">Insight Source:</span> Capture different perspectives on development.</li>
          </ul>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-blue-500" />
              Pro Tip
            </h4>
            <p>Regularly review past feedback to track patterns of growth and identify consistent areas for improvement. Use these insights to set targeted goals.</p>
          </div>
        </div>
      )
    },
    {
      id: "documents",
      title: "Documents",
      icon: <FileArchive className="h-5 w-5" />,
      description: "Store important documents and files",
      content: (
        <div className="space-y-4">
          <p>
            The Documents section provides a secure storage space for important academic and personal files such as certificates, report cards, assignment submissions, project work, and other important paperwork related to your student's education.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click "Upload Document" to add new files.</li>
            <li>Select files from your device or drag and drop them.</li>
            <li>Add a title and description for easy identification.</li>
            <li>Categorize documents by type for better organization.</li>
            <li>Add tags to make documents easily searchable.</li>
            <li>Use folders to group related documents together.</li>
            <li>Download, share, or delete documents as needed.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Secure Storage:</span> Keep important documents safe and accessible.</li>
            <li><span className="font-medium">Organization:</span> Categorize and tag for easy retrieval.</li>
            <li><span className="font-medium">Preview:</span> View documents directly in the browser.</li>
            <li><span className="font-medium">Sharing:</span> Share documents securely when needed.</li>
          </ul>
          
          <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-amber-500" />
              Pro Tip
            </h4>
            <p>Create a consistent naming convention for your documents to make them easier to find. Consider including the date, subject, and document type in the filename.</p>
          </div>
        </div>
      )
    },
    {
      id: "gallery",
      title: "Gallery",
      icon: <ImageIcon className="h-5 w-5" />,
      description: "Store photos and visual memories",
      content: (
        <div className="space-y-4">
          <p>
            The Gallery section is a visual repository for photos and images related to your student's academic journey, events, achievements, and memorable moments. It creates a visual timeline of growth and experiences.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click "Upload Photos" to add new images.</li>
            <li>Select multiple images at once or add them individually.</li>
            <li>Organize photos into albums based on events or time periods.</li>
            <li>Add captions and tags to make images searchable.</li>
            <li>View images in slideshow mode or thumbnail grid.</li>
            <li>Download or share photos as needed.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Album Organization:</span> Group photos by events or themes.</li>
            <li><span className="font-medium">Tagging:</span> Add metadata for easy searching.</li>
            <li><span className="font-medium">Slideshow:</span> View images in presentation mode.</li>
            <li><span className="font-medium">Timeline View:</span> See photos organized chronologically.</li>
          </ul>
          
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              Pro Tip
            </h4>
            <p>Create albums for specific events or achievement categories to build a visual record of growth over time. Add detailed captions to preserve the context of each photo.</p>
          </div>
        </div>
      )
    },
    {
      id: "resources",
      title: "Resources",
      icon: <FileText className="h-5 w-5" />,
      description: "Access learning materials and useful links",
      content: (
        <div className="space-y-4">
          <p>
            The Resources section provides a curated collection of learning materials, useful links, study guides, reference materials, and educational content to support your student's academic journey.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click "Add Resource" to contribute new materials.</li>
            <li>Enter a title and description of the resource.</li>
            <li>Add the URL if it's an online resource.</li>
            <li>Upload files if they are documents or downloadable resources.</li>
            <li>Categorize resources by subject or purpose.</li>
            <li>Add tags to make resources easily searchable.</li>
            <li>Rate and review resources to track their usefulness.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Categorization:</span> Organize by subject or resource type.</li>
            <li><span className="font-medium">Search:</span> Find resources quickly by keyword.</li>
            <li><span className="font-medium">Ratings:</span> Mark favorite or most useful resources.</li>
            <li><span className="font-medium">External Links:</span> Connect to helpful websites and tools.</li>
          </ul>
          
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-purple-500" />
              Pro Tip
            </h4>
            <p>Organize resources by subject and grade level to create a personalized learning library that grows with your student. Regularly update and remove outdated resources.</p>
          </div>
        </div>
      )
    },
    {
      id: "directory",
      title: "Directory",
      icon: <Users className="h-5 w-5" />,
      description: "Store contact information for teachers and mentors",
      content: (
        <div className="space-y-4">
          <p>
            The Directory section helps you maintain contact information for teachers, coaches, mentors, tutors, and other important people involved in your student's education and development.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Click "Add Contact" to create a new directory entry.</li>
            <li>Enter name, role, and contact information.</li>
            <li>Include email, phone numbers, and other communication channels.</li>
            <li>Add notes about the contact's specialization or relationship.</li>
            <li>Organize contacts by category or role.</li>
            <li>Update information as needed to keep it current.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Contact Management:</span> Store all important contact information.</li>
            <li><span className="font-medium">Categorization:</span> Organize by role or relationship.</li>
            <li><span className="font-medium">Quick Access:</span> Find contact information when needed.</li>
            <li><span className="font-medium">Notes:</span> Keep additional details about each contact.</li>
          </ul>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-blue-500" />
              Pro Tip
            </h4>
            <p>Review and update contact information at the beginning of each school year or term to ensure you have the most current information for all teachers and mentors.</p>
          </div>
        </div>
      )
    },
    {
      id: "ai-insights",
      title: "AI Insights",
      icon: <Lightbulb className="h-5 w-5" />,
      description: "Get AI-powered analysis and recommendations",
      content: (
        <div className="space-y-4">
          <p>
            The AI Insights section provides intelligent analysis of your student's data across all areas, identifying patterns, strengths, areas needing attention, and personalized recommendations for growth and development.
          </p>
          
          <h4 className="font-semibold text-lg">How Growth Score is Calculated:</h4>
          <p>The Overall Growth Score is a comprehensive metric based on several factors:</p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium">Academic Performance (40%):</span> Based on average scores and improvement trends across subjects. Subjects with scores below 40% are flagged as areas needing attention.
            </li>
            <li>
              <span className="font-medium">Sports Achievements (20%):</span> Higher weightage for top positions (1st/Gold: 100%, 2nd/Silver: 80%, 3rd/Bronze: 60%, etc.)
            </li>
            <li>
              <span className="font-medium">Extracurricular Activities (20%):</span> Based on participation breadth and achievement levels.
            </li>
            <li>
              <span className="font-medium">Goals & Milestones (10%):</span> Percentage of completed goals and established milestones.
            </li>
            <li>
              <span className="font-medium">Journal Entries (10%):</span> Consistency in reflection and personal development.
            </li>
          </ul>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Strength Identification:</span> Highlights areas where your student excels.</li>
            <li><span className="font-medium">Areas Needing Attention:</span> Identifies subjects with scores below 40%.</li>
            <li><span className="font-medium">Progress Tracking:</span> Visual representation of growth over time.</li>
            <li><span className="font-medium">Personalized Recommendations:</span> AI-generated suggestions for improvement.</li>
          </ul>
          
          <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Important Note
            </h4>
            <p>AI Insights become more accurate and valuable as you add more data to the system. Regular updates across all sections provide the most comprehensive analysis.</p>
          </div>
        </div>
      )
    },
    {
      id: "profile",
      title: "Profile",
      icon: <User className="h-5 w-5" />,
      description: "Manage student information and preferences",
      content: (
        <div className="space-y-4">
          <p>
            The Profile section allows you to manage your student's basic information, preferences, and account settings. It serves as the central place for personal details that appear throughout the application.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Update your student's basic information (name, age, grade/class).</li>
            <li>Add or change profile photo.</li>
            <li>Manage school information and academic details.</li>
            <li>Update contact information and emergency contacts.</li>
            <li>Adjust notification preferences and account settings.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Personal Information:</span> Manage student details.</li>
            <li><span className="font-medium">Profile Photo:</span> Upload and update student image.</li>
            <li><span className="font-medium">Educational Details:</span> Keep school and class information current.</li>
            <li><span className="font-medium">Contact Management:</span> Update parent and emergency contact details.</li>
          </ul>
          
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              Pro Tip
            </h4>
            <p>Keep your profile information up to date, especially when transitioning to a new grade or school. The student name from your profile appears throughout the application.</p>
          </div>
        </div>
      )
    },
    {
      id: "settings",
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      description: "Customize application preferences and appearance",
      content: (
        <div className="space-y-4">
          <p>
            The Settings section allows you to customize your experience with the application, including appearance preferences, notification settings, data management options, and account security.
          </p>
          
          <h4 className="font-semibold text-lg">How to use:</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Toggle between light and dark mode for your preferred viewing experience.</li>
            <li>Adjust notification settings to control what alerts you receive.</li>
            <li>Manage data export and backup options.</li>
            <li>Update password and security settings.</li>
            <li>Configure display preferences for dashboards and reports.</li>
          </ol>
          
          <h4 className="font-semibold text-lg">Key Features:</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Theme Selection:</span> Choose between light and dark mode.</li>
            <li><span className="font-medium">Notifications:</span> Configure how and when you receive alerts.</li>
            <li><span className="font-medium">Data Management:</span> Export, backup, or download your data.</li>
            <li><span className="font-medium">Security:</span> Update passwords and account protection.</li>
          </ul>
          
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-lg flex items-center">
              <Check className="h-5 w-5 mr-2 text-purple-500" />
              Pro Tip
            </h4>
            <p>Take advantage of the data export features to create regular backups of your student's records for safekeeping or for sharing with educational institutions when needed.</p>
          </div>
        </div>
      )
    },
  ];

  return (
    <AppLayout title="Help Center" hideHeader={true}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-center">TreasureBook Help Center</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-250px)]">
                  <ul className="py-2">
                    {helpSections.map((section) => (
                      <li key={section.id}>
                        <Button
                          variant={selectedSection === section.id ? "secondary" : "ghost"}
                          className="w-full justify-start gap-3 px-3 py-2 my-1"
                          onClick={() => setSelectedSection(section.id)}
                        >
                          {section.icon}
                          <span>{section.title}</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {selectedSection 
                    ? helpSections.find(s => s.id === selectedSection)?.title 
                    : "Welcome to TreasureBook Help"}
                </CardTitle>
                <CardDescription>
                  {selectedSection 
                    ? helpSections.find(s => s.id === selectedSection)?.description 
                    : "Select a section from the menu to learn more about TreasureBook's features"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                  {selectedSection ? (
                    helpSections.find(s => s.id === selectedSection)?.content
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center p-6">
                        <BookOpen className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Welcome to TreasureBook</h3>
                        <p className="text-muted-foreground">
                          Your complete solution for tracking student growth and development
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <GraduationCap className="h-5 w-5 text-blue-500" />
                              Academic Tracking
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">
                              Track grades, subjects, and academic progress with detailed reports and insights.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Trophy className="h-5 w-5 text-amber-500" />
                              Sports & Activities
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">
                              Record sports participation, achievements, and extracurricular activities.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Target className="h-5 w-5 text-green-500" />
                              Goals & Milestones
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">
                              Set objectives, track progress, and celebrate achievements along the way.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-purple-500" />
                              AI-Powered Insights
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">
                              Get intelligent analysis and personalized recommendations for improvement.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
                        
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                            <AccordionTrigger>How is the Growth Score calculated?</AccordionTrigger>
                            <AccordionContent>
                              <p>The Growth Score is calculated using multiple factors including:</p>
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Academic performance (40%)</li>
                                <li>Sports achievements (20%)</li>
                                <li>Extracurricular activities (20%)</li>
                                <li>Goals completion (10%)</li>
                                <li>Journaling consistency (10%)</li>
                              </ul>
                              <p className="mt-2">
                                For more details, check the AI Insights section in the help menu.
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="item-2">
                            <AccordionTrigger>How do I identify areas needing improvement?</AccordionTrigger>
                            <AccordionContent>
                              <p>
                                The AI Insights page automatically identifies subjects with scores below 40% as "Areas Needing Attention." These are compiled from all academic records regardless of term or year.
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="item-3">
                            <AccordionTrigger>Can I export my data?</AccordionTrigger>
                            <AccordionContent>
                              <p>
                                Yes! You can export data from most sections of the application. Look for export options in individual sections or use the Backup & Export page to create comprehensive exports of all your data.
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="item-4">
                            <AccordionTrigger>Is my data secure?</AccordionTrigger>
                            <AccordionContent>
                              <p>
                                TreasureBook uses Firebase security to protect your data. Your information is stored securely and is only accessible to your account. We implement best practices for data security and privacy protection.
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Dialog open={openVideo} onOpenChange={setOpenVideo}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Tutorial</DialogTitle>
            <DialogDescription>
              Watch this quick overview of TreasureBook's features
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <p className="text-muted-foreground">Video tutorial placeholder</p>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default HelpPage;
