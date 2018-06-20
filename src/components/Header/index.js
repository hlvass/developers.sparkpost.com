import React from 'react'
import styled, { css } from 'styled-components'
import { mediaQuery } from 'utils/breakpoint'
import { grayscale, shadow } from 'utils/colors'

import Logo from './Logo'
import Nav from './Nav'
import NavLink from './NavLink'
import StatusIcon from './StatusIcon'
import Hamburger from './Hamburger'

// prettier-ignore
const Wrapper = styled.header`
  background: ${grayscale('light')};
  transition: background 0.25s, box-shadow 0.25s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 0.833333333rem;
  padding: 1rem 1rem;

  ${props => props.isSticky && css`
    box-shadow: ${shadow(1)};
    background-color: ${grayscale('white')};
  `}

  ${mediaQuery('md', `
    padding: 0 1rem;
  `)}
`

// prettier-ignore
const NavWrapper = styled.div`
  width: 100%;
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  transform: translateY(100%);
  background: ${grayscale('white')};
  transition: .2s cubic-bezier(.1,1,.4,1);
  z-index: -1;
  padding: .5rem 0;

  ${props => !props.isOpen && css`
    transform: translateY(0%);
    overflow: hidden;
  `}

  ${mediaQuery('md', `
    position: relative;
    z-index: 0;
    width: auto;
    transform: translateY(0%);
    flex-grow: 1;
    display: flex;
    height: auto;
    padding: 0;
  `)}
`

class Header extends React.Component {
  constructor(props) {
    super(props)

    this.state = { isOpen: false }
  }

  toggleOpen = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }

  render() {
    const { path, isSticky } = this.props

    return (
      <Wrapper isSticky={isSticky}>
        <Logo />
        <Hamburger isOpen={this.state.isOpen} onClick={this.toggleOpen} />
        <NavWrapper isOpen={this.state.isOpen}>
          <Nav>
            <NavLink to="/api" active={path.startsWith('/api')}>
              API Reference
            </NavLink>
            <NavLink to="https://sparkpost.com/docs">Documentation</NavLink>
            <NavLink to="http://slack.sparkpost.com">Community</NavLink>
          </Nav>
          <Nav secondary>
            <NavLink to="https://status.sparkpost.com" target="_blank">
              <span>
                <StatusIcon /> Status
              </span>
            </NavLink>
            <NavLink to="https://www.sparkpost.com/blog/category/developer">
              Blog
            </NavLink>
            <NavLink to="https://app.sparkpost.com/join">Sign Up</NavLink>
          </Nav>
        </NavWrapper>
      </Wrapper>
    )
  }
}

export default Header
