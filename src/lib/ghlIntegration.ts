/**
 * GoHighLevel API Integration
 * Sends data from your estimator directly to GHL
 */

interface GHLContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  tags: string[];
  customFields: Record<string, any>;
}

interface GHLOpportunity {
  title: string;
  value: number;
  contactId: string;
  pipelineId: string;
  stageId: string;
  customFields: Record<string, any>;
}

export class GHLIntegration {
  private apiKey: string;
  private locationId: string;
  private baseUrl: string;

  constructor(apiKey: string, locationId: string) {
    this.apiKey = apiKey;
    this.locationId = locationId;
    this.baseUrl = 'https://services.leadconnectorhq.com';
  }

  // Create contact in GHL
  async createContact(contactData: GHLContact): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          ...contactData,
          locationId: this.locationId
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to create contact' };
      }

      return { success: true, contactId: result.contact.id };
    } catch (error) {
      console.error('GHL contact creation error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Create opportunity in GHL
  async createOpportunity(opportunityData: GHLOpportunity): Promise<{ success: boolean; opportunityId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/opportunities/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          ...opportunityData,
          locationId: this.locationId
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to create opportunity' };
      }

      return { success: true, opportunityId: result.opportunity.id };
    } catch (error) {
      console.error('GHL opportunity creation error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Send estimate data to GHL
  async sendEstimateToGHL(formData: any, estimateData: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Create contact first
      const contactResult = await this.createContact({
        firstName: formData.clientName?.split(' ')[0] || 'Unknown',
        lastName: formData.clientName?.split(' ').slice(1).join(' ') || 'Client',
        email: formData.clientEmail || 'no-email@example.com',
        phone: formData.clientPhone || '',
        source: 'EstimAItor Website',
        tags: ['Cleaning Estimate', formData.projectType, 'Home Renovation'],
        customFields: {
          'Project Type': formData.projectType,
          'Square Footage': formData.squareFootage,
          'Cleaning Type': formData.cleaningType,
          'Estimated Price': estimateData.totalPrice,
          'Estimated Hours': estimateData.estimatedHours
        }
      });

      if (!contactResult.success) {
        return { success: false, error: contactResult.error };
      }

      // Create opportunity
      const opportunityResult = await this.createOpportunity({
        title: `${formData.projectType} Cleaning Project - $${estimateData.totalPrice}`,
        value: estimateData.totalPrice,
        contactId: contactResult.contactId!,
        pipelineId: 'your-pipeline-id', // You'll need to get this from GHL
        stageId: 'your-stage-id', // You'll need to get this from GHL
        customFields: {
          'Project Name': formData.projectName || 'Cleaning Project',
          'Location': formData.location || 'Not specified',
          'Urgency Level': formData.urgencyLevel || 1,
          'Needs Pressure Washing': formData.needsPressureWashing || false,
          'Needs Window Cleaning': formData.needsWindowCleaning || false
        }
      });

      return opportunityResult;
    } catch (error) {
      console.error('GHL integration error:', error);
      return { success: false, error: 'Integration failed' };
    }
  }
}

// Export singleton instance
export const ghlIntegration = new GHLIntegration(
  process.env.GHL_API_KEY || '',
  process.env.GHL_LOCATION_ID || ''
);
