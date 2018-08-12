import React, { Component, Fragment } from 'react'
import styled from 'styled-components'
import { mapValues, isString, keys } from 'lodash'
import Markdown from 'components/Markdown'
import Banner from 'components/Banner'
import Button from 'components/Button'
import Heading from '../Heading'
import DataStructure from './DataStructure'
import MessageEvents from './MessageEvents'
import WebhookEvents from './WebhookEvents'
import SubstitutionReferenceContext from 'components/api/SubstitutionReferenceContext'

import HttpHeading from 'components/api/components/HttpHeading'
import axios from 'axios'
import { debounce } from 'lodash'
import { rgba, lighten } from 'polished'
import { keyframes } from 'styled-components'
import { grayscale, color, shadow } from 'utils/colors'
import { monospace, weight } from 'utils/fonts'


const EmptyHeader = styled.th`
  padding: 0;
`

const TableOverflow = styled.div`
  overflow: scroll;
`

const Textarea = styled.textarea`
  ${monospace}
  color: ${grayscale('dark')};
  width: 100%;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  box-sizing: content-box;
  padding: .5rem;
  min-height: 100px;
  white-space: nowrap;
  overflow: auto;
`

const Results = styled.div`
  ${monospace}
  color: ${grayscale('dark')};
  white-space: pre;
  height: 100%;
  outline: 0;
  overflow: auto;
  padding: .5rem;
`

const Errors = styled(({ errors, ...props }) => (
  <div {...props}>
    {errors.map(error => {
      return <div key={error.message}>{JSON.stringify(error, null, 2)}</div>
    })}
  </div>
))`
  ${monospace}
  background: #FCF2F4;
  color: #ec4852;
  white-space: pre;
  overflow: auto;
  padding: .5rem;
`

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`

// show the loading background after half a second
const Spinner = styled.div`
  z-index: 1;
  position: absolute;
  transform: translateZ(0);
  top: 0.55rem;
  right: 0.5rem;
  border-style: solid;
  border-width: 0.2em;
  border-color: ${color('blue')};
  border-color: ${rgba(grayscale('medium'), 0.25)};
  border-left-color: transparent;
  padding: 0;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: ${rotate360} 0.7s infinite linear;
  opacity: 0;
  transition: opacity 0.15s;
  ${props => props.visible && `opacity: 1;`};
`

const Trigger = styled.div`
  font-size: .833333333rem;
  font-weight: ${weight('medium')};
  border-radius: 2px;
  padding: 0.25rem .5rem;
  color: ${grayscale('medium')};
  margin-right: .5rem;
  cursor: pointer;
  border: 1px solid ${grayscale(7)};

  ${props => props.isActive && `
    background: ${grayscale('white')};
    box-shadow: ${shadow(1)};
  `}
`
const Tabs = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
`
const Tab = styled.div`
  width: 100%;
  display: none;
  ${props => props.isActive && `
    display: flex;
  `}

`

class REPL extends Component {
  constructor(props) {
    super(props)

    // calculate the inital code height
    const htmlLines = props.html.split(/\r\n|\r|\n/).length
    const substitutionDataLines = props.substitution_data.split(/\r\n|\r|\n/).length

    // get the tallest height possible
    const codeHeight = 16 * (htmlLines > substitutionDataLines ? htmlLines : substitutionDataLines)

    this.state = {
      code: {
        substitution_data: props.substitution_data,
        html: props.html,
      },
      results: { html: '' },
      errors: [],
      loading: true,
      activeTab: props.activeTab || 0,
      codeHeight
    }
  }

  setREPL = (code, { debounce }) => {
    const newCode = {
      ...this.state.code,
      ...code,
    }

    this.setState({ code: newCode, loading: true })

    if (debounce) {
      this.debouncedFetchPreview({ code: newCode })
    } else {
      this.fetchPreview({ code: newCode })
    }
  }

  // request a preview from the API
  fetchPreview = async ({ code }) => {
    try {
      const { data } = await axios.post(
        '/.netlify/functions/substitution-repl',
        code
      )
      const { results, errors = [] } = data

      this.setState({ results, errors, loading: false })
    } catch (e) {
      this.setState({
        errors: [{ message: e.message }],
        loading: false,
      })
    }
  }

  debouncedFetchPreview = debounce(this.fetchPreview, 500)

  componentDidMount() {
    this.fetchPreview(this.state)
  }

