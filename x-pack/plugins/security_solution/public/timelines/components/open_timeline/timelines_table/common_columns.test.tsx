/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiButtonIconProps } from '@elastic/eui';
import { cloneDeep, omit } from 'lodash/fp';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mountWithIntl } from '@kbn/test-jest-helpers';

import '../../../../common/mock/formatted_relative';
import { getEmptyValue } from '../../../../common/components/empty_value';
import type { OpenTimelineResult } from '../types';
import { mockTimelineResults } from '../../../../common/mock/timeline_results';
import { NotePreviews } from '../note_previews';
import { TimelineId } from '../../../../../common/types';
import type { TimelinesTableProps } from '.';
import { TimelinesTable } from '.';

import * as i18n from '../translations';
import { getMockTimelinesTableProps } from './mocks';
import { getMockTheme } from '../../../../common/lib/kibana/kibana_react.mock';

const mockTheme = getMockTheme({ eui: { euiColorMediumShade: '#ece' } });

jest.mock('../../../../common/lib/kibana');

jest.mock('react-redux', () => {
  const original = jest.requireActual('react-redux');
  return {
    ...original,
    useDispatch: () => jest.fn(),
    useSelector: () => jest.fn(),
  };
});

describe('#getCommonColumns', () => {
  let mockResults: OpenTimelineResult[];
  let queryClient: QueryClient;

  beforeEach(() => {
    mockResults = cloneDeep(mockTimelineResults);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  describe('Expand column', () => {
    test('it renders the expand button when the timelineResult has notes', () => {
      const hasNotes: OpenTimelineResult[] = [{ ...mockResults[0] }];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(hasNotes),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <TimelinesTable {...testProps} />
        </QueryClientProvider>
      );

      expect(wrapper.find('[data-test-subj="expand-notes"]').exists()).toBe(true);
    });

    test('it does NOT render the expand button when the timelineResult notes are undefined', () => {
      const missingNotes: OpenTimelineResult[] = [omit('notes', { ...mockResults[0] })];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(missingNotes),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <TimelinesTable {...testProps} />
        </QueryClientProvider>
      );
      expect(wrapper.find('[data-test-subj="expand-notes"]').exists()).toBe(false);
    });

    test('it does NOT render the expand button when the timelineResult notes are null', () => {
      const nullNotes: OpenTimelineResult[] = [{ ...mockResults[0], notes: null }];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(nullNotes),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <TimelinesTable {...testProps} />
        </QueryClientProvider>
      );
      expect(wrapper.find('[data-test-subj="expand-notes"]').exists()).toBe(false);
    });

    test('it does NOT render the expand button when the notes are empty', () => {
      const emptylNotes: OpenTimelineResult[] = [{ ...mockResults[0], notes: [] }];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(emptylNotes),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <TimelinesTable {...testProps} />
        </QueryClientProvider>
      );
      expect(wrapper.find('[data-test-subj="expand-notes"]').exists()).toBe(false);
    });

    test('it does NOT render the expand button when the timelineResult savedObjectId is undefined', () => {
      const missingSavedObjectId: OpenTimelineResult[] = [
        omit('savedObjectId', { ...mockResults[0] }),
      ];
      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(missingSavedObjectId),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <TimelinesTable {...testProps} />
        </QueryClientProvider>
      );
      expect(wrapper.find('[data-test-subj="expand-notes"]').exists()).toBe(false);
    });

    test('it does NOT render the expand button when the timelineResult savedObjectId is null', () => {
      const nullSavedObjectId: OpenTimelineResult[] = [{ ...mockResults[0], savedObjectId: null }];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(nullSavedObjectId),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <TimelinesTable {...testProps} />
        </QueryClientProvider>
      );
      expect(wrapper.find('[data-test-subj="expand-notes"]').exists()).toBe(false);
    });

    test('it renders the right arrow expander when the row is not expanded', () => {
      const hasNotes: OpenTimelineResult[] = [{ ...mockResults[0] }];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(hasNotes),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <TimelinesTable {...testProps} />
        </QueryClientProvider>
      );
      const props = wrapper
        .find('[data-test-subj="expand-notes"]')
        .first()
        .props() as EuiButtonIconProps;

      expect(props.iconType).toEqual('arrowRight');
    });

    test('it renders the down arrow expander when the row is expanded', () => {
      const hasNotes: OpenTimelineResult[] = [{ ...mockResults[0] }];

      const itemIdToExpandedNotesRowMap = {
        [mockResults[0].savedObjectId!]: <NotePreviews notes={mockResults[0].notes} />,
      };

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(hasNotes),
        itemIdToExpandedNotesRowMap,
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <TimelinesTable {...testProps} />
        </QueryClientProvider>
      );
      const props = wrapper
        .find('[data-test-subj="expand-notes"]')
        .first()
        .props() as EuiButtonIconProps;

      expect(props.iconType).toEqual('arrowDown');
    });

    test('it invokes onToggleShowNotes to expand the row when the row is not expanded', () => {
      const onToggleShowNotes = jest.fn();
      const hasNotes: OpenTimelineResult[] = [{ ...mockResults[0] }];

      // the saved object id does not exist in the map yet, so the row is not expanded:
      const itemIdToExpandedNotesRowMap = {
        abc: <div />,
      };

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(hasNotes),
        itemIdToExpandedNotesRowMap,
        onToggleShowNotes,
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <TimelinesTable {...testProps} />
        </QueryClientProvider>
      );
      wrapper.find('[data-test-subj="expand-notes"]').first().simulate('click');

      expect(onToggleShowNotes).toBeCalledWith({
        abc: <div />,
        'saved-timeline-11': (
          <NotePreviews notes={hasNotes[0].notes} timelineId={TimelineId.active} />
        ),
      });
    });

    test('it invokes onToggleShowNotes to remove the row when the row is expanded', () => {
      const onToggleShowNotes = jest.fn();
      const hasNotes: OpenTimelineResult[] = [{ ...mockResults[0] }];

      // the saved object id exists in the map yet, so the row is expanded:
      const itemIdToExpandedNotesRowMap = {
        abc: <div />,
        'saved-timeline-11': <NotePreviews notes={hasNotes[0].notes} />,
      };

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(hasNotes),
        itemIdToExpandedNotesRowMap,
        onToggleShowNotes,
      };

      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...testProps} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      wrapper.find('[data-test-subj="expand-notes"]').first().simulate('click');

      expect(onToggleShowNotes).toBeCalledWith({
        abc: <div />,
      });
    });
  });

  describe('Timeline Name column', () => {
    test('it renders the expected column name', () => {
      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(mockResults),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...testProps} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(wrapper.find('thead tr th').at(1).text()).toContain(i18n.TIMELINE_NAME);
    });

    test('it renders the title when the timeline has a title and a saved object id', () => {
      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(mockResults),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...testProps} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(
        wrapper
          .find(`[data-test-subj="timeline-title-${mockResults[0].savedObjectId}"]`)
          .first()
          .text()
      ).toEqual(mockResults[0].title);
    });

    test('it renders the title when the timeline has a title, but no saved object id', () => {
      const missingSavedObjectId: OpenTimelineResult[] = [
        omit('savedObjectId', { ...mockResults[0] }),
      ];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(missingSavedObjectId),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...testProps} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(
        wrapper
          .find(`[data-test-subj="title-no-saved-object-id-${missingSavedObjectId[0].title}"]`)
          .first()
          .text()
      ).toEqual(mockResults[0].title);
    });

    test('it renders an Untitled Timeline title when the timeline has no title and a saved object id', () => {
      const missingTitle: OpenTimelineResult[] = [omit('title', { ...mockResults[0] })];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(missingTitle),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...testProps} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(
        wrapper
          .find(`[data-test-subj="timeline-title-${missingTitle[0].savedObjectId}"]`)
          .first()
          .text()
      ).toEqual(i18n.UNTITLED_TIMELINE);
    });

    test('it renders an Untitled Timeline title when the timeline has no title, and no saved object id', () => {
      const withMissingSavedObjectIdAndTitle: OpenTimelineResult[] = [
        omit(['title', 'savedObjectId'], { ...mockResults[0] }),
      ];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(withMissingSavedObjectIdAndTitle),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...testProps} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(
        wrapper.find('[data-test-subj="title-no-saved-object-id-no-title"]').first().text()
      ).toEqual(i18n.UNTITLED_TIMELINE);
    });

    test('it renders an Untitled Timeline title when the title is just whitespace, and it has a saved object id', () => {
      const withJustWhitespaceTitle: OpenTimelineResult[] = [
        { ...mockResults[0], title: '      ' },
      ];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(withJustWhitespaceTitle),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...testProps} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(
        wrapper
          .find(`[data-test-subj="timeline-title-${withJustWhitespaceTitle[0].savedObjectId}"]`)
          .first()
          .text()
      ).toEqual(i18n.UNTITLED_TIMELINE);
    });

    test('it renders an Untitled Timeline title when the title is just whitespace, and no saved object id', () => {
      const withMissingSavedObjectId: OpenTimelineResult[] = [
        omit('savedObjectId', { ...mockResults[0], title: '      ' }),
      ];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(withMissingSavedObjectId),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...testProps} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(
        wrapper
          .find(`[data-test-subj="title-no-saved-object-id-${withMissingSavedObjectId[0].title}"]`)
          .first()
          .text()
      ).toEqual(i18n.UNTITLED_TIMELINE);
    });

    test('it renders a hyperlink when the timeline has a saved object id', () => {
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...getMockTimelinesTableProps(mockResults)} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(
        wrapper
          .find(`[data-test-subj="timeline-title-${mockResults[0].savedObjectId}"]`)
          .first()
          .exists()
      ).toBe(true);
    });

    test('it does NOT render a hyperlink when the timeline has no saved object id', () => {
      const missingSavedObjectId: OpenTimelineResult[] = [
        omit('savedObjectId', { ...mockResults[0] }),
      ];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(missingSavedObjectId),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...testProps} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(
        wrapper
          .find(`[data-test-subj="timeline-title-${mockResults[0].savedObjectId}"]`)
          .first()
          .exists()
      ).toBe(false);
    });

    test('it invokes `onOpenTimeline` when the hyperlink is clicked', () => {
      const onOpenTimeline = jest.fn();

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(mockResults),
        onOpenTimeline,
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...testProps} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      wrapper
        .find(`[data-test-subj="timeline-title-${mockResults[0].savedObjectId}"]`)
        .last()
        .simulate('click');

      expect(onOpenTimeline).toHaveBeenCalledWith({
        duplicate: false,
        timelineId: mockResults[0].savedObjectId,
      });
    });
  });

  describe('Description column', () => {
    test('it renders the expected column name', () => {
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...getMockTimelinesTableProps(mockResults)} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(wrapper.find('thead tr th').at(2).text()).toContain(i18n.DESCRIPTION);
    });

    test('it renders the description when the timeline has a description', () => {
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...getMockTimelinesTableProps(mockResults)} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(wrapper.find('[data-test-subj="description"]').first().text()).toEqual(
        mockResults[0].description
      );
    });

    test('it renders a placeholder when the timeline has no description', () => {
      const missingDescription: OpenTimelineResult[] = [omit('description', { ...mockResults[0] })];

      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...getMockTimelinesTableProps(missingDescription)} />
          </ThemeProvider>
        </QueryClientProvider>
      );
      expect(wrapper.find('[data-test-subj="description"]').first().text()).toEqual(
        getEmptyValue()
      );
    });

    test('it renders a placeholder when the timeline description is just whitespace', () => {
      const justWhitespaceDescription: OpenTimelineResult[] = [
        { ...mockResults[0], description: '      ' },
      ];

      const testProps: TimelinesTableProps = {
        ...getMockTimelinesTableProps(justWhitespaceDescription),
      };
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...testProps} />
          </ThemeProvider>
        </QueryClientProvider>
      );
      expect(wrapper.find('[data-test-subj="description"]').first().text()).toEqual(
        getEmptyValue()
      );
    });
  });

  describe('Last Modified column', () => {
    test('it renders the expected column name', () => {
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...getMockTimelinesTableProps(mockResults)} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(wrapper.find('thead tr th').at(3).text()).toContain(i18n.LAST_MODIFIED);
    });

    test('it renders the last modified (updated) date when the timeline has an updated property', () => {
      const wrapper = mountWithIntl(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={mockTheme}>
            <TimelinesTable {...getMockTimelinesTableProps(mockResults)} />
          </ThemeProvider>
        </QueryClientProvider>
      );

      expect(wrapper.find('[data-test-subj="updated"]').first().text().length).toBeGreaterThan(
        getEmptyValue().length
      );
    });
  });

  test('it renders a placeholder when the timeline has no last modified (updated) date', () => {
    const missingUpdated: OpenTimelineResult[] = [omit('updated', { ...mockResults[0] })];

    const wrapper = mountWithIntl(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={mockTheme}>
          <TimelinesTable {...getMockTimelinesTableProps(missingUpdated)} />
        </ThemeProvider>
      </QueryClientProvider>
    );
    expect(wrapper.find('[data-test-subj="updated"]').first().text()).toEqual(getEmptyValue());
  });
});
