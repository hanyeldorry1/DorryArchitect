import { apiRequest } from './queryClient';
import { Project, Design, ChatMessage, BOQ, WeatherData } from '@shared/schema';

// Project APIs
export async function createProject(projectData: any): Promise<Project> {
  const res = await apiRequest('POST', '/api/projects', projectData);
  return await res.json();
}

export async function updateProject(id: number, projectData: any): Promise<Project> {
  const res = await apiRequest('PUT', `/api/projects/${id}`, projectData);
  return await res.json();
}

export async function deleteProject(id: number): Promise<void> {
  await apiRequest('DELETE', `/api/projects/${id}`);
}

// Design APIs
export async function generateDesign(projectId: number): Promise<{
  design: Design;
  boq: BOQ;
  environmentalData: WeatherData;
}> {
  const res = await apiRequest('POST', `/api/projects/${projectId}/generate-design`);
  return await res.json();
}

export async function getLatestDesign(projectId: number): Promise<Design> {
  const res = await apiRequest('GET', `/api/projects/${projectId}/designs/latest`);
  return await res.json();
}

export async function getDesignVersions(projectId: number): Promise<Design[]> {
  const res = await apiRequest('GET', `/api/projects/${projectId}/designs`);
  return await res.json();
}

// BOQ APIs
export async function getProjectBOQ(projectId: number): Promise<{
  boq: BOQ;
  categorySummary: Record<string, number>;
  budgetWarning: { message: string; difference: number } | null;
}> {
  const res = await apiRequest('GET', `/api/projects/${projectId}/boq`);
  return await res.json();
}

// Chat APIs
export async function sendChatMessage(
  projectId: number, 
  content: string, 
  tts: boolean = false
): Promise<{
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  speechUrl: string | null;
}> {
  const res = await apiRequest('POST', `/api/projects/${projectId}/chat`, {
    sender: 'user',
    content,
    tts
  });
  return await res.json();
}

export async function getChatHistory(projectId: number): Promise<ChatMessage[]> {
  const res = await apiRequest('GET', `/api/projects/${projectId}/chat`);
  return await res.json();
}

// Environmental analysis
export async function getEnvironmentalAnalysis(latitude: number, longitude: number): Promise<WeatherData> {
  const res = await apiRequest('GET', `/api/environmental-analysis?latitude=${latitude}&longitude=${longitude}`);
  return await res.json();
}

// TTS status
export async function getTTSStatus(): Promise<{ available: boolean }> {
  const res = await apiRequest('GET', '/api/tts/status');
  return await res.json();
}
