export interface Label {
  id: number;
  title: string;
  description: string;
  color: string;
  showOnSidebar: boolean;
  // 2025-12-09 thouseef-hamza: Optional pipeline flag from backend
  is_pipeline_tag?: boolean;
  // Optional icon URL from backend (label_icon_url)
  labelIconUrl?: string;
}
