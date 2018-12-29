// Global Params
const conn_header = [
  'status',
  'laddr',
  'lport',
  'raddr',
  'rport',
];


class ConnectionHeader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let ths = [];
    for (let i = 0; i< conn_header.length; i++){
      ths.push(<th key={conn_header[i]}>{conn_header[i]}<button className={conn_header[i] + '_sort'} onClick={() => this.props.setSort(conn_header[i])} /></th>);
    }

    return (
      <tr>
        {ths}
      </tr>
    );
  }
}


class ConnectionInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let tds = [];
    let classes = [];
    let c = this.props.connection;

    if (c['flag_hidden']) {
      classes.push('hidden');
    }
    for (let i = 0; i< conn_header.length; i++){
      tds.push(<td key={conn_header[i] + i}>{c[conn_header[i]]}</td>);
    }

    return (
      <tr className={classes.join(" ")}>
       {tds}
      </tr>
    );
  }
}


class ConnectionTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ws: null,
      sortflags: [],
      connections: '',
      open: false,
    };
  }

  componentDidMount() {
    var ws = new WebSocket('ws://' + location.host + '/ws');
    ws.onmessage = this.handleMessage.bind(this);
    this.setState({ws: ws});
  }
  componentWillUnmount() {
    this.state.ws.close();
  }

  handleMessage(msg) {
    let data = JSON.parse(msg.data);
    if (data.command = 'update') {
      this.setState({
        connections: data.data,
        open: true,
      });
    }
    this.sortall();
    this.renderConnection();
  }

  handleChange(e) {
    consloe.log('handle change');
    console.log(e);
    this.setState({
        value: e.target.value,
    });
  }

//  handleTouchTap() {
//      this.state.ws.send(this.state.value);
//  }
//  handleRequestClose() {
//      this.setState({
//          open: false,
//      });
//  }
  sortall() {
    for (let i = 0; i < this.state.sortflags.length; i++){
      this.sort(this.state.sortflags[i]);
    }
  }

  sort(sortflag) {
    let lconnections = this.state.connections;
    let indexkey = sortflag[0];
    let flag = sortflag[1];

    if (flag) {
      lconnections.sort(function(a,b){
        if(a[indexkey] < b[indexkey]) return -1;
        if(a[indexkey] > b[indexkey]) return 1;
        return 0;
      });
    } else {
      lconnections.sort(function(a,b){
        if(b[indexkey] < a[indexkey]) return -1;
        if(b[indexkey] > a[indexkey]) return 1;
        return 0;
      });
    }
    this.setState({
      connections: lconnections,
    });
  }

  setSort(indexkey) {
    let lsortflags = [];
    let flag = false;
    for (let i = 0; i < this.state.sortflags.length; i++){
      if (this.state.sortflags[i][0] != indexkey) {
        lsortflags.push(this.state.sortflags[i]);
      } else {
        flag = this.state.sortflags[i][1];
      }
    }
    lsortflags.push([indexkey, !flag]);
    console.log(lsortflags);

    this.setState({
      sortflags: lsortflags,
    });
    console.log(this.state);
  }

  renderConnection() {
    let lines = [];
    for (let i = 0; i < this.state.connections.length; i++){
      lines.push(<ConnectionInfo key={i} connection={this.state.connections[i]} />);
    }

    ReactDOM.render(lines, document.getElementById("connections"));
  }

  render() {
    return (
      <div>
        <table>
          <thead>
            <ConnectionHeader setSort={i => {this.setSort(i)}}/>
          </thead>
          <tbody id="connections">
          </tbody>
        </table>
      </div>
    );
  }
}


// Main Procedure
let connection = [];
let sortflags = {}


function initialize() {
  ReactDOM.render(
    <ConnectionTable sortflags={sortflags}/>,
    document.getElementById("root"));
}

// Run
initialize();
