import { CustomAttribute } from '@/types';

/**
 * Formats an attribute value based on its display type
 * @param value - The raw value from customAttributes
 * @param attribute - The custom attribute definition
 * @returns Formatted string value
 */
export function formatAttributeValue(
  value: string | undefined | null,
  attribute: CustomAttribute,
): string {
  if (!value && value !== '0' && value !== 0) {
    return '';
  }

  const { attributeDisplayType } = attribute;
  const stringValue = String(value);

  switch (attributeDisplayType) {
    case 'currency': {
      const numValue = parseFloat(stringValue);
      if (isNaN(numValue)) {
        return stringValue;
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numValue);
    }

    case 'percent': {
      const numValue = parseFloat(stringValue);
      if (isNaN(numValue)) {
        return stringValue;
      }
      return `${numValue}%`;
    }

    case 'date': {
      try {
        const dateValue = new Date(stringValue);
        if (isNaN(dateValue.getTime())) {
          return stringValue;
        }
        return dateValue.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        return stringValue;
      }
    }

    case 'checkbox': {
      const lowerValue = stringValue.toLowerCase().trim();
      if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
        return 'Yes';
      }
      if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
        return 'No';
      }
      return stringValue;
    }

    case 'list':
    case 'text':
    case 'number':
    case 'link':
    default:
      return stringValue;
  }
}

