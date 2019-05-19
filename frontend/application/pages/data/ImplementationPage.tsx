import * as React from "react";

const requestElevator = (floor: number) =>
  () => fetch("http://localhost:3000/r", {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({floor: floor}),
  })

const poll = (f: Function) =>
  setInterval(() =>
    fetch("http://localhost:3000/e")
    .then(a => a.json())
    .then(a => f(a))
    , 300)

interface State {
  floors: Array<{floor: number, requesting: boolean}>;
  elevators: Array<{no: number, idle: boolean, destination: number, floor: number}>;
}

class ImplementationPage extends React.Component<{}, State> {

  constructor(props: {}) {
    super(props)
    this.state = {
      floors: [],
      elevators: [],
    }
  }

  public componentDidMount() {
    poll((s: State) => this.setState(s))
  }
  public render() {
    const tableStyle = { width: "100%" }
    const floors = this.state.floors.map(f => {
      return (
        <tr key={f.floor}>

        {this.state.elevators.map(e => <td>{e.floor == f.floor && e.no}</td>)}

        <td><button onClick={requestElevator(f.floor)}>
        {f.floor}
        </button>
        </td>
        </tr>
      )
    })
    if(this.state)
      return (
        <>
        <h2>Elevators</h2>
        <table style={tableStyle}>
        {floors}
        </table>
        <p>
        {JSON.stringify(this.state)}
        </p>
        </>
      )
    else
      return <></>

  }
}

export default ImplementationPage;

