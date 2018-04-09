import React from 'React'
import styled from 'styled-components'

const ContainerOuter = styled.div`
  padding: 24px;
  ${props => props.background && 'background-color: ' + props.background + ';'};
`

const ContainerInner = styled.div`
  margin-right: auto;
  margin-left: auto;
  padding-left: 15px;
  padding-right: 15px;

  @media (min-width: 768px) {
    width: 750px;
  }

  @media (min-width: 992px) {
    width: 970px;
  }

  @media (min-width: 1200px) {
    width: 1170px;
  }
`

const Container = props => (
  <ContainerOuter className={props.className} background={props.background}>
    <ContainerInner>{props.children}</ContainerInner>
  </ContainerOuter>
)

const Row = styled.div`
  font-size: 14px;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
`

const Column = styled.div`
  width: ${props => props.xs / 12 * 100}%;
  padding: 0 15px;

  @media (min-width: 768px) {
    width: ${props => props.sm / 12 * 100}%;
    ${props =>
      props.smOffset && 'margin-left: ' + props.smOffset / 12 * 100 + '%;'};
  }

  @media (min-width: 992px) {
    width: ${props => props.md / 12 * 100}%;
    ${props =>
      props.mdOffset && 'margin-left: ' + props.mdOffset / 12 * 100 + '%;'};
  }

  @media (min-width: 1200px) {
    width: ${props => props.lg / 12 * 100}%;
    ${props =>
      props.lgOffset && 'margin-left: ' + props.lgOffset / 12 * 100 + '%;'};
  }
`

export { Container, Row, Column }
