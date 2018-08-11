// @flow
import _ from 'lodash'
import React, { Component } from 'react';
import { XcButton, XcButtonGroup, XcCheckbox, XcForm, XcGrid, XcInputText, XcInputNumber, XcLabel } from 'shared/component';
import { XcMessage, XcOption, XcRadio, XcSelect } from 'shared/component';
import { Language, xlate } from 'shared/util/lang';
import { isNullOrEmpty } from 'shared/util/stringUtil';
import { Exchange } from 'app/model/staticdata'
import { OrderRequest } from 'app/model/order'
import { BuySell } from 'app/model/EnumType'

type Props = {
    exchanges: Exchange[]
}

type State = {
    orderRequest: OrderRequest
}

export class OrderInputForm extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        const orderRequest = OrderRequest.newInstance()
        orderRequest.exchangeOid = props.exchanges[0].exchangeOid
        this.state = {
            orderRequest: orderRequest
        }
    }    

    render() {
        const { exchanges } = this.props
        const { orderRequest } = this.state

        const exchangeOpt = _.map(exchanges, (e) => (
            new XcOption(e.exchangeCode, e.shortNameDefLang)
        ))
        const buySellOpt = _.map(BuySell.enumValues, (e) => (
            new XcOption(e.value, xlate(`enum.buySell.${e.value}`))
        ))

        return (
            <XcForm model={orderRequest} name="orderInputForm" onModelUpdate={this.handleModelUpdate} subLabelColor="teal">
                <XcSelect name="exchangeCode" options={exchangeOpt} validation={{ required: true }} />
                <XcSelect name="side" options={buySellOpt} validation={{ required: true }} />
                <XcInputText name="instrumentCode" subLabel="Hi Hi" validation={{ required: true }} />
                <XcInputNumber name="price" />
                <XcInputNumber name="quantity" />
                <XcButtonGroup>
                    <XcButton onClick={this.handleClick} label="#orderInputForm.reset" />
                    <XcButton disabled={isNullOrEmpty(orderRequest.exchangeOid) || isNullOrEmpty(orderRequest.stockCode)} primary onClick={this.handleClick} label="#orderInputForm.confirm" />
                </XcButtonGroup>
            </XcForm>
        )
    }

    handleModelUpdate = (model: Object) => {
        this.setState({
            orderRequest: OrderRequest.fromJson(model)
        })
    }
    
    handleClick = (event: SyntheticMouseEvent<>) => {
    }    
}
