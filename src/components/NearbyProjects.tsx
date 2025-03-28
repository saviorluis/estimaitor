import React, { useState, useEffect } from 'react';

// Define the project interface
interface Project {
  id: number;
  name: string;
  type: string;
  address: string;
  distance: number;
  completionDate: string;
  imageUrl: string;
}

const NearbyProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // Get user's location if browser supports it
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserCoords({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
              
              // Get fake project data regardless of location
              setProjects(getFakeProjects());
              setLoading(false);
            },
            (error) => {
              console.error("Error getting location:", error);
              // Still load projects even if location is denied
              setLocationError("Location access denied. Showing general projects instead.");
              setProjects(getFakeProjects());
              setLoading(false);
            },
            { timeout: 10000 }
          );
        } else {
          // Browser doesn't support geolocation
          setLocationError("Your browser doesn't support geolocation. Showing general projects instead.");
          setProjects(getFakeProjects());
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects(getFakeProjects());
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const getFakeProjects = (): Project[] => {
    // Sample data for demonstration
    return [
      {
        id: 1,
        name: "Downtown Office Building",
        type: "Office Space",
        address: "123 Business Ave, Charlotte, NC",
        distance: 2.3,
        completionDate: "2023-05-15",
        imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=500"
      },
      {
        id: 2,
        name: "Green Valley Medical Center",
        type: "Healthcare Facility",
        address: "456 Health Dr, Raleigh, NC",
        distance: 3.1,
        completionDate: "2023-04-22",
        imageUrl: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=500"
      },
      {
        id: 3,
        name: "Riverside Restaurant",
        type: "Restaurant",
        address: "789 River Rd, Charleston, SC",
        distance: 4.5,
        completionDate: "2023-06-03",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500"
      },
      {
        id: 4,
        name: "Tech Park Building C",
        type: "Office Space",
        address: "101 Innovation Way, Atlanta, GA",
        distance: 5.8,
        completionDate: "2023-05-30",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500"
      }
    ];
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-6">Nearby Projects</h2>
      
      {locationError && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded text-sm text-yellow-800 dark:text-yellow-300">
          {locationError}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-6 bg-gray-200 dark:bg-slate-700 rounded-lg h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Interactive map would be displayed here
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(project => (
              <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
                <div className="h-40 overflow-hidden">
                  <img 
                    src={project.imageUrl} 
                    alt={project.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">{project.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{project.type}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{project.address}</p>
                  <div className="mt-auto flex justify-between items-center text-xs">
                    <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">
                      {project.distance} miles away
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Completed: {new Date(project.completionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              View All Projects
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NearbyProjects; 