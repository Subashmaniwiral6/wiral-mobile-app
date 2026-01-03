export interface CustomAttribute {
  id: number;
  attributeDisplayName: string;
  attributeDisplayType: string;
  attributeDescription: string;
  attributeKey: string;
  regexPattern: string;
  regexCue: string;
  attributeValues: string[];
  attributeModel: string;
  defaultValue: string;
  mandatory?: boolean;
  showInFilter?: boolean;
  createdAt: string;
  updatedAt: string;
  value: string;
}
