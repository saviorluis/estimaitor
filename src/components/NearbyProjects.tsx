import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  type: string;
  address: string;
  distance: number;
  completionDate: string;
  imageUrl: string;
}

const NearbyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          fetchNearbyProjects(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Load sample data if location access is denied
          loadSampleProjects();
          setLoading(false);
        }
      );
    } else {
      // Geolocation not supported
      loadSampleProjects();
      setLoading(false);
    }
  }, []);

  const fetchNearbyProjects = async (lat: number, lng: number) => {
    // In a real app, this would be an API call to fetch nearby projects
    // For now, we'll simulate with sample data
    loadSampleProjects();
    setLoading(false);
  };

  const loadSampleProjects = () => {
    // Sample data for demonstration
    const sampleProjects: Project[] = [
      {
        id: '1',
        name: 'Downtown Office Complex',
        type: 'Office Space',
        address: '123 Business Ave, Charlotte, NC',
        distance: 2.3,
        completionDate: '2023-03-15',
        imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      },
      {
        id: '2',
        name: 'Riverside Medical Center',
        type: 'Medical Facility',
        address: '456 Health Blvd, Raleigh, NC',
        distance: 3.7,
        completionDate: '2023-04-10',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      },
      {
        id: '3',
        name: 'Gourmet Restaurant & Bar',
        type: 'Restaurant',
        address: '789 Culinary St, Atlanta, GA',
        distance: 5.1,
        completionDate: '2023-02-28',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      },
      {
        id: '4',
        name: 'Luxury Jewelry Boutique',
        type: 'Jewelry Store',
        address: '101 Diamond Rd, Charleston, SC',
        distance: 4.8,
        completionDate: '2023-05-05',
        imageUrl: 'https://images.unsplash.com/photo-1465014925804-7b9ede58d0d7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      }
    ];
    
    setProjects(sampleProjects);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-6">Nearby Projects</h2>
      
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