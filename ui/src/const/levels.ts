import { Level } from '../types/Level';

export const LEVELS: Level[] = [
  {
    ident: 'waitress',
    display_name: 'Waitress',
    character_name: 'Maria',
    character_asset_path: '/assets/characters/waitress.mp4',
    character_role: 'Waitress',
    scenario_setting: 'A busy restaurant during lunch rush. You need to order food and interact with the waitress.',
    character_persona: 'Friendly and efficient waitress who speaks Spanish as her native language. She is patient but busy, and appreciates when customers are polite and clear with their orders.',
    native_language: {
      code: 'en',
      display: 'English'
    },
    target_language: {
      code: 'en',
      display: 'English'
    },
    proficiency_level: '2',
    objectives: [
      {
        id: 'order-food',
        display_text: 'Order a meal',
        description: 'Successfully order a meal from the menu in the target language'
      },
      {
        id: 'ask-question',
        display_text: 'Ask a question',
        description: 'Ask the waitress at least one question about the menu or restaurant'
      },
      {
        id: 'complete-order',
        display_text: 'Complete your order',
        description: 'Confirm your order and provide any special requests'
      }
    ],
    level_state: {
      chat_history: [],
      completed_objectives: []
    }
  },
  {
    ident: 'police-officer',
    display_name: 'Police Officer',
    character_name: 'Officer Chen',
    character_asset_path: '/assets/characters/police-officer.png',
    character_role: 'Police Officer',
    scenario_setting: 'A police station where you need to report an incident or ask for directions. The officer speaks Mandarin Chinese.',
    character_persona: 'Professional and helpful police officer who speaks Mandarin Chinese as her native language. She is formal but approachable, and expects clear communication when dealing with reports or questions.',
    native_language: {
      code: 'zh',
      display: 'Chinese'
    },
    target_language: {
      code: 'en',
      display: 'English'
    },
    proficiency_level: '3',
    objectives: [
      {
        id: 'greet-officer',
        display_text: 'Greet the officer',
        description: 'Properly greet the police officer and introduce yourself'
      },
      {
        id: 'report-incident',
        display_text: 'Report an incident',
        description: 'Describe an incident or situation to the officer in the target language'
      },
      {
        id: 'ask-directions',
        display_text: 'Ask for directions',
        description: 'Request directions to a specific location from the officer'
      }
    ],
    level_state: {
      chat_history: [],
      completed_objectives: []
    }
  }
];

