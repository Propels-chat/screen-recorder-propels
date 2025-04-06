import React, { useState, useRef, useContext, useEffect } from "react";

// Context
import { contentStateContext } from "../../context/ContentState";

const RegionDimensions = () => {
  const [contentState, setContentState] = useContext(contentStateContext);

  const handleWidth = (e) => {
    let value = e.target.value;
    if (isNaN(value)) {
      return;
    }
    if (value < 0) {
      return;
    }

    // Calculate height to maintain 9:16 ratio
    const height = Math.round(value * (16 / 9));

    setContentState((prevContentState) => ({
      ...prevContentState,
      regionWidth: value,
      regionHeight: height,
      fromRegion: false,
    }));
    chrome.storage.local.set({
      regionWidth: value,
      regionHeight: height,
    });
  };

  const handleHeight = (e) => {
    let value = e.target.value;
    if (isNaN(value)) {
      return;
    }
    if (value < 0) {
      return;
    }

    // Calculate width to maintain 9:16 ratio
    const width = Math.round(value * (9 / 16));

    setContentState((prevContentState) => ({
      ...prevContentState,
      regionHeight: value,
      regionWidth: width,
      fromRegion: false,
    }));
    chrome.storage.local.set({
      regionHeight: value,
      regionWidth: width,
    });
  };

  return (
    <div className="region-dimensions">
      <div className="region-input">
        <label htmlFor="region-width" style={{ display: "none" }}>
          {chrome.i18n.getMessage("regionWidthLabel")}
        </label>
        <input
          id="region-width"
          onChange={(e) => handleWidth(e)}
          onBlur={(e) => {
            if (e.target.value === "") {
              // Default width from ContentState.jsx
              const defaultWidth = 414;
              const defaultHeight = 736;

              setContentState((prevContentState) => ({
                ...prevContentState,
                regionWidth: defaultWidth,
                regionHeight: defaultHeight,
                fromRegion: false,
              }));
              chrome.storage.local.set({
                regionWidth: defaultWidth,
                regionHeight: defaultHeight,
              });
            }
          }}
          value={contentState.regionWidth}
        />
        <span>W</span>
      </div>
      <div className="region-input">
        <label htmlFor="region-height" style={{ display: "none" }}>
          {chrome.i18n.getMessage("regionHeightLabel")}
        </label>
        <input
          id="region-height"
          onChange={(e) => handleHeight(e)}
          onBlur={(e) => {
            if (e.target.value === "") {
              // Default width from ContentState.jsx
              const defaultWidth = 414;
              const defaultHeight = 736;

              setContentState((prevContentState) => ({
                ...prevContentState,
                regionHeight: defaultHeight,
                regionWidth: defaultWidth,
                fromRegion: false,
              }));
              chrome.storage.local.set({
                regionHeight: defaultHeight,
                regionWidth: defaultWidth,
              });
            }
          }}
          value={contentState.regionHeight}
        />
        <span>H</span>
      </div>
    </div>
  );
};

export default RegionDimensions;
