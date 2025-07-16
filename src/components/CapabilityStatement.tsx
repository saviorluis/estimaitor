import React from 'react';
import { FormData } from '@/lib/types';

interface CapabilityStatementProps {
  formData: FormData;
}

const FAST_FOOD_PROJECTS = {
  images: [
    { src: '/images/projects/wendys-concord.jpg', alt: 'Wendys, Concord NC' },
    { src: '/images/projects/caribou-burlington.jpg', alt: 'Caribou Coffee, Burlington NC' }
  ],
  experience: [
    {
      gc: 'Willoughby Construction & Consulting',
      contractValue: 7089.00,
      projectName: 'Biscuitville, Anderson SC',
      description: 'Final Cleaning of new Biscuitville Buildout, included interior/exterior work'
    },
    {
      gc: 'Vortex Construction',
      contractValue: 1811.00,
      projectName: 'Wayback Burgers, Waxhaw NC',
      description: 'Final Cleaning of new restaurant tenant upfit included; hi lo dusting, sweep, mop, scrub floor, wipe down back of house, bathrooms and windows'
    }
  ]
};

const MEDICAL_PROJECTS = {
  images: [
    { src: '/images/projects/medical-facility-1.jpg', alt: 'Medical Facility Interior' },
    { src: '/images/projects/medical-facility-2.jpg', alt: 'Medical Equipment Room' }
  ],
  experience: [
    {
      gc: 'Creative Structures, Inc.',
      contractValue: 3900.00,
      projectName: 'Fast Pace Urgent Care, Elkin NC',
      description: 'Ground Up Build of Urgent Care, included Interior/Exterior Cleaning'
    }
  ]
};

const RETAIL_PROJECTS = {
  images: [
    { src: '/images/projects/retail-store-1.jpg', alt: 'Retail Store Interior' },
    { src: '/images/projects/retail-store-2.jpg', alt: 'Retail Equipment Room' }
  ],
  experience: [
    {
      gc: 'Pinnacle Construction',
      contractValue: 3981.00,
      projectName: 'Chicos, Charlotte NC',
      description: 'Final Cleaning of Chicos Retail Store'
    },
    {
      gc: 'Graycor Construction Co',
      contractValue: 11225.00,
      projectName: 'South Park Mall Cleanings, Charlotte NC',
      description: 'Zara cold shell cleaning included stairwell, various other store cleanings, pressure washing walls & +20,000 sq ft roof of facility, also dumpster corral of nearby Cheesecake Factory'
    }
  ]
};

const LARGE_PROJECTS = {
  images: [
    { src: '/images/projects/large-facility-1.jpg', alt: 'Large Facility Interior' },
    { src: '/images/projects/large-facility-2.jpg', alt: 'Large Equipment Room' }
  ],
  experience: [
    {
      gc: 'Bar Construction Company Inc.',
      contractValue: 7089.00,
      projectName: 'City Light Church- High Point NC',
      description: 'Final Cleaning of 25,941 sq. ft. Church Upfit'
    },
    {
      gc: 'Eckinger Construction',
      contractValue: 9900.00,
      projectName: 'Dave & Busters Remodel- Columbia SC',
      description: 'Remodel of Dining Area, arcade area, and Parts of Lounge, Needed Carpet Cleaning/Cutting as well'
    }
  ]
};

const CapabilityStatement: React.FC<CapabilityStatementProps> = ({ formData }) => {
  const getRelevantProjects = () => {
    // If square footage is over 5000 and not a specific type, show large projects
    if (formData.squareFootage > 5000 && 
        !['restaurant', 'fast_food', 'medical', 'retail'].includes(formData.projectType)) {
      return LARGE_PROJECTS;
    }

    // Otherwise determine by project type
    switch (formData.projectType) {
      case 'restaurant':
      case 'fast_food':
        return FAST_FOOD_PROJECTS;
      case 'medical':
        return MEDICAL_PROJECTS;
      case 'retail':
        return RETAIL_PROJECTS;
      default:
        return LARGE_PROJECTS;
    }
  };

  const projects = getRelevantProjects();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          BBPS Relevant Experience
        </h2>
        <div className="text-gray-600 dark:text-gray-300">
          <p className="mb-4">
            BBPS is a Latino owned and operated commercial cleaning company, proudly serving the Southeast since 2023. 
            Known for our reliability and expertise, We deliver safe, efficient cleaning solutions across residential, 
            commercial, and industrial projects. Even in challenging environments like medical/healthcare centers, tight 
            urban spaces, and environmentally sensitive areas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {projects.images.map((image, index) => (
          <div key={index} className="relative h-48 rounded-lg overflow-hidden">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {projects.experience.map((project, index) => (
          <div key={index} className="border-t dark:border-gray-700 pt-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {project.gc}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {project.projectName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-900 dark:text-white font-semibold">
                  ${project.contractValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {project.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">NAICS CODE:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400">
              <li>561790 - Exterior Cleaning</li>
              <li>561720 - Janitorial Services</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AREAS SERVICED:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              North Carolina, South Carolina, Virginia, Parts of TN & GA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapabilityStatement; 