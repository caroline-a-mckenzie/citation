'use client';

import { Transition } from '@headlessui/react';
import { flatten, sortBy, uniqBy } from 'lodash';
import React, { useRef } from 'react';
import { useMemo, useState } from 'react';

import { Document } from '@/cohere-client';
import { CitationDocument } from '@/components/Citations/CitationDocument';
import { IconButton } from '@/components/IconButton';
import { Text } from '@/components/Shared/Text';
import { ReservedClasses } from '@/constants';
import { DYNAMIC_STRINGS } from '@/constants/strings';
import { CitationStyles, useCalculateCitationTranslateY } from '@/hooks/citations';
import { useCitationsStore } from '@/stores';
import { cn } from '@/utils';

type Props = {
  generationId: string;
  message: string;
  isLastStreamed?: boolean;
  styles?: CitationStyles;
  className?: string;
};

export const DEFAULT_NUM_VISIBLE_DOCS = 3;

/**
 * Placeholder component for a citation.
 * This component is in charge of rendering the citations for a given generation.
 * @params {string} generationId - the id of the generation
 * @params {string} message - the message that was sent
 * @params {boolean} isLastStreamed - if the citation is for the last streamed message
 * @params {number} styles - top and bottom styling, depending on the associated message row
 * @params {string} className - additional class names to add to the citation
 */
export const Citation = React.forwardRef<HTMLDivElement, Props>(function CitationInternal(
  { generationId, message, className = '', styles, isLastStreamed = false },
  ref
) {
  const {
    citations: { citationReferences, selectedCitation, hoveredGenerationId },
    hoverCitation,
  } = useCitationsStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState('');
  const isSelected = selectedCitation?.generationId === generationId;
  const isSomeSelected = !!selectedCitation?.generationId;
  const isHovered = hoveredGenerationId === generationId;
  const [isAllDocsVisible, setIsAllDocsVisible] = useState(false);

  const startEndKeyToDocs = citationReferences[generationId];
  const documents: Document[] = useMemo(() => {
    if (!startEndKeyToDocs) {
      return [];
    }

    if (selectedCitation && generationId === selectedCitation.generationId) {
      setKeyword(message.slice(Number(selectedCitation.start), Number(selectedCitation.end)));
      return startEndKeyToDocs[`${selectedCitation.start}-${selectedCitation.end}`];
    } else {
      const firstCitedTextKey = Object.keys(startEndKeyToDocs)[0];
      const [start, end] = firstCitedTextKey.split('-');
      setKeyword(message.slice(Number(start), Number(end)));
      return startEndKeyToDocs[firstCitedTextKey];
    }
  }, [startEndKeyToDocs, selectedCitation, generationId, message]);

  const translateY = useCalculateCitationTranslateY({
    generationId,
    citationRef: containerRef,
  });

  if (!startEndKeyToDocs || documents.length === 0 || (!isSelected && !!selectedCitation)) {
    return null;
  }

  const highlightedDocumentIds = documents
    .slice(0, DEFAULT_NUM_VISIBLE_DOCS)
    .map((doc) => doc.document_id);

  const uniqueDocuments = sortBy(
    uniqBy(flatten(Object.values(startEndKeyToDocs)), 'document_id'),
    'document_id'
  );
  const uniqueDocumentsUrls = uniqBy(uniqueDocuments, 'url');

  const handleMouseEnter = () => {
    hoverCitation(generationId);
  };

  const handleMouseLeave = () => {
    hoverCitation(null);
  };

  const handleToggleAllDocsVisible = () => {
    setIsAllDocsVisible(!isAllDocsVisible);
  };

  return (
    <div>
      <h1 style={{ color: "red" }}>THIS IS A TEST</h1>
    </div>
  );
});
