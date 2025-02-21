
export interface SettingItem {
  id: number;
  name: string;
  created_at?: string;
}

export type SettingType = 'genres' | 'categories' | 'buildings';
