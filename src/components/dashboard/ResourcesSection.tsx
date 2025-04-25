
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { useResources } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Link } from "lucide-react";

export const ResourcesSection = () => {
  const { currentUser } = useAuth();
  const { data: resources, loading } = useResources(currentUser?.uid);

  const favoriteResources = React.useMemo(() => {
    return resources.filter(resource => resource.isFavorite);
  }, [resources]);

  if (loading) {
    return (
      <DashboardCard title="Learning Resources">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Learning Resources">
      <div className="space-y-4">
        {favoriteResources.slice(0, 2).map((resource) => (
          <div key={resource.id} className="flex">
            <div className="flex-shrink-0 mr-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </div>
            </div>
            <div className="flex-1">
              <a 
                href={resource.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline flex items-center"
              >
                {resource.title}
                <Link className="h-3 w-3 ml-1 text-muted-foreground" />
              </a>
              <p className="text-xs text-muted-foreground">
                For {resource.category}
              </p>
            </div>
          </div>
        ))}

        {favoriteResources.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No favorite resources yet
          </div>
        )}
      </div>
    </DashboardCard>
  );
};
