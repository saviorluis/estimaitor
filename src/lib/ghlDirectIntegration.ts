/**
 * GoHighLevel Direct Integration
 * Sends estimates and quotes directly through GHL without Resend
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

interface GHLTask {
  title: string;
  body: string;
  dueDate: string;
  contactId: string;
  assignedTo: string;
}

export class GHLDirectIntegration {
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

  // Create task in GHL (for follow-up)
  async createTask(taskData: GHLTask): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          ...taskData,
          locationId: this.locationId
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to create task' };
      }

      return { success: true, taskId: result.task.id };
    } catch (error) {
      console.error('GHL task creation error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Send estimate data to GHL (main integration function)
  async sendEstimateToGHL(formData: any, estimateData: any): Promise<{ success: boolean; error?: string; contactId?: string; opportunityId?: string }> {
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
          'Estimated Hours': estimateData.estimatedHours,
          'Location': formData.location || 'Not specified',
          'Urgency Level': formData.urgencyLevel || 1
        }
      });

      if (!contactResult.success) {
        return { success: false, error: contactResult.error };
      }

      // Create opportunity
      const opportunityResult = await this.createOpportunity({
        title: `${formData.projectType} Cleaning Project - $${estimateData.totalPrice.toLocaleString()}`,
        value: estimateData.totalPrice,
        contactId: contactResult.contactId!,
        pipelineId: process.env.GHL_PIPELINE_ID || 'default-pipeline',
        stageId: process.env.GHL_STAGE_ID || 'default-stage',
        customFields: {
          'Project Name': formData.projectName || 'Cleaning Project',
          'Quote Number': `EST-${Date.now()}`,
          'Needs Pressure Washing': formData.needsPressureWashing || false,
          'Needs Window Cleaning': formData.needsWindowCleaning || false,
          'Has VCT': formData.hasVCT || false,
          'VCT Square Footage': formData.vctSquareFootage || 0,
          'Distance from Office': formData.distanceFromOffice || 0,
          'Number of Cleaners': formData.numberOfCleaners || 2
        }
      });

      if (!opportunityResult.success) {
        return { 
          success: false, 
          error: opportunityResult.error,
          contactId: contactResult.contactId 
        };
      }

      // Create follow-up task
      await this.createTask({
        title: `Follow up on ${formData.projectType} estimate - $${estimateData.totalPrice.toLocaleString()}`,
        body: `Client: ${formData.clientName}\nProject: ${formData.projectType}\nEstimated Price: $${estimateData.totalPrice.toLocaleString()}\nEstimated Hours: ${estimateData.estimatedHours}\n\nNext Steps:\n1. Call client within 24 hours\n2. Schedule site visit if needed\n3. Send detailed proposal`,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        contactId: contactResult.contactId!,
        assignedTo: process.env.GHL_ASSIGNED_USER_ID || 'default-user'
      });

      return { 
        success: true, 
        contactId: contactResult.contactId,
        opportunityId: opportunityResult.opportunityId
      };

    } catch (error) {
      console.error('GHL integration error:', error);
      return { success: false, error: 'Integration failed' };
    }
  }

  // Send SMS notification (if you have GHL SMS enabled)
  async sendSMSNotification(contactId: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          contactId,
          message,
          type: 'sms',
          locationId: this.locationId
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to send SMS' };
      }

      return { success: true };
    } catch (error) {
      console.error('GHL SMS error:', error);
      return { success: false, error: 'SMS failed' };
    }
  }
}

// Export singleton instance
export const ghlDirectIntegration = new GHLDirectIntegration(
  process.env.GHL_API_KEY || '',
  process.env.GHL_LOCATION_ID || ''
);
