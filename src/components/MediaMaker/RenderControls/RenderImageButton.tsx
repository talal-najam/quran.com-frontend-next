import React, { useEffect } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import MonthlyMediaFileCounter from './MonthlyMediaFileCounter';

import Button from '@/dls/Button/Button';
import { RenderStatus, useGenerateMediaFile } from '@/hooks/auth/media/useGenerateMediaFile';
import IconDownload from '@/icons/download.svg';
import IconRender from '@/icons/slow_motion_video.svg';
import { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import { isLoggedIn } from '@/utils/auth/login';
import { getLoginNavigationUrl, getQuranMediaMakerNavigationUrl } from '@/utils/navigation';

type Props = {
  inputProps: any;
  getCurrentFrame: () => void;
  isFetching: boolean;
};

const RenderImageButton: React.FC<Props> = ({ inputProps, getCurrentFrame, isFetching }) => {
  const { t } = useTranslation('quran-media-maker');
  const { renderMedia, state } = useGenerateMediaFile(inputProps);

  const router = useRouter();
  const downloadButtonRef = React.useRef<HTMLParagraphElement>();

  const isInitOrInvokingOrError = [
    RenderStatus.INIT,
    RenderStatus.INVOKING,
    RenderStatus.ERROR,
  ].includes(state.status);

  const isRenderingOrDone = [RenderStatus.RENDERING, RenderStatus.DONE].includes(state.status);

  // listen to state changes and download the file when it's done
  useEffect(() => {
    if (state?.status === RenderStatus.DONE) {
      downloadButtonRef.current.click();
    }
  }, [state?.status]);

  const isRendering = state.status === RenderStatus.RENDERING;
  return (
    <div>
      <MonthlyMediaFileCounter type={MediaType.IMAGE} />
      {isInitOrInvokingOrError && (
        <>
          <Button
            prefix={<IconRender />}
            isDisabled={isFetching || state.status === RenderStatus.INVOKING}
            isLoading={isFetching || state.status === RenderStatus.INVOKING}
            onClick={() => {
              if (isLoggedIn()) {
                renderMedia(MediaType.IMAGE, { frame: getCurrentFrame() });
              } else {
                router.replace(getLoginNavigationUrl(getQuranMediaMakerNavigationUrl()));
              }
            }}
          >
            {t('render-image')}
          </Button>
          {state.status === RenderStatus.ERROR && (
            <div>{state?.error?.message || t('common:error.general')}</div>
          )}
        </>
      )}
      {isRenderingOrDone && (
        <>
          <Button
            prefix={<IconDownload />}
            isDisabled={isFetching || isRendering}
            isLoading={isFetching || isRendering}
            href={state.status === RenderStatus.DONE ? state.url : ''}
          >
            <p ref={downloadButtonRef}>{t('download-video')}</p>
          </Button>
        </>
      )}
    </div>
  );
};

export default RenderImageButton;