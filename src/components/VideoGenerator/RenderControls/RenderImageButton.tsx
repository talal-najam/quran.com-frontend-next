import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import Button from '@/dls/Button/Button';
import { RenderStatus, useGenerateMediaFile } from '@/hooks/auth/useGenerateMediaFile';
import IconDownload from '@/icons/download.svg';
import IconRender from '@/icons/slow_motion_video.svg';
import { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import { isLoggedIn } from '@/utils/auth/login';
import { getLoginNavigationUrl, getQuranMediaCreatorNavigationUrl } from '@/utils/navigation';

type Props = {
  inputProps: any;
  getCurrentFrame: () => void;
};

const RenderImageButton: React.FC<Props> = ({ inputProps, getCurrentFrame }) => {
  const { t } = useTranslation('quran-media-creator');
  const { renderMedia, state } = useGenerateMediaFile(inputProps);
  const router = useRouter();

  const isInitOrInvokingOrError = [
    RenderStatus.INIT,
    RenderStatus.INVOKING,
    RenderStatus.ERROR,
  ].includes(state.status);

  const isRenderingOrDone = [RenderStatus.RENDERING, RenderStatus.DONE].includes(state.status);

  const isRendering = state.status === RenderStatus.RENDERING;
  return (
    <div>
      {isInitOrInvokingOrError && (
        <>
          <Button
            prefix={<IconRender />}
            isDisabled={state.status === RenderStatus.INVOKING}
            isLoading={state.status === RenderStatus.INVOKING}
            onClick={() => {
              if (isLoggedIn()) {
                renderMedia(MediaType.IMAGE, { frame: getCurrentFrame() });
              } else {
                router.replace(getLoginNavigationUrl(getQuranMediaCreatorNavigationUrl()));
              }
            }}
          >
            {t('render-image')}
          </Button>
          {state.status === RenderStatus.ERROR && <div>{state.error.message}</div>}
        </>
      )}
      {isRenderingOrDone && (
        <>
          <Button
            prefix={<IconDownload />}
            isDisabled={isRendering}
            isLoading={isRendering}
            href={state.status === RenderStatus.DONE ? state.url : ''}
          >
            {t('download-video')}
          </Button>
        </>
      )}
    </div>
  );
};

export default RenderImageButton;