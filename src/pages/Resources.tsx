
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from "@/components/navigation/Sidebar";
import { List, Link, Star, Trash2, ExternalLink } from "lucide-react";
import { ResourceForm } from "@/components/resources/ResourceForm";
import { Resource, fetchResources, toggleResourceFavorite, deleteResource } from "@/lib/resource-service";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch resources from Firebase
  const fetchUserResources = async (userId: string) => {
    try {
      setLoading(true);
      const fetchedResources = await fetchResources(userId);
      setResources(fetchedResources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load resources"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        fetchUserResources(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleResourceAdded = (newResource: Resource) => {
    setResources([...resources, newResource]);
  };

  const handleToggleFavorite = async (resource: Resource) => {
    const success = await toggleResourceFavorite(resource);
    if (success) {
      setResources(resources.map(r => 
        r.id === resource.id ? { ...r, isFavorite: !r.isFavorite } : r
      ));
      
      toast({
        title: resource.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `"${resource.title}" has been ${resource.isFavorite ? "removed from" : "added to"} favorites`,
      });
    }
  };

  const handleDeleteResource = async (resource: Resource) => {
    const success = await deleteResource(resource.id);
    if (success) {
      setResources(resources.filter(r => r.id !== resource.id));
      
      toast({
        title: "Resource deleted",
        description: `"${resource.title}" has been removed`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete resource",
      });
    }
  };

  // Extract unique categories
  const categories = ["all", ...Array.from(new Set(resources.map(r => r.category)))];

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === "" || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === "all" || resource.category === activeCategory;
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "favorites" && resource.isFavorite);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const openResourceLink = (url: string) => {
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      fullUrl = 'https://' + url;
    }
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isMobile={isMobile} />

      <div className="flex-1 overflow-auto">
        {isMobile && (
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b shadow-sm z-10">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
              >
                <List className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-bold text-treasure-blue dark:text-blue-400">
                TreasureBook
              </h1>
              <div className="w-6"></div>
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold dark:text-white">Learning Resources</h1>
            <div className="flex items-center space-x-2">
              <ResourceForm onResourceAdded={handleResourceAdded} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">My Resources</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Organize and access your learning materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search resources..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <Select value={activeCategory} onValueChange={setActiveCategory}>
                      <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="capitalize">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Resources</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    {loading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                      </div>
                    ) : filteredResources.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResources.map((resource) => (
                          <Card key={resource.id} className="dark:bg-gray-700">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg dark:text-white">{resource.title}</CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-yellow-500 dark:text-yellow-400"
                                  onClick={() => handleToggleFavorite(resource)}
                                >
                                  <Star className={`h-5 w-5 ${resource.isFavorite ? 'fill-current' : ''}`} />
                                </Button>
                              </div>
                              <CardDescription className="dark:text-gray-300">
                                {resource.category}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-sm dark:text-gray-300 line-clamp-2">
                                {resource.description || "No description provided"}
                              </p>
                              {resource.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {resource.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="dark:bg-gray-600 dark:text-white">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="flex justify-between pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="dark:bg-gray-600 dark:text-white"
                                onClick={() => openResourceLink(resource.link)}
                              >
                                <Link className="h-4 w-4 mr-2" />
                                Open
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteResource(resource)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No resources found.</p>
                        {(searchTerm || activeCategory !== "all") && (
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchTerm("");
                              setActiveCategory("all");
                            }}
                            className="mt-2"
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="favorites" className="mt-0">
                    {loading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                      </div>
                    ) : filteredResources.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResources.map((resource) => (
                          <Card key={resource.id} className="dark:bg-gray-700">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg dark:text-white">{resource.title}</CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-yellow-500 dark:text-yellow-400"
                                  onClick={() => handleToggleFavorite(resource)}
                                >
                                  <Star className="h-5 w-5 fill-current" />
                                </Button>
                              </div>
                              <CardDescription className="dark:text-gray-300">
                                {resource.category}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-sm dark:text-gray-300 line-clamp-2">
                                {resource.description || "No description provided"}
                              </p>
                              {resource.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {resource.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="dark:bg-gray-600 dark:text-white">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="flex justify-between pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="dark:bg-gray-600 dark:text-white"
                                onClick={() => openResourceLink(resource.link)}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteResource(resource)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No favorite resources found.</p>
                        {(searchTerm || activeCategory !== "all") && (
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchTerm("");
                              setActiveCategory("all");
                            }}
                            className="mt-2"
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Resources;
