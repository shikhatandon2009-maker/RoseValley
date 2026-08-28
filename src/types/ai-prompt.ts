export interface AIPromptVariable {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface AIPromptItem {
  id?: string;
  store_id?: string;
  slug: string;
  title: string;
  description: string;
  category: 'Catalog & SEO' | 'AI Shopping Experience' | 'Community & Social Proof' | 'Editorial & Content';
  system_prompt: string;
  user_prompt_template: string;
  variables: AIPromptVariable[];
  model: string;
  temperature: number;
  max_output_tokens: number;
  expected_output_format: 'json' | 'text' | 'markdown';
  is_active: boolean;
  sample_input: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface AIPromptTestRequest {
  slug?: string;
  system_prompt: string;
  user_prompt_template: string;
  variables_input: Record<string, any>;
  model?: string;
  temperature?: number;
  max_output_tokens?: number;
  expected_output_format?: 'json' | 'text' | 'markdown';
}

export interface AIPromptTestResponse {
  success: boolean;
  raw_output: string;
  parsed_output?: any;
  is_valid_json?: boolean;
  latency_ms: number;
  model_used: string;
  interpolated_prompt: string;
  error?: string;
}