  render() {
    return (
      <div className="block" style={{ display: `flex` }}>
        <div style={{
          width: `60%`, display: `flex`, flexDirection: `column`,
          background: grayscale('light'),
          borderRadius: `4px 0 0 4px`,
          border: `1px solid ${grayscale(8)}`
        }}>
          <div style={{
            background: grayscale('light'),
            padding: `.5rem`,
            display: `flex`
          }}>
            <Trigger
              isActive={this.state.activeTab === 0}
              onClick={() => this.setState({ activeTab: 0 })}
            >
              HTML
            </Trigger>
            <Trigger
              isActive={this.state.activeTab === 1}
              onClick={() => this.setState({ activeTab: 1 })}
            >
              Data
            </Trigger>

          </div>
          <Tabs>
            <Tab isActive={this.state.activeTab === 0}>
              <Textarea
                style={{ height: this.state.codeHeight }}
                value={this.state.code.html}
                onChange={event =>
                  this.setREPL(
                    {
                      html: event.target.value,
                    },
                    { debounce: true }
                  )
                }
              />
            </Tab>
            <Tab isActive={this.state.activeTab === 1}>
              <Textarea
                style={{ height: this.state.codeHeight }}
                value={this.state.code.substitution_data}
                onChange={event =>
                  this.setREPL(
                    {
                      substitution_data: event.target.value,
                    },
                    { debounce: true }
                  )
                }
              />
            </Tab>
          </Tabs>
        </div>
        <div style={{
          width: `40%`,
          border: `1px solid ${grayscale(8)}`,
          borderLeft: 0,
          borderRadius: `0 4px 4px 0`,
          display: `flex`
        }}>
          <Spinner visible={this.state.loading} />
          {'' /*<div style={{
            background: grayscale('light'),
            borderBottom: `1px solid ${grayscale(8)}`,
            padding: `.76rem`
          }}>Result</div>*/}
          {this.state.errors.length > 0 ? (
            <Errors errors={this.state.errors} />
          ) : (
            <Results>{this.state.results.html}</Results>
          )}
        </div>
      </div>
)
  }
}

// we add in the displayName for all these components since it gets dropped somewhere in the client-side render in firefox
const components = mapValues(
  {
    h2(props) {
      return <Heading level={2} {...props} />
    },
    h3(props) {
      return <Heading level={3} {...props} />
    },
    h4(props) {
      return <Heading level={4} {...props} />
    },
    h5(props) {
      return <Heading level={5} {...props} />
    },
    h6(props) {
      return <Heading level={6} {...props} />
    },
    ul(props) {
      return (
        <div className="block">
          <ul {...props} />
        </div>
      )
    },
    ol(props) {
      return (
        <div class="block">
          <ul {...props} />
        </div>
      )
    },
    table(props) {
      return (
        <div className="block">
          <TableOverflow>
            <table {...props} />
          </TableOverflow>
        </div>
      )
    },
    pre(props) {
      return (
        <div className="block">
          <pre {...props} />
        </div>
      )
    },
    p(props) {
      return !hasComponent(props) ? (
        <p {...props} className="block" />
      ) : (
        <Fragment {...props} />
      )
    },
    th(props) {
      return props.children && props.children.length > 0 ? (
        <th {...props} />
      ) : (
        <EmptyHeader />
      )
    },
    banner({ children, status }) {
      return (
        <div className="block">
          <Banner status={status}>
            <p>{children}</p>
          </Banner>
        </div>
      )
    },
    replbutton({ children }) {
      const codeBlocks = children.filter(
        component =>
          component.type &&
          (component.type.displayName || component.type.name === 'pre')
      )

      const getBlockType = (component) => component.props.children[0].props.className.split('language-')[1].trim()

      const jsonBlock = codeBlocks.find((component) => getBlockType(component) === 'json')
      const htmlBlock = codeBlocks.find((component) => getBlockType(component) === 'html')


      const replToString = ({ props: { children } }) => {
        return children
          .map(component => {
            if (isString(component)) {
              return component
            } else if (component.props.children.length > 0) {
              return replToString(component)
            } else {
              return component.props.children[0]
            }
          })
          .join('')
      }

      // default html and substitution data
      const html = htmlBlock ? replToString(htmlBlock) : ''
      let json = jsonBlock ? replToString(jsonBlock) : '{}'
      try {
        json = JSON.stringify(JSON.parse(json), null, 2)
      }
      catch(e) {
        // fallbacks to the broken json
      }

      const isJsonFirst = codeBlocks.length > 0 && getBlockType(codeBlocks[0]) === 'json'

      const replValue = { html, substitution_data: json }

      // set the the second tab to active, if the json block was written first
      return <REPL {...replValue} activeTab={isJsonFirst ? 1 : 0} />

      return (
        <div className="block" style={{ marginBottom: `1rem` }}>
          <SubstitutionReferenceContext.Consumer>
            {data => (
              <Button
                size="small"
                outline
                onClick={() => {
                  data.setREPL(replValue, { debounce: false })
                }}
              >
                Try it
              </Button>
            )}
          </SubstitutionReferenceContext.Consumer>
        </div>
      )
    },
    ...DataStructure,
    ...MessageEvents,
    ...WebhookEvents,
  },
  (component, name) => {
    component.displayName = name

    return component
  }
)

const componentNames = keys(components)
const hasComponent = props =>
  (
    React.Children.map(
      props.children,
      component =>
        component.type &&
        componentNames.includes(
          component.type.displayName || component.type.name
        )
    ) || []
  ).includes(true)

const BlockMarkdown = props => <Markdown components={components} {...props} />

export default BlockMarkdown
