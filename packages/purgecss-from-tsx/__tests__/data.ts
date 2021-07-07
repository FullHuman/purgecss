export const TEST_1_CONTENT = `
import PropTypes from "prop-types";
import React from "react";

type MyComponentProps = {
  login: any;
};

type MyComponentState = {
  username: string;
  password: string;
};

class MyComponent extends React.Component<MyComponentProps, MyComponentState> {
  static propTypes: any;

  render() {
    return (
      <React.Fragment>
        <div className="test-container">Well</div>
        <div className="test-footer" id="an-id"></div>
        <a href="#" id="a-link" className="a-link"></a>
        <input id="blo" type="text" disabled/>
      </React.Fragment>
    );
  }
}

MyComponent.propTypes = {
    login: PropTypes.func.isRequired
};

export default MyComponent;
`;

export const TEST_1_TAG = ["div", "a", "input"];

export const TEST_1_CLASS = ["test-container", "test-footer", "a-link"];

export const TEST_1_ID = ["a-link", "blo"];
