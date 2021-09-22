import React from "react";

export default class Workspace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editingItem: null,
            editingText: ''
        }
    }

    handleClick = (item, index) => {
        console.log(`Edit list item ${item} at index ${index}`)
        // if (event.detail === 2) {
        //     console.log(`Edit list item ${item} at index ${index}`)
        // }
    }

    render() {
        const { currentList, renameItemCallback } = this.props;
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
                                if (index !== this.state.editingItem) {
                                    return (
                                        <div
                                            id={`item-${index}`}
                                            draggable="true"
                                            onDragStart={(e) => {
                                                window.dragIndex = index;
                                                console.log(`drag called from at index ${index}`)
                                            }}
                                            onDrop={(e) => {
                                                console.log(`dragged from ${window.dragIndex} to ${index}`)
                                                this.props.moveItemCallback(window.dragIndex, index)
                                            }}
                                            onDragOver={(e) => {
                                                // console.log('drag over')
                                                e.preventDefault();
                                            }}
                                            onClick={(e) => {
                                                if (e.detail === 2) {
                                                    this.setState({
                                                        editingItem: index,
                                                        editingText: item
                                                    })
                                                    console.log(`Edit list item ${item} at index ${index}`)
                                                }
                                            }}
                                            className="top5-item"
                                        >
                                            {item}
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div
                                            id={`item-${index}`}
                                            className="top5-item"
                                        >
                                            <input
                                                type="text"
                                                value={this.state.editingText}
                                                onChange={(e) => {
                                                    // this.props.updateItem(e.target.value, index)
                                                    this.setState({
                                                        editingText: e.target.value
                                                    })
                                                }}
                                                onBlur={() => {
                                                    renameItemCallback(this.state.editingText, index)
                                                    this.setState({
                                                        editingItem: null,
                                                        editingText: ''
                                                    })
                                                }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        renameItemCallback(this.state.editingText, index)
                                                        this.setState({
                                                            editingItem: null,
                                                            editingText: ''
                                                        })
                                                    }
                                                }}
                                            />
                                        </div>
                                    )
                                }
                            }) : null
                        }
                    </div>
                </div>
            </div>
        )
    }
}