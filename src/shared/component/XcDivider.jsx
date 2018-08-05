// @flow
import React, { Component } from 'react';
import { Divider } from 'semantic-ui-react';

type Props = {
}

type State = {
}

export class XcDivider extends React.Component<Props, State> {
    render() {
        return <Divider style={{ marginTop: 0, marginBottom: 0 }} />
    }
}