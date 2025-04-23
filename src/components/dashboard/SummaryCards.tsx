
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Image, Calendar, Award } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  className: string;
}

interface SummaryCardsProps {
  academics: {
    grade: string;
    lastAssessment: string;
  };
  sports: {
    events: number;
    recent: string;
  };
  talents: {
    count: number;
    latest: string;
  };
  gallery: {
    count: number;
    lastUpdate: string;
  };
}

const SummaryCard = ({ title, value, description, icon, className }: SummaryCardProps) => (
  <Card className={`border-l-4 ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const SummaryCards = ({ academics, sports, talents, gallery }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <SummaryCard
        title="Academics"
        value={academics.grade}
        description={`Last assessment: ${academics.lastAssessment}`}
        icon={<Book className="h-4 w-4 text-treasure-blue" />}
        className="border-blue-500"
      />
      <SummaryCard
        title="Sports"
        value={`${sports.events} Events`}
        description={`Recent: ${sports.recent}`}
        icon={<Calendar className="h-4 w-4 text-treasure-orange" />}
        className="border-orange-500"
      />
      <SummaryCard
        title="Talents"
        value={`${talents.count} Skills`}
        description={`Latest: ${talents.latest}`}
        icon={<Award className="h-4 w-4 text-treasure-green" />}
        className="border-green-500"
      />
      <SummaryCard
        title="Gallery"
        value={`${gallery.count} Photos`}
        description={`Last update: ${gallery.lastUpdate}`}
        icon={<Image className="h-4 w-4 text-gray-500" />}
        className="border-gray-500"
      />
    </div>
  );
};

export default SummaryCards;
