import { Component, type ReactNode } from 'react'

type Props = {
  fallback: ReactNode
  children: ReactNode
  resetKey?: unknown
}

type State = { hasError: boolean; resetKey: unknown }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetKey: this.props.resetKey }

  static getDerivedStateFromError(): Pick<State, 'hasError'> {
    return { hasError: true }
  }

  // `resetKey` が変わったら境界を自分でリセットする。componentDidUpdate から setState するのではなく
  // props から導くことで、描画が 1 回で済む。
  static getDerivedStateFromProps(props: Props, state: State): State | null {
    return props.resetKey === state.resetKey ? null : { hasError: false, resetKey: props.resetKey }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
