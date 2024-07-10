/* eslint-disable react-func/max-lines-per-function */
import { FC, useContext, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import ReciterSettings from './ReciterSettings';
import TranslationSettingsSection from './TranslationSectionSetting';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import { RangeSelectorType } from '@/components/Verse/AdvancedCopy/SelectorContainer';
import validateRangeSelection from '@/components/Verse/AdvancedCopy/utils/validateRangeSelection';
import VersesRangeSelector from '@/components/Verse/AdvancedCopy/VersesRangeSelector';
import DataContext from '@/contexts/DataContext';
import Select, { SelectSize } from '@/dls/Forms/Select';
import MediaSettings, { ChangedSettings } from '@/types/Media/MediaSettings';
import Reciter from '@/types/Reciter';
import { toLocalizedVerseKey } from '@/utils/locale';
import { generateChapterVersesKeys, getChapterNumberFromKey } from '@/utils/verse';

const MAXIMUM_VERSES_PER_RENDER = 10;

type AudioTabProps = {
  chaptersList: any[];
  reciters: Reciter[];
  isFetching: boolean;
  mediaSettings: MediaSettings;
  onSettingsUpdate: (settings: ChangedSettings, key?: keyof MediaSettings, value?: any) => void;
};

const AudioTab: FC<AudioTabProps> = ({
  chaptersList,
  reciters,
  isFetching,
  mediaSettings,
  onSettingsUpdate,
}) => {
  const { lang, t } = useTranslation('quran-media-maker');
  const chaptersData = useContext(DataContext);
  const [rangesError, setRangesError] = useState(null);

  const { verseFrom, verseTo, surah } = mediaSettings;

  const onChapterChange = (newChapter: string) => {
    const keyOfFirstVerseOfNewChapter = `${newChapter}:1`;
    onSettingsUpdate(
      {
        surah: Number(newChapter),
        verseFrom: keyOfFirstVerseOfNewChapter,
        verseTo: keyOfFirstVerseOfNewChapter,
      },
      'surah',
      newChapter,
    );
  };

  const verseKeys = useMemo(() => {
    return generateChapterVersesKeys(chaptersData, String(surah)).map((verseKey) => ({
      id: verseKey,
      name: verseKey,
      value: verseKey,
      label: toLocalizedVerseKey(verseKey, lang),
    }));
  }, [chaptersData, lang, surah]);

  const onVerseRangeChange = (newSelectedVerseKey: string, verseSelectorId: RangeSelectorType) => {
    setRangesError(null);
    const isVerseKeyStartOfRange = verseSelectorId === RangeSelectorType.START;
    const startVerseKey = isVerseKeyStartOfRange ? newSelectedVerseKey : verseFrom;
    const endVerseKey = !isVerseKeyStartOfRange ? newSelectedVerseKey : verseTo;
    const validationError = validateRangeSelection(
      startVerseKey,
      endVerseKey,
      t,
      MAXIMUM_VERSES_PER_RENDER,
      chaptersData,
    );
    if (validationError) {
      setRangesError(validationError);
      return false;
    }
    if (isVerseKeyStartOfRange) {
      onSettingsUpdate(
        {
          verseTo,
          verseFrom: newSelectedVerseKey,
          surah: getChapterNumberFromKey(newSelectedVerseKey),
        },
        'verseFrom',
        newSelectedVerseKey,
      );
    } else {
      onSettingsUpdate(
        {
          verseFrom,
          verseTo: newSelectedVerseKey,
          surah: getChapterNumberFromKey(newSelectedVerseKey),
        },
        'verseTo',
        newSelectedVerseKey,
      );
    }
    return true;
  };

  return (
    <div>
      <Section>
        <Section.Title>{t('common:surah')}</Section.Title>
        <Section.Row>
          <Section.Label>{t('common:sidebar.search-surah')}</Section.Label>
          <Select
            id="surah"
            name="surah"
            options={chaptersList || []}
            value={String(surah)}
            onChange={onChapterChange}
            disabled={isFetching}
            size={SelectSize.Small}
            className={styles.select}
          />
        </Section.Row>
        <Section.Row>
          <Section.Row>
            <VersesRangeSelector
              dropdownItems={verseKeys}
              rangeStartVerse={verseFrom}
              rangeEndVerse={verseTo}
              onChange={onVerseRangeChange}
              isVisible
              isDisabled={isFetching}
            />
          </Section.Row>
        </Section.Row>
        {rangesError && <div className={styles.error}>{rangesError}</div>}
      </Section>
      <ReciterSettings
        reciter={mediaSettings.reciter}
        onSettingsUpdate={onSettingsUpdate}
        reciters={reciters}
      />
      <TranslationSettingsSection
        translations={mediaSettings.translations}
        onSettingsUpdate={onSettingsUpdate}
      />
    </div>
  );
};

export default AudioTab;