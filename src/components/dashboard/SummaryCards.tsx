
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Image, Calendar, Settings } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  className: string;
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

const SummaryCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <SummaryCard
        title="Academics"
        value="Grade A"
        description="Last assessment: Mathematics"
        icon={<Book className="h-4 w-4 text-treasure-blue" />}
        className="card-academic"
      />
      <SummaryCard
        title="Sports"
        value="3 Events"
        description="Recent: Swimming competition"
        icon={<Calendar className="h-4 w-4 text-treasure-orange" />}
        className="card-sports"
      />
      <SummaryCard
        title="Talents"
        value="5 Skills"
        description="Latest: Piano - Intermediate"
        icon={<Settings className="h-4 w-4 text-treasure-green" />}
        className="card-talents"
      />
      <SummaryCard
        title="Gallery"
        value="32 Photos"
        description="Last update: 2 days ago"
        icon={<Image className="h-4 w-4 text-gray-500" />}
        className="card-health"
      />
    </div>
  );
};

export default SummaryCards;
