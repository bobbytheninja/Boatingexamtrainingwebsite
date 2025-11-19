import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91`;

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Use provided token or default to public anon key
  headers['Authorization'] = `Bearer ${token || publicAnonKey}`;

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API call failed with status ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      console.error('[API] Request failed:', {
        url,
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
      });
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    // Network error or other issue
    if (error.message.includes('API call failed')) {
      // Already handled above
      throw error;
    }
    
    console.error('[API] Network error:', {
      url,
      error: error.message,
    });
    
    throw new Error(`Network error: ${error.message}. Make sure backend is deployed.`);
  }
}

export const api = {
  // Payment endpoints
  createCheckoutSession: async (examTypes: string[], token: string) => {
    return apiCall<{ sessionId: string; url: string }>(
      '/create-checkout-session',
      {
        method: 'POST',
        body: JSON.stringify({ examTypes }),
      },
      token
    );
  },

  verifyPayment: async (sessionId: string, token: string) => {
    return apiCall<{ success: boolean; examTypes: string[] }>(
      `/verify-payment/${sessionId}`,
      { method: 'GET' },
      token
    );
  },

  // Question endpoints
  getQuestions: async (examType: string, token: string) => {
    return apiCall<{ questions: any[] }>(
      `/questions/${examType}`,
      { method: 'GET' },
      token
    );
  },

  getMockQuestions: async (examType: string) => {
    return apiCall<{ questions: any[] }>(
      `/questions/${examType}/mock`,
      { method: 'GET' }
    );
  },

  getQuestionCount: async (examType: string) => {
    return apiCall<{ count: number; examType: string }>(
      `/questions/${examType}/count`,
      { method: 'GET' }
    );
  },

  importQuestions: async (questions: any[], adminKey: string) => {
    return apiCall<{ message: string; count: number }>(
      '/questions/import',
      {
        method: 'POST',
        body: JSON.stringify({ questions, adminKey }),
      }
    );
  },

  // Subscription endpoints
  getSubscriptions: async (token: string) => {
    return apiCall<{ subscriptions: string[] }>(
      '/subscriptions',
      { method: 'GET' },
      token
    );
  },

  addSubscription: async (examTypes: string[], token: string) => {
    return apiCall<{ message: string; subscriptions: string[]; expiresAt: number }>(
      '/subscriptions',
      {
        method: 'POST',
        body: JSON.stringify({ examTypes }),
      },
      token
    );
  },
};
