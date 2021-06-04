export const TEST_1_CONTENT = `
import React from "react";

class MyComponent extends React.Component {
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

export default MyComponent;
`;

export const TEST_1_TAG = ["div", "a", "input"];

export const TEST_1_CLASS = ["test-container", "test-footer", "a-link"];

export const TEST_1_ID = ["a-link", "blo"];
