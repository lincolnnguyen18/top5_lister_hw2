import React from "react";

export default class EditToolbar extends React.Component {
    render() {
        const { closeCallback, undoEnabled, redoEnabled, closeEnabled, undoCallback, doCallback } =  this.props;
        return (
            <div id="edit-toolbar">
                <div 
                    id='undo-button' 
                    className={`top5-button ${undoEnabled ? '' : 'top5-button-disabled'}`}
                    onClick={undoCallback}
                >
                        &#x21B6;
                </div>
                <div
                    id='redo-button'
                    className={`top5-button ${redoEnabled ? '' : 'top5-button-disabled'}`}
                    onClick={doCallback}
                >
                        &#x21B7;
                </div>
                <div
                    id='close-button'
                    className={`top5-button ${closeEnabled ? '' : 'top5-button-disabled'}`}
                    onClick={closeCallback}
                >
                        &#x24E7;
                </div>
            </div>
        )
    }
}