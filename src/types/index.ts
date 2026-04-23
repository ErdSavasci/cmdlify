export interface CommandFlag {
  flag: string;
  meaning: string;
}

export interface TerminalCommand {
  id: string;
  conceptId: string;
  command: string;
  description: string;
  category: string;
  flags: CommandFlag[];
  riskLevel: "safe" | "warning" | "danger";
}
