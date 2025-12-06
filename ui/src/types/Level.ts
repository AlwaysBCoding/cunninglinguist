import { LanguageSetting } from "./Language";

export interface Objective {
  id: string;
  display_text: string;
  description: string;
 }

export interface LevelState {
  chat_history: { role: "player" | "npc", text: string }[];
  completed_objectives: string[];
}

export interface Level {
  ident: string;
  display_name: string;
  character_name: string;
  character_asset_path: string;
  character_role: string;
  scenario_setting: string;
  character_persona: string;
  native_language: LanguageSetting;
  target_language: LanguageSetting;
  proficiency_level: "1" | "2" | "3" | "4" | "5";
  objectives: Objective[];
  level_state: LevelState;
}
