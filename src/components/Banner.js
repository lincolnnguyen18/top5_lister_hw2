import React from "react";
import EditToolbar from "./EditToolbar";

export default class Banner extends React.Component {
    render() {
        const { title, closeCallback, closeEnabled, undoEnabled, redoEnabled, undoCallback, doCallback } = this.props;
        return (
            <div id="top5-banner">
                {title}
                <EditToolbar
                    closeCallback={closeCallback}
                    closeEnabled={closeEnabled}
                    undoEnabled={undoEnabled}
                    redoEnabled={redoEnabled}
                    undoCallback={undoCallback}
                    doCallback={doCallback}
                    />
            </div>
        );
    }
}