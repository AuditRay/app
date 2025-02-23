'use client';

import type { Breakpoint } from '@mui/material/styles';

import { merge } from 'es-toolkit';

import Alert from '@mui/material/Alert';


import { Logo } from '@/components/logo';

import { SimpleCompactContent } from './content';
import { MainSection } from '@/layouts/core';
import { LayoutSection } from '@/layouts/core';
import { HeaderSection } from '@/layouts/core';

import type { SimpleCompactContentProps } from './content';
import type { MainSectionProps } from '@/layouts/core';
import type { HeaderSectionProps } from '@/layouts/core';
import type { LayoutSectionProps } from '@/layouts/core';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type SimpleLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
    content?: SimpleCompactContentProps & { compact?: boolean };
  };
};

export function SimpleLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: SimpleLayoutProps) {
  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = { container: { maxWidth: false } };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: <Logo />,
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => {
    const { compact, ...restContentProps } = slotProps?.content ?? {};

    return (
      <MainSection {...slotProps?.main}>
        {compact ? (
          <SimpleCompactContent layoutQuery={layoutQuery} {...restContentProps}>
            {children}
          </SimpleCompactContent>
        ) : (
          children
        )}
      </MainSection>
    );
  };

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ '--layout-simple-content-compact-width': '448px', ...cssVars }}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}
