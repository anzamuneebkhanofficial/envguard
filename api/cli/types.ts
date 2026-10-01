export interface CLISyncOptions {
  file: string;
  project: string;
  api: string;
  token?: string;
}

export interface CLISyncExampleOptions {
  project: string;
  api: string;
  output: string;
  token?: string;
}

export interface ParsedVariable {
  key: string;
  value: string;
}

export interface CLIConfigFile {
  token?: string;
  apiUrl?: string;
  currentProject?: string;
}
