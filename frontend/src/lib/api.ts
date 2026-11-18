/**
 * Centralized API client for all backend communication.
 * All API calls in the frontend MUST go through this module.
 */

const PRODUCTION_BACKEND_URL = "https://evolora-ai.onrender.com/api/v1";

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    let url = envUrl.trim();
    while (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
    if (!url.endsWith("/api/v1")) {
      url = `${url}/api/v1`;
    }
    return url;
  }

  // In the browser, automatically use the live Render backend if on Vercel or any live host
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return PRODUCTION_BACKEND_URL;
    }
  }

  // In production builds (like Next.js build on Vercel), default to production Render URL
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_BACKEND_URL;
  }

  return "http://localhost:8000/api/v1";
}

const API_BASE_URL = getApiBaseUrl();

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

interface ApiError {
  detail: string;
  status: number;
}

class ApiClient {
  private customBaseUrl?: string;

  constructor(baseUrl?: string) {
    if (baseUrl && !baseUrl.includes("localhost")) {
      this.customBaseUrl = baseUrl;
    }
  }

  get baseUrl(): string {
    return this.getBaseUrl();
  }

  private getBaseUrl(): string {
    if (this.customBaseUrl) return this.customBaseUrl;
    return getApiBaseUrl();
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("evolora_access_token");
  }

  private setTokens(access: string, refresh: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("evolora_access_token", access);
    localStorage.setItem("evolora_refresh_token", refresh);
  }

  clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("evolora_access_token");
    localStorage.removeItem("evolora_refresh_token");
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, token } = options;

    const authToken = token || this.getToken();
    const activeBaseUrl = this.getBaseUrl();

    const fetchHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (authToken) {
      fetchHeaders["Authorization"] = `Bearer ${authToken}`;
    }

    let response: Response;
    try {
      response = await fetch(`${activeBaseUrl}${endpoint}`, {
        method,
        headers: fetchHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr: unknown) {
      const isBrowser = typeof window !== "undefined";
      const isMixedContent =
        isBrowser &&
        window.location.protocol === "https:" &&
        activeBaseUrl.startsWith("http:");

      let detail = "Unable to connect to the server.";
      if (isMixedContent) {
        detail = "Security block: HTTPS site cannot call an insecure HTTP backend. Ensure your backend URL starts with https://.";
      } else if (isBrowser && (!process.env.NEXT_PUBLIC_API_URL || activeBaseUrl.includes("localhost"))) {
        detail = "NEXT_PUBLIC_API_URL is missing or pointing to localhost. Please set NEXT_PUBLIC_API_URL in Vercel settings and redeploy.";
      } else {
        detail = `Failed to connect to backend (${activeBaseUrl}). Verify backend is running and CORS is configured.`;
      }

      const error: ApiError = {
        detail,
        status: 0,
      };
      throw error;
    }

    if (!response.ok) {
      const error: ApiError = {
        detail: `Request failed with status ${response.status}`,
        status: response.status,
      };

      try {
        const errorData = await response.json();
        if (Array.isArray(errorData.detail)) {
          error.detail = errorData.detail
            .map((item: any) => item.msg || JSON.stringify(item))
            .join(", ");
        } else if (typeof errorData.detail === "string") {
          error.detail = errorData.detail;
        } else if (errorData.message) {
          error.detail = String(errorData.message);
        }
      } catch {
        // Response isn't JSON
      }

      throw error;
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // ── Auth ─────────────────────────────────────────────────────────

  async register(name: string, email: string, password: string) {
    const data = await this.request<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  async getProfile() {
    return this.request<{
      id: string;
      email: string;
      name: string;
      avatar_url: string | null;
      plan: string;
      created_at: string;
    }>("/auth/me");
  }

  // ── Job Targets ──────────────────────────────────────────────────

  async submitJobDescription(rawJd: string, sourceUrl?: string) {
    return this.request<{
      id: string;
      raw_jd: string;
      role_title: string | null;
      seniority: string;
      required_skills: string[];
      tech_stack: string[];
      is_processed: boolean;
    }>("/jobs/", {
      method: "POST",
      body: { raw_jd: rawJd || "", source_url: sourceUrl },
    });
  }

  async submitJobUrl(sourceUrl: string) {
    return this.submitJobDescription("", sourceUrl);
  }

  async listJobTargets(page = 1, perPage = 20) {
    return this.request<{
      items: Array<{
        id: string;
        raw_jd: string;
        role_title: string | null;
        seniority: string;
        required_skills: string[];
        tech_stack: string[];
        is_processed: boolean;
        created_at: string;
      }>;
      total: number;
      page: number;
      per_page: number;
    }>(`/jobs/?page=${page}&per_page=${perPage}`);
  }

  async getJobTarget(id: string) {
    return this.request<{
      id: string;
      raw_jd: string;
      role_title: string | null;
      seniority: string;
      required_skills: string[];
      tech_stack: string[];
      responsibilities: string[];
      soft_skills: string[];
      is_processed: boolean;
      created_at: string;
    }>(`/jobs/${id}`);
  }

  async reExtractJobTarget(id: string) {
    return this.request<{
      id: string;
      role_title: string | null;
      seniority: string;
      is_processed: boolean;
    }>(`/jobs/${id}/re-extract`, { method: "POST" });
  }

  // ── Assessments ──────────────────────────────────────────────────

  async generateAssessment(jobTargetId: string, type = "mixed", difficulty = "medium") {
    return this.request<{
      id: string;
      job_target_id: string;
      type: string;
      difficulty: string;
      question_set: Array<Record<string, unknown>>;
      total_questions: number;
      estimated_duration_minutes: number;
      skills_covered: string[];
    }>("/assessments/generate", {
      method: "POST",
      body: { job_target_id: jobTargetId, type, difficulty },
    });
  }

  async getAssessment(id: string) {
    return this.request<Record<string, unknown>>(`/assessments/${id}`);
  }

  async submitAssessment(id: string, answers: Record<string, string>, timeSpentSeconds = 0) {
    return this.request<{
      attempt_id: string;
      assessment_id: string;
      status: string;
      score: number;
      correct_mcqs: number;
      total_mcqs: number;
      coding_passed?: number;
      total_coding_cases?: number;
    }>(`/assessments/${id}/submit`, {
      method: "POST",
      body: { answers, time_spent_seconds: timeSpentSeconds },
    });
  }

  async runCode(code: string, language = "python", testCases: Array<any> = []) {
    return this.request<{
      success: boolean;
      total_test_cases: number;
      passed_test_cases: number;
      execution_time_ms: number;
      results: Array<{
        test_case_id: number;
        description: string;
        input: string;
        expected_output: string;
        actual_output: string;
        passed: boolean;
        stdout: string;
        error?: string;
        execution_time_ms: number;
        is_hidden: boolean;
      }>;
      error_summary?: string;
    }>("/assessments/run-code", {
      method: "POST",
      body: { code, language, test_cases: testCases },
    });
  }

  // ── Mock Interviews ──────────────────────────────────────────────

  async startInterview(jobTargetId: string, mode = "text") {
    return this.request<{
      session_id: string;
      job_target_id: string;
      mode: string;
      status: string;
      current_question_index: number;
      total_questions: number;
      transcript: Array<{ role: string; content: string; timestamp: string }>;
    }>("/interviews/start", {
      method: "POST",
      body: { job_target_id: jobTargetId, mode },
    });
  }

  async respondInterview(sessionId: string, candidateAnswer: string) {
    return this.request<{
      session_id: string;
      status: string;
      current_question_index: number;
      total_questions: number;
      transcript: Array<{ role: string; content: string; timestamp: string }>;
    }>(`/interviews/${sessionId}/respond`, {
      method: "POST",
      body: { candidate_answer: candidateAnswer },
    });
  }

  async getInterview(sessionId: string) {
    return this.request<Record<string, unknown>>(`/interviews/${sessionId}`);
  }

  async evaluateInterview(sessionId: string) {
    return this.request<{
      evaluation_id: string;
      session_id: string;
      overall_score: number;
      grade: string;
      rubric_scores: Record<string, number>;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      study_plan: Array<{ skill: string; priority: string; action: string }>;
    }>(`/interviews/${sessionId}/evaluate`, {
      method: "POST",
    });
  }

  // ── Evaluations ──────────────────────────────────────────────────

  async getEvaluation(id: string) {
    return this.request<Record<string, unknown>>(`/evaluations/${id}`);
  }

  async listEvaluations() {
    return this.request<{
      items: Array<{
        id: string;
        session_id: string;
        attempt_id: string;
        type: string;
        overall_score: number;
        grade: string;
        created_at: string;
      }>;
      total: number;
    }>("/evaluations/");
  }

  // ── Resume Builder ──────────────────────────────────────────────

  async generateResume(
    jobTargetId: string,
    profile: {
      full_name: string;
      email: string;
      phone: string;
      location: string;
      linkedin_url: string;
      summary: string;
      experience: Array<{
        title: string;
        company: string;
        start_date: string;
        end_date: string;
        bullets: string[];
      }>;
      education: Array<{
        degree: string;
        school: string;
        year: string;
      }>;
      skills: string[];
    },
    lengthMode: "full" | "half" = "full"
  ) {
    return this.request<{
      id: string;
      job_target_id: string;
      ats_score: number;
      ats_breakdown: Record<string, number>;
      length_mode: string;
      total_attempts: number;
      status: string;
      latex_source: string | null;
      pdf_compiled: boolean;
      created_at: string;
      profile: Record<string, unknown>;
      iterations: Array<{
        attempt: number;
        score: number;
        breakdown: Record<string, number>;
        gaps: string[];
        latex_source: string;
      }>;
      compilation_error: string | null;
    }>("/resumes/generate", {
      method: "POST",
      body: {
        job_target_id: jobTargetId,
        profile,
        length_mode: lengthMode,
      },
    });
  }

  async listResumes() {
    return this.request<
      Array<{
        id: string;
        job_target_id: string;
        ats_score: number;
        ats_breakdown: Record<string, number>;
        length_mode: string;
        total_attempts: number;
        status: string;
        latex_source: string | null;
        pdf_compiled: boolean;
        created_at: string;
      }>
    >("/resumes/");
  }

  async getResume(id: string) {
    return this.request<{
      id: string;
      job_target_id: string;
      ats_score: number;
      ats_breakdown: Record<string, number>;
      length_mode: string;
      total_attempts: number;
      status: string;
      latex_source: string | null;
      pdf_compiled: boolean;
      created_at: string;
      profile: Record<string, unknown>;
      iterations: Array<{
        attempt: number;
        score: number;
        breakdown: Record<string, number>;
        gaps: string[];
        latex_source: string;
      }>;
      compilation_error: string | null;
    }>(`/resumes/${id}`);
  }

  async downloadResumeLatex(id: string): Promise<string> {
    const token = this.getToken();
    const res = await fetch(`${this.baseUrl}/resumes/${id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw { detail: "Download failed", status: res.status };
    return res.text();
  }

  async uploadAndParseResumeFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const token = this.getToken();
    const res = await fetch(`${this.baseUrl}/resumes/parse-file`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to parse resume file" }));
      throw err;
    }
    return res.json();
  }

  async parseResumeText(text: string) {
    return this.request<{
      full_name: string;
      email: string;
      phone: string;
      location: string;
      linkedin_url: string;
      summary: string;
      experience: Array<{ title: string; company: string; start_date: string; end_date: string; bullets: string[] }>;
      education: Array<{ degree: string; school: string; year: string }>;
      skills: string[];
    }>("/resumes/parse-text", {
      method: "POST",
      body: { text },
    });
  }

  async refineProfile(profile: any) {
    return this.request<{
      full_name: string;
      email: string;
      phone: string;
      location: string;
      linkedin_url: string;
      summary: string;
      experience: Array<{ title: string; company: string; start_date: string; end_date: string; bullets: string[] }>;
      education: Array<{ degree: string; school: string; year: string }>;
      skills: string[];
    }>("/resumes/refine-profile", {
      method: "POST",
      body: profile,
    });
  }

  async compileLatex(latexSource: string) {
    return this.request<{
      pdf_compiled: boolean;
      pdf_b64?: string;
      compilation_error?: string;
    }>("/resumes/compile", {
      method: "POST",
      body: { latex_source: latexSource },
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
