import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_KEY = process.env.GOOGLE_GEMINI_API_KEY || '';

async function callGemini(prompt) {
  if (!GEMINI_KEY) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_KEY}`;
    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const res = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000,
    });

    // Response format may vary; try to extract text safely
    if (res?.data) {
      // Newer APIs sometimes return `candidates` or `output` fields
      const text = JSON.stringify(res.data);
      return text;
    }

    return null;
  } catch (err) {
    console.error('callGemini error:', err.message || err);
    return null;
  }
}

/**
 * Aggregate disaster requests and prioritize by urgency using Gemini AI
 */
export async function aggregateDisasterRequests(requests) {
  if (!requests || requests.length === 0) {
    return {
      aggregated: [],
      summary: 'No open requests'
    };
  }

  try {
    // Format requests for AI analysis
    const requestsText = requests
      .map((req, idx) => `
        Request ${idx + 1}:
        - Location: (${req.latitude}, ${req.longitude})
        - Type: ${req.type || 'unknown'}
        - Description: ${req.description || 'no description'}
        - People affected: ${req.peopleAffected || 1}
        - Injuries: ${req.injuryLevel || 'none'}
        - Accessibility: ${req.accessibility || 'unknown'}
        - Timestamp: ${req.createdAt || 'unknown'}
      `)
      .join('\n');

    const prompt = `You are an emergency coordination AI. Analyze these disaster requests and provide urgent prioritization.

${requestsText}

For each request:
1. Assign urgency score (1-10, where 10 is most urgent)
2. Classify as: CRITICAL, HIGH, MEDIUM, LOW
3. Suggest required resources (ambulance, rescue team, food, water, shelter)
4. Group nearby requests that can be served together

Respond in JSON format:
{
  "aggregated": [
    {
      "requestIds": [indices],
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "urgencyScore": number,
      "combinedDescription": "string",
      "centroidLocation": {"lat": number, "lng": number},
      "requiredResources": ["resource1", "resource2"],
      "estimatedVictimsCount": number,
      "recommendedAction": "string"
    }
  ],
  "summary": "string"
}`;

    const responseText = await callGemini(prompt);
    if (responseText) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
      // If the response isn't JSON, return a textual summary
      return { aggregated: [], summary: responseText };
    }

    return { aggregated: [], summary: 'Gemini unavailable; no response' };
  } catch (error) {
    console.error('Error in Gemini aggregation:', error);
    // Fallback: simple urgency sorting
    return {
      aggregated: requests.map((req, idx) => ({
        requestIds: [idx],
        priority: calculateFallbackPriority(req),
        urgencyScore: calculateFallbackUrgency(req),
        combinedDescription: req.description,
        centroidLocation: { lat: req.latitude, lng: req.longitude },
        requiredResources: suggestResources(req),
        estimatedVictimsCount: req.peopleAffected || 1,
        recommendedAction: 'Send rescue team'
      })),
      summary: 'Using fallback prioritization'
    };
  }
}

/**
 * Analyze request context and suggest next steps
 */
export async function analyzeRequestContext(request, nearbyRequests = []) {
  try {
    const prompt = `Analyze this disaster request and nearby similar requests to suggest optimal response:

Main Request:
- Type: ${request.type}
- Description: ${request.description}
- Location: (${request.latitude}, ${request.longitude})
- People affected: ${request.peopleAffected}
- Injury level: ${request.injuryLevel}

Nearby requests (${nearbyRequests.length}):
${nearbyRequests.map((r, i) => `${i + 1}. ${r.type}: ${r.description}`).join('\n')}

Suggest:
1. Immediate actions (first 5 minutes)
2. Team composition needed
3. Equipment required
4. Sequence of rescue operations
5. Safety considerations

Respond in JSON format.`;

    const responseText = await callGemini(prompt);
    if (responseText) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return { suggestions: responseText };
    }

    return { error: 'Gemini unavailable' };
  } catch (error) {
    console.error('Error analyzing context:', error);
    return { error: error.message };
  }
}

/**
 * Generate rescue strategy for a cluster of requests
 */
export async function generateRescueStrategy(cluster) {
  try {
    const prompt = `You are a disaster management expert. Create an optimal rescue strategy for this cluster:

Cluster Details:
- Total affected people: ${cluster.totalPeople}
- Geographic spread: ${cluster.geographicSpread} km²
- Number of requests: ${cluster.requestCount}
- Priorities: ${cluster.priorities.join(', ')}
- Available resources: ${cluster.availableResources.join(', ')}

Create a detailed strategy including:
1. Resource allocation
2. Sequence of operations
3. Timeline estimates
4. Team assignments
5. Risk assessment
6. Communication plan

Respond in JSON format with clear, actionable steps.`;

    const responseText = await callGemini(prompt);
    if (responseText) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return { strategy: responseText };
    }

    return { error: 'Gemini unavailable' };
  } catch (error) {
    console.error('Error generating strategy:', error);
    return { error: error.message };
  }
}

// Fallback functions for when Gemini API is unavailable
function calculateFallbackPriority(request) {
  const urgency = calculateFallbackUrgency(request);
  if (urgency >= 8) return 'CRITICAL';
  if (urgency >= 6) return 'HIGH';
  if (urgency >= 4) return 'MEDIUM';
  return 'LOW';
}

function calculateFallbackUrgency(request) {
  let score = 5; // Base score

  // Injury level
  const injuryMap = { critical: 4, severe: 3, moderate: 2, minor: 1 };
  score += injuryMap[request.injuryLevel] || 0;

  // People affected
  if (request.peopleAffected && request.peopleAffected > 5) score += 2;

  // Type urgency
  const typeUrgency = { building_collapse: 3, fire: 3, drowning: 3, landslide: 2, earthquake: 3 };
  score += typeUrgency[request.type] || 0;

  return Math.min(score, 10);
}

function suggestResources(request) {
  const resources = [];

  const typeResources = {
    building_collapse: ['rescue_team', 'medical_team', 'heavy_equipment'],
    fire: ['fire_truck', 'paramedics', 'evacuation_team'],
    drowning: ['rescue_swimmers', 'boats', 'defibrillator'],
    earthquake: ['rescue_dogs', 'medical_team', 'water', 'shelter'],
    landslide: ['excavators', 'rescue_team', 'medical_team'],
    flooding: ['boats', 'pumps', 'sandbags', 'water_purification']
  };

  if (request.injuryLevel) {
    resources.push('medical_team');
    resources.push('ambulance');
  }

  if (request.type && typeResources[request.type]) {
    resources.push(...typeResources[request.type]);
  }

  return [...new Set(resources)]; // Remove duplicates
}

export default {
  aggregateDisasterRequests,
  analyzeRequestContext,
  generateRescueStrategy
};
