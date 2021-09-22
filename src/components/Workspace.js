import React from "react";

export default class Workspace extends React.Component {
    render() {
        const { currentList } = this.props;
        return (
            <div id="top5-workspace">
                <div id="workspace-edit">
                    <div id="edit-numbering">
                        <div className="item-number">1.</div>
                        <div className="item-number">2.</div>
                        <div className="item-number">3.</div>
                        <div className="item-number">4.</div>
                        <div className="item-number">5.</div>
                    </div>
                    <div id="edit-items">
                        {/* <div id='item-1' class="top5-item"></div>
                        <div id='item-2' class="top5-item"></div>
                        <div id='item-3' class="top5-item"></div>
                        <div id='item-4' class="top5-item"></div>
                        <div id='item-5' class="top5-item"></div> */}
                        {
                            currentList ? currentList.items.map((item, index) => {
                                return (
                                    <div id={`item-${index}`} className="top5-item">{item}</div>
                                )
                            }) : null
                        }
                    </div>
                </div>
            </div>
        )
    }
}