import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Profile, Skill, Project } from '../types';
import Loading from '../components/Loading';

// --- UI Components for Analysis Result ---

interface AnalysisResult {
  summary: string;
  strengths: string[];
  gaps: string[];
  score: number;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 52; // 2 * pi * radius
    const offset = circumference - (score / 100) * circumference;
    const scoreColorClass = score > 70 ? 'stroke-green-500' : score > 40 ? 'stroke-yellow-500' : 'stroke-red-500';
    const textColorClass = score > 70 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="stroke-current text-outline/20 dark:text-dark-outline/20" strokeWidth="10" fill="transparent" r="52" cx="60" cy="60" />
                <circle
                    className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${scoreColorClass}`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset: offset }}
                    strokeLinecap="round"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${textColorClass}`}>{score}%</span>
                <span className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Fit Score</span>
            </div>
        </div>
    );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const GapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const AIFitAnalysisPage: React.FC = () => {
  const [jobRequirements, setJobRequirements] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parseAnalysisResult = (text: string): AnalysisResult => {
      const result: AnalysisResult = {
          summary: '',
          strengths: [],
          gaps: [],
          score: 0,
      };

      const cleanedText = text.replace(/\*\*/g, ''); // Remove markdown bolding for easier parsing

      const scoreMatch = cleanedText.match(/FIT SCORE:\s*(\d+)%/i);
      result.score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

      const summaryMatch = cleanedText.match(/OVERALL SUMMARY:([\s\S]*?)(KEY STRENGTHS:|^\s*$)/im);
      result.summary = summaryMatch ? summaryMatch[1].trim() : 'Could not parse summary.';
      
      const strengthsMatch = cleanedText.match(/KEY STRENGTHS:([\s\S]*?)POTENTIAL GAPS:/i);
      if (strengthsMatch) {
          result.strengths = strengthsMatch[1].split('\n').map(s => s.replace(/^- \s*/, '').trim()).filter(Boolean);
      }
      
      const gapsMatch = cleanedText.match(/POTENTIAL GAPS:([\s\S]*?)FIT SCORE:/i);
      if (gapsMatch) {
          result.gaps = gapsMatch[1].split('\n').map(s => s.replace(/^- \s*/, '').trim()).filter(Boolean);
      }

      // Cleanup any leading junk in summary
      const summaryParts = result.summary.split('\n\n').filter(p => p.trim().length > 0);
      if (summaryParts.length > 1 && summaryParts[0].length < 150) {
        result.summary = summaryParts.slice(1).join('\n\n');
      } else {
        result.summary = summaryParts.join('\n\n');
      }
      
      return result;
  };

  const handleAnalyze = async () => {
    if (!jobRequirements.trim()) {
      setError('Please enter the job requirements.');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      // 1. Fetch portfolio data from Firestore
      const profileDocRef = doc(db, 'profile', 'main');
      const skillsCollectionRef = collection(db, 'skills');
      const projectsCollectionRef = collection(db, 'projects');

      const [profileDoc, skillsSnapshot, projectsSnapshot] = await Promise.all([
        getDoc(profileDocRef),
        getDocs(skillsCollectionRef),
        getDocs(projectsCollectionRef)
      ]);

      const profile = profileDoc.exists() ? profileDoc.data() as Profile : null;
      const skills = skillsSnapshot.docs.map(doc => doc.data() as { name: string });
      const projects = projectsSnapshot.docs.map(doc => doc.data() as { title: string; description: string });

      if (!profile && skills.length === 0 && projects.length === 0) {
        throw new Error("No portfolio data found. The admin needs to add information first.");
      }

      // 2. Construct the prompt for Gemini
      const portfolioData = `
        PROFILE:
        Name: ${profile?.name}
        Title: ${profile?.title}
        Bio: ${profile?.bio}

        SKILLS:
        ${skills.map(s => `- ${s.name}`).join('\n')}

        PROJECTS:
        ${projects.map(p => `
          - Title: ${p.title}
            Description: ${p.description}
        `).join('\n')}
      `;

      const prompt = `
        As an expert technical recruiter, analyze the following candidate's portfolio against the provided job requirements. Provide a detailed analysis of their suitability for the role.

        The response should be plain text and include the following sections with clear headings:
        1.  OVERALL SUMMARY: A brief, professional summary of the candidate's fit.
        2.  KEY STRENGTHS: A bulleted list (using '-') of the candidate's skills and experiences that directly align with the job requirements.
        3.  POTENTIAL GAPS: A bulleted list (using '-') of areas where the candidate's experience might not fully align, presented constructively.
        4.  FIT SCORE: An estimated percentage of how well the candidate fits the role, formatted as "Fit Score: X%".
        keep the analysis objective and professional throughout and short and concise.
        ---
        CANDIDATE PORTFOLIO:
        ${portfolioData}
        ---
        JOB REQUIREMENTS:
        ${jobRequirements}
        ---
      `;

    // 3. Call Gemini API
    const GEMINI_API_KEY = (import.meta.env as any).VITE_GEMINI_API_KEY || (process.env as any).API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error("API_KEY is not configured for this environment.");
    }
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        contents: prompt,
      });

      setAnalysisResult(parseAnalysisResult(response.text));

    } catch (err) {
      console.error("Analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`Analysis failed. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-4xl font-bold">AI-Powered Fit Analysis</h1>
        <p className="mt-4 text-text-secondary dark:text-dark-text-secondary">
          Paste a job description below to see how my skills and experience align with your needs.
        </p>
      </div>

      <div className="mt-8 space-y-6 bg-surface/50 dark:bg-dark-surface/50 backdrop-blur-xl border border-white/20 dark:border-dark-outline-variant/20 p-8 rounded-squircle shadow-lg dark:shadow-2xl dark:shadow-black/20">
        <div>
          <label htmlFor="job-requirements" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">
            Job Requirements
          </label>
          <textarea
            id="job-requirements"
            rows={10}
            value={jobRequirements}
            onChange={(e) => setJobRequirements(e.target.value)}
            placeholder="Paste the job description here..."
            className="mt-1 block w-full bg-black/5 dark:bg-white/5 border-outline/50 dark:border-dark-outline/50 rounded-lg border py-3 px-4 text-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary dark:focus:border-dark-primary focus:ring-2 focus:ring-primary/50 dark:focus:ring-dark-primary/50 transition-all duration-300 focus:shadow-glow-primary/50 dark:focus:shadow-glow-primary-dark/50"
          />
        </div>
        <div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full flex justify-center py-3 px-6 border border-transparent rounded-full shadow-sm text-sm font-medium text-on-primary bg-gradient-to-r from-primary to-tertiary dark:from-dark-primary dark:to-dark-tertiary hover:shadow-lg hover:shadow-primary/40 dark:hover:shadow-dark-primary/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary disabled:opacity-50 transition-all duration-300 active:animate-click-bounce"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </div>
            ) : 'Analyze Fit'}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-red-500 text-center bg-red-500/10 p-3 rounded-lg">{error}</p>}
      
      {loading && !analysisResult && (
          <div className="mt-8 flex justify-center">
              <Loading />
          </div>
      )}

      {analysisResult && (
        <div className="mt-8 bg-surface/50 dark:bg-dark-surface/50 backdrop-blur-xl border border-white/20 dark:border-dark-outline-variant/20 p-6 sm:p-8 rounded-squircle shadow-lg dark:shadow-2xl dark:shadow-black/20 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-center mb-6">Analysis Result</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-1 flex flex-col items-center text-center gap-4">
                    <ScoreCircle score={analysisResult.score} />
                    <div>
                       <h3 className="text-xl font-bold mt-4">Overall Summary</h3>
                       <p className="text-text-secondary dark:text-dark-text-secondary mt-2 text-sm">{analysisResult.summary}</p>
                    </div>
                </div>
                
                <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-green-500/10 dark:bg-green-500/10 p-4 rounded-xl border border-green-500/20 shadow-glow-green/20">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-green-700 dark:text-green-300">
                            <CheckIcon />
                            Key Strengths
                        </h3>
                        <ul className="mt-3 space-y-2 list-inside">
                            {analysisResult.strengths.map((item, index) => (
                                <li key={index} className="text-sm text-text-primary dark:text-dark-text-primary">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-yellow-500/10 dark:bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20 shadow-glow-yellow/20">
                         <h3 className="font-semibold text-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                            <GapIcon />
                            Potential Gaps
                        </h3>
                        <ul className="mt-3 space-y-2 list-inside">
                            {analysisResult.gaps.map((item, index) => (
                                <li key={index} className="text-sm text-text-primary dark:text-dark-text-primary">{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AIFitAnalysisPage;