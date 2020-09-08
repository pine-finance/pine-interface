import React from 'react'
import { ethers } from 'ethers'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useWeb3React } from '@web3-react/core'

import { getEtherscanLink } from '../../utils'
import { CurrencySelect, Aligner, StyledTokenName } from '../CurrencyInputPanel'
import TokenLogo from '../TokenLogo'
import ArrowDown from '../../assets/svg/SVGArrowDown'
import { amountFormatter } from '../../utils'
import { useUniswapExContract } from '../../hooks'
import { useTokenDetails } from '../../contexts/Tokens'
import {
  ACTION_PLACE_ORDER,
  ACTION_CANCEL_ORDER,
  useTransactionAdder,
  useOrderPendingState
} from '../../contexts/Transactions'
import { ETH_ADDRESS } from '../../constants'
import { getExchangeRate } from '../../utils/rate'

import './OrderCard.css'

const CancelButton = styled.div`
  color: ${({ selected, theme }) => (selected ? theme.textColor : theme.textColor)};
  padding: 0px 6px 0px 6px;
  font-size: 0.85rem;
`

const Order = styled.div`
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-flow: column nowrap;
  -ms-flex-flow: column nowrap;
  flex-flow: column nowrap;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.05);
  position: relative;
  border-radius: 1.25rem;
  z-index: 1;
  padding: 20px;
  margin-bottom: 40px;
  border: ${({ theme }) => `1px solid ${theme.mercuryGray}`};
  background-color: ${({ theme }) => theme.concreteGray};
`

const Spacer = styled.div`
  flex: 1 1 auto;
`
const WrappedArrowRight = ({ clickable, active, ...rest }) => <ArrowDown {...rest} transform="rotate(-90)" />

const RightArrow = styled(WrappedArrowRight)`
  color: ${({ theme }) => theme.royalGreen};
  width: 0.625rem;
  height: 0.625rem;
  position: relative;
`

export function OrderCard(props) {
  const { t } = useTranslation()
  const { chainId } = useWeb3React()

  const order = props.data.order

  const inputToken = order.inputToken === ETH_ADDRESS.toLowerCase() ? 'ETH' : order.inputToken
  const outputToken = order.outputToken === ETH_ADDRESS.toLowerCase() ? 'ETH' : order.outputToken

  const { symbol: fromSymbol, decimals: fromDecimals } = useTokenDetails(inputToken)
  const { symbol: toSymbol, decimals: toDecimals } = useTokenDetails(outputToken)
  const { state, last } = useOrderPendingState(order)

  const canceling = state === ACTION_CANCEL_ORDER
  const pending = state === ACTION_PLACE_ORDER

  const uniswapEXContract = useUniswapExContract()
  const addTransaction = useTransactionAdder()

  async function onCancel(order, pending) {
    const abiCoder = new ethers.utils.AbiCoder()

    const { module, inputToken, outputToken, minReturn, owner, witness } = order
    uniswapEXContract
      .cancelOrder(
        module,
        inputToken,
        owner,
        witness,
        abiCoder.encode(['address', 'uint256'], [outputToken, minReturn]),
        {
          gasLimit: pending ? 400000 : undefined
        }
      )
      .then(response => {
        addTransaction(response, { action: ACTION_CANCEL_ORDER, order: order })
      })
  }

  const cancelled = order.status === 'cancelled'
  const executed = order.status === 'executed'
  const bought = ethers.utils.bigNumberify(executed ? order.bought : 0)
  const inputAmount = ethers.utils.bigNumberify(order.inputAmount !== '0' ? order.inputAmount : order.creationAmount)
  const minReturn = ethers.utils.bigNumberify(order.minReturn)

  let explorerLink
  if (cancelled || executed) {
    explorerLink = getEtherscanLink(chainId, cancelled ? order.cancelledTxHash : order.executedTxHash, 'transaction')
  } else {
    explorerLink = last ? getEtherscanLink(chainId, last.response.hash, 'transaction') : undefined
  }

  const rateFromTo = getExchangeRate(inputAmount, fromDecimals, minReturn, toDecimals, false)
  const rateToFrom = getExchangeRate(inputAmount, fromDecimals, minReturn, toDecimals, true)

  return (
    <Order className={`order ${order.status}`}>
      <div className="tokens">
        <CurrencySelect selected={true}>
          <Aligner>
            {<TokenLogo address={inputToken} />}
            {<StyledTokenName>{fromSymbol}</StyledTokenName>}
          </Aligner>
        </CurrencySelect>
        <Aligner>
          <RightArrow transform="rotate(-90)" />
        </Aligner>
        <CurrencySelect selected={true}>
          <Aligner>
            {<TokenLogo address={outputToken} />}
            {<StyledTokenName>{toSymbol}</StyledTokenName>}
          </Aligner>
        </CurrencySelect>
        <Spacer />
        {!executed && !cancelled && (
          <CurrencySelect selected={true} disabled={canceling} onClick={() => onCancel(order, pending)}>
            <CancelButton>{canceling ? 'Cancelling ...' : t('cancel')}</CancelButton>
          </CurrencySelect>
        )}
      </div>
      {!executed && !cancelled && (
        <>
          {' '}
          <p>
            {`Sell: ${amountFormatter(inputAmount, fromDecimals, 6)}`} {fromSymbol}
          </p>
          <p>
            {`Receive: ${amountFormatter(minReturn, toDecimals, 6)}`} {toSymbol}
          </p>
          <p>
            {`Rate: ${amountFormatter(rateFromTo, 18, 2)}`} {fromSymbol}/{toSymbol} -{' '}
            {amountFormatter(rateToFrom, 18, 2)} {toSymbol}/{fromSymbol}
          </p>
          <p>
            {last && (
              <a rel="noopener noreferrer" target="_blank" href={explorerLink} className="order-link">
                Pending transaction...
              </a>
            )}
          </p>
        </>
      )}
      {executed && (
        <>
          <p>
            {`Sold: ${amountFormatter(inputAmount, fromDecimals, 6)}`} {fromSymbol}
          </p>
          <p>
            {`Expected: ${amountFormatter(minReturn, toDecimals, 6)}`} {toSymbol}
          </p>
          <p>
            {`Received: ${amountFormatter(bought, toDecimals, 6)}`} {toSymbol}
          </p>
          <p>{`Date: ${new Date(order.updatedAt * 1000).toLocaleDateString()}`}</p>
          <a rel="noopener noreferrer" target="_blank" href={explorerLink} className="order-link">
            Executed
          </a>
        </>
      )}
      {cancelled && (
        <>
          <p>
            {`Sell: ${amountFormatter(inputAmount, fromDecimals, 6)}`} {fromSymbol}
          </p>
          <p>
            {`Expected: ${amountFormatter(minReturn, toDecimals, 6)}`} {toSymbol}
          </p>
          <p>{`Date: ${new Date(order.updatedAt * 1000).toLocaleDateString()}`}</p>
          <a rel="noopener noreferrer" target="_blank" href={explorerLink} className="order-link">
            Cancelled
          </a>
        </>
      )}
    </Order>
  )
}
