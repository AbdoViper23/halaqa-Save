import { GoogleGenerativeAI } from '@google/generative-ai';

interface AvailableGroup {
  id: string;
  name: string;
  description: string;
  monthly_amount: number;
  duration_months: number;
  total_members: number;
  current_members: number;
  available_slots: number[];
  status: { Pending: null } | { Active: null } | { Full: null } | { Completed: null } | { Cancelled: null };
  payout_order: { Auto: null } | { Manual: null };
  created_at: bigint;
  created_by: string;
  current_cycle: number;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isConfigured = false;

  constructor() {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        console.error('❌ Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file');
        throw new Error('Gemini API key not configured');
      }
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      this.isConfigured = true;
      console.log('✅ Gemini API configured successfully');
    } catch (error) {
      console.error('❌ Gemini API configuration failed:', error);
      throw error;
    }
  }

  private formatGroupsForAI(groups: AvailableGroup[]): string {
    return groups.map(group => {
      const availableSlotsCount = group.available_slots.length;
      const payoutType = 'Manual' in group.payout_order ? 'Manual slot selection' : 'Auto assignment';
      const status = Object.keys(group.status)[0];
      
      return `
Group: "${group.name}"
- Description: ${group.description}
- Monthly Amount: $${group.monthly_amount}
- Duration: ${group.duration_months} months
- Available Spots: ${availableSlotsCount}/${group.total_members}
- Payout Method: ${payoutType}
- Status: ${status}
- Total Investment: $${group.monthly_amount * group.duration_months}
- Monthly Pool: $${group.monthly_amount * group.total_members}`;
    }).join('\n\n');
  }

  async getSavingsRecommendation(
    userMessage: string, 
    availableGroups: AvailableGroup[]
  ): Promise<string> {
    if (!this.isConfigured || !this.model) {
      throw new Error('Gemini API not configured');
    }

    try {
      const groupsData = this.formatGroupsForAI(availableGroups);
      
      const prompt = `
You are a professional savings advisor for Halaqa Save, a platform for monthly savings groups (rotating savings and credit associations).

IMPORTANT: Ask follow-up questions to better understand the user's needs before recommending groups.

Available Savings Groups:
${groupsData}

How the System Works:
- Members join a group and contribute monthly
- Each month, one member receives the entire pool
- Manual groups: you choose your payout month
- Auto groups: system assigns you a random month
- You pay monthly_amount × duration_months total
- You receive monthly_amount × total_members when it's your turn

User's Message: "${userMessage}"

Guidelines for your response:
1. If this is their first message or they're asking generally, ask clarifying questions:
   - What's your savings goal? (car, house, emergency fund, etc.)
   - What's your comfortable monthly budget?
   - When do you need the money?
   - Do you prefer to choose your payout month or is auto-assignment okay?

2. If they've provided specific details, recommend the most suitable group(s) and explain why.

3. Always be conversational, helpful, and ask relevant follow-up questions.

4. Keep responses to 2-4 sentences maximum.

5. If recommending a group, mention the key details (monthly amount, duration, payout method).

Response:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Sorry, I\'m having trouble connecting right now. Please try again in a moment.');
    }
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }
}

export const geminiService = new GeminiService();
