import { useState } from 'react';

interface FormState {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
}

const ContactForm = () => {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to submit the form
      // For now, we'll simulate a successful submission after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form and show success message
      setFormState({
        name: '',
        email: '',
        phone: '',
        projectType: '',
        message: ''
      });
      setIsSubmitted(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err) {
      setError('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-6">Contact Us</h2>
      
      {isSubmitted ? (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
          <p className="text-green-800 dark:text-green-200 font-medium">
            Thank you for reaching out! We'll get back to you within 24 hours.
          </p>
        </div>
      ) : null}
      
      {error ? (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
        </div>
      ) : null}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formState.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            placeholder="Your name"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="your.email@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formState.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="(123) 456-7890"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Type
          </label>
          <select
            id="projectType"
            name="projectType"
            value={formState.projectType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="">Select a project type</option>
            <option value="restaurant">Restaurant</option>
            <option value="fast_food">Fast Food Restaurant</option>
            <option value="medical">Medical Facility</option>
            <option value="office">Office Space</option>
            <option value="retail">Retail Space</option>
            <option value="industrial">Industrial Space</option>
            <option value="educational">Educational Facility</option>
            <option value="hotel">Hotel</option>
            <option value="jewelry_store">Jewelry Store</option>
            <option value="apartment">Apartment Complex</option>
            <option value="warehouse">Warehouse</option>
            <option value="dormitory">Dormitory</option>
            <option value="grocery_store">Grocery Store</option>
            <option value="yoga_studio">Yoga Studio</option>
            <option value="kids_fitness">Children's Fitness Center</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formState.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
            placeholder="Tell us about your project and how we can help..."
          ></textarea>
        </div>
        
        <div className="flex items-center">
          <input
            id="consent"
            type="checkbox"
            required
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="consent" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            I agree to be contacted about my inquiry
          </label>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-medium py-3 px-4 rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Other Ways to Reach Us</h3>
        <div className="space-y-2">
          <p className="flex items-center text-gray-600 dark:text-gray-300">
            <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            (555) 123-4567
          </p>
          <p className="flex items-center text-gray-600 dark:text-gray-300">
            <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            bids@bigbroprops.com
          </p>
          <p className="flex items-center text-gray-600 dark:text-gray-300">
            <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            123 Cleaning Ave, Suite 100, Charlotte, NC 28202
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactForm; 