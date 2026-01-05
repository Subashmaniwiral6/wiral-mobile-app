import React, { useEffect } from 'react';
import Animated from 'react-native-reanimated';
import { camelCase } from 'lodash';
import { ActivityIndicator } from 'react-native';

import { AttributeList } from '@/components-next';
import { tailwind } from '@/theme';
import { AttributeListType, CustomAttribute } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { getContactCustomAttributes } from '@/store/custom-attribute/customAttributeSlice';
import { selectContactById } from '@/store/contact/contactSelectors';
import { contactActions } from '@/store/contact/contactActions';
import { Conversation } from '@/types/Conversation';
import { formatAttributeValue } from '@/utils/attributeFormatter';

type ContactDetailsSectionProps = {
  conversation: Conversation | null;
};

const processContactAttributes = (
  attributes: CustomAttribute[],
  customAttributes: Record<string, string>,
  filterCondition: (key: string, custom: Record<string, string>) => boolean,
) => {
  if (!attributes.length || !customAttributes) {
    return [];
  }

  return attributes.reduce<(CustomAttribute & { value: string })[]>((result, attribute) => {
    const { attributeKey } = attribute;
    const meetsCondition = filterCondition(camelCase(attributeKey), customAttributes);

    if (meetsCondition) {
      const rawValue = customAttributes[camelCase(attributeKey)] ?? '';
      result.push({
        ...attribute,
        value: rawValue,
      });
    }

    return result;
  }, []);
};

export const ContactDetailsSection = ({ conversation }: ContactDetailsSectionProps) => {
  const dispatch = useAppDispatch();
  const contactCustomAttributes = useAppSelector(getContactCustomAttributes);

  if (!conversation) {
    return null;
  }

  const contactId = conversation.meta?.sender?.id;
  const contact = useAppSelector(state => (contactId ? selectContactById(state, contactId) : null));

  useEffect(() => {
    if (contactId && !contact) {
      dispatch(contactActions.fetchContact(contactId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId, contact]);

  if (!contactId) {
    return null;
  }

  // Filter for contact attributes only
  const contactAttributeDefinitions = contactCustomAttributes.filter(
    attr => attr.attributeModel === 'contact_attribute',
  );

  // Process attributes with contact's custom attributes
  const usedContactAttributes = processContactAttributes(
    contactAttributeDefinitions,
    contact?.customAttributes || {},
    (key, custom) => key in custom,
  );

  // Format and map to AttributeListType
  const processedAttributes: AttributeListType[] = usedContactAttributes.map(attribute => {
    const rawValue = contact?.customAttributes?.[camelCase(attribute.attributeKey)] ?? '';
    const formattedValue = formatAttributeValue(rawValue, attribute);

    return {
      title: attribute.attributeDisplayName,
      subtitle: formattedValue,
      subtitleType: 'dark',
      type: attribute.attributeDisplayType === 'link' ? 'link' : 'text',
    };
  });

  // Show loading state if contact is being fetched
  if (!contact) {
    return (
      <Animated.View style={tailwind.style('pt-10 items-center justify-center py-8')}>
        <ActivityIndicator size="small" color="#873CF6" />
      </Animated.View>
    );
  }

  // Don't display section if no attributes
  if (processedAttributes.length === 0) {
    return null;
  }

  return (
    <Animated.View style={tailwind.style('pt-10')}>
      <AttributeList sectionTitle="Contact Details" list={processedAttributes} />
    </Animated.View>
  );
};
