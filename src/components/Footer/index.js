import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'

import { Link } from '../../theme'
import SVGDiscord from '../../assets/svg/SVGDiscord'
import SVGTelegram from '../../assets/svg/SVGTelegram'

const FooterFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const FooterElement = styled.div`
  margin: 1.25rem;
  display: flex;
  min-width: 0;
  display: flex;
  align-items: center;
`

const Title = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.uniswapPink};

  :hover {
    cursor: pointer;
  }
  #link {
    text-decoration-color: ${({ theme }) => theme.uniswapPink};
  }

  #title {
    display: inline;
    font-size: 0.825rem;
    margin-right: 12px;
    font-weight: 400;
    color: ${({ theme }) => theme.uniswapPink};
    :hover {
      color: ${({ theme }) => darken(0.2, theme.uniswapPink)};
    }
  }
`

const DiscordImg = styled.div`
  height: 18px;

  svg {
    fill: ${({ theme }) => theme.uniswapPink};
    height: 28px;
  }
`

const TelegramImg = styled.div`
  height: 18px;
  margin-left: 5px;
  svg {
    fill: ${({ theme }) => theme.uniswapPink};
    height: 22px;
  }
`

export default function Footer() {
  return (
    <FooterFrame>
      <FooterElement>
        <Title>
          <Link
            id="link"
            rel="noopener noreferrer"
            target="_blank"
            href="https://medium.com/@pine_eth/pine-finance-an-amm-orders-engine-525fe1f1b1eb"
          >
            <h1 id="title">About</h1>
          </Link>
          <Link id="link" rel="noopener noreferrer" target="_blank" href="https://github.com/pine-finance/">
            <h1 id="title">Code</h1>
          </Link>
          <Link id="link" rel="noopener noreferrer" target="_blank" href="https://etherscan.io/address/0xD412054ccA18A61278ceD6F674A526A6940eBd84">
            <h1 id="title">Contract</h1>
          </Link>
          <Link id="link" rel="noopener noreferrer" target="_blank" href="https://v1.uniswapex.io/">
            <h1 id="title">UniswapEx</h1>
          </Link>
          <Link id="link" rel="noopener noreferrer" target="_blank" href="https://gitcoin.co/grants/765/uniswapex-v2">
            <h1 id="title">Donate ❤</h1>
          </Link>
          <Link id="link" rel="noopener noreferrer" target="_blank" href="https://discord.gg/w6JVcrg">
            <DiscordImg>
              <SVGDiscord />
            </DiscordImg>
          </Link>
          <Link id="link" rel="noopener noreferrer" target="_blank" href="https://t.me/UniswapEX">
            <TelegramImg>
              <SVGTelegram />
            </TelegramImg>
          </Link>
        </Title>
      </FooterElement>
    </FooterFrame>
  )
}
