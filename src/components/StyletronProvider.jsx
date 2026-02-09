import React from 'react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { LightTheme, BaseProvider, styled } from 'baseui';

const engine = new Styletron();

const customTheme = {
    ...LightTheme,
    typography: {
        ...LightTheme.typography,
        fontFamily: '"UberMoveText", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
        primaryFontFamily: '"UberMoveText", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
};

export default function StyletronWrapper({ children }) {
    return (
        <StyletronProvider value={engine}>
            <BaseProvider theme={customTheme}>
                {children}
            </BaseProvider>
        </StyletronProvider>
    );
}
