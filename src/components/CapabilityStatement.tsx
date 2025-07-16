import React from 'react';
import { FormData } from '@/lib/types';
import Image from 'next/image';

interface ProjectExperience {
  gc: string;
  contractValue: number;
  projectName: string;
  description: string;
  logo?: string;
}

interface ProjectCategory {
  images: Array<{
    src: string;
    alt: string;
  }>;
  experience: ProjectExperience[];
}

const FAST_FOOD_PROJECTS: ProjectCategory = {
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

const MEDICAL_PROJECTS: ProjectCategory = {
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

const RETAIL_PROJECTS: ProjectCategory = {
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

const LARGE_PROJECTS: ProjectCategory = {
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

interface CapabilityStatementProps {
  formData: FormData;
}

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
    <div className="bg-white dark:bg-gray-800 w-[8.5in] h-[11in] mx-auto shadow-lg">
      <div className="h-full flex flex-col p-6">
        {/* Header with Logo and Company Name */}
        <div className="flex items-center gap-4 border-b border-gray-300 pb-4 mb-4">
          <div className="w-20 h-20">
            <Image
              src="/assets/logo.png"
              alt="BBPS Logo"
              width={80}
              height={80}
              className="w-full h-auto"
            />
          </div>
          <h1 className="text-3xl font-bold">
            Big Brother<br />
            Property Solutions
          </h1>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="col-span-3 flex flex-col">
            {/* Company History */}
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">COMPANY HISTORY</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                BBPS is a Latino owned and operated commercial cleaning company, proudly serving the Southeast since 2023. 
                Known for our reliability and expertise, We deliver safe, efficient cleaning solutions across residential, 
                commercial, and industrial projects. Even in challenging environments like medical/healthcare centers, tight 
                urban spaces, and environmentally sensitive areas.
              </p>
            </div>

            {/* Core Services */}
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">CORE SERVICES OFFERED</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <ul className="list-disc list-inside">
                  <li>Post Construction Cleanup</li>
                  <li>Exterior Cleaning</li>
                  <li>Window cleaning</li>
                </ul>
                <ul className="list-disc list-inside">
                  <li>VCT Stripping & Waxing</li>
                  <li>Carpet Cleaning</li>
                </ul>
              </div>
            </div>

            {/* Project Images */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {projects.images.map((image, index) => (
                <div key={index} className="relative h-40 rounded overflow-hidden border border-gray-300">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs">
                    {image.alt}
                  </div>
                </div>
              ))}
            </div>

            {/* Experience Section */}
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">EXPERIENCE</h2>
              <div className="space-y-4">
                {projects.experience.map((project, index) => (
                  <div key={index} className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">GC: {project.gc}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Contract Value: ${project.contractValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="font-medium text-sm">Project Name: {project.projectName}</p>
                        <p className="text-xs mt-1">Description on Work:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{project.description}</p>
                      </div>
                      {project.logo && (
                        <div className="w-24 flex-shrink-0 ml-4">
                          <img src={project.logo} alt={`${project.gc} logo`} className="w-full h-auto" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 bg-blue-700 text-white p-4 rounded">
            <div className="mb-6">
              <h3 className="font-bold mb-2 text-sm">CONTACT:</h3>
              <div className="text-xs space-y-1">
                <p>Luis Velasco- Field Manager</p>
                <p>1200 Eastchester Dr, High Point, NC 27265</p>
                <p>T: (336) 624-7442</p>
                <p>E: luis@bigbropros.com</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2 text-sm">NAICS CODE:</h3>
              <ul className="list-disc list-inside text-xs">
                <li>561790 - Exterior Cleaning</li>
                <li>561720 - Janitorial Services</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2 text-sm">AREAS SERVICED:</h3>
              <p className="text-xs">North Carolina, South Carolina, Virginia, Parts of TN & GA</p>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-sm">KEY DIFFERENTIATORS:</h3>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>Hours are flexible schedule-wise</li>
                <li>Professional, strong communication</li>
                <li>Spotless clean-up, quick and safe</li>
                <li>Staffed fully trained</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Associations Footer */}
        <div className="mt-4 pt-4 border-t border-gray-300">
          <h3 className="font-bold mb-2 text-sm">ASSOCIATIONS:</h3>
          <div className="flex gap-4 items-center">
            <img src="/assets/bni-logo.png" alt="BNI" className="h-6" />
            <img src="/assets/greensboro-chamber.png" alt="Greensboro Chamber of Commerce" className="h-6" />
            <img src="/assets/greater-winston-salem.png" alt="Greater Winston-Salem" className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapabilityStatement; 