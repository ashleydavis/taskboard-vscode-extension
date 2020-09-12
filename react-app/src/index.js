import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import InteractorFactory from './Interaction/InteractorFactory';
import Board from 'react-trello';

const data = require("./data.json");

const Interactor = InteractorFactory.create();

class Index extends React.Component {

  constructor(props) {
    super(props);
    this.state = { directoryInfo: "" };
  }

  updateFilesToDisplay() {
    Interactor.getDirectoryInfo(directoryInfo => {
      this.setState({ directoryInfo: directoryInfo });
    })
  }

  render() {
    return <>
        <Board data={data} />
    </>
  }
}

ReactDOM.render(<Index />, document.getElementById("index"));